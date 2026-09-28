"""Shared app news, with branch-owned editing and a legacy-compatible feed."""
import html
import re
import uuid
from datetime import date, datetime, timezone
from html.parser import HTMLParser
from urllib.parse import urlparse

from boto3.dynamodb.conditions import Attr

MAX_IMAGE_BYTES = 8 * 1024 * 1024
IMAGE_TYPES = {'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp'}
PUBLIC_FIELDS = ('id', 'image', 'category', 'date', 'author', 'title', 'description', 'content')


class NewsError(Exception):
    def __init__(self, status_code, message):
        self.status_code, self.message = status_code, message
        super().__init__(message)


def https_url(value):
    parsed = urlparse(value)
    return parsed.scheme == 'https' and bool(parsed.hostname) and not parsed.username and not parsed.password


class SafeHTML(HTMLParser):
    tags = {'p', 'h2', 'h3', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'br', 'img', 'a', 'blockquote', 'video', 'source'}
    hidden_tags = {'script', 'style', 'iframe', 'object', 'svg'}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts, self.hidden = [], 0

    def handle_starttag(self, tag, attrs):
        if tag in self.hidden_tags:
            self.hidden += 1
        if self.hidden or tag not in self.tags:
            return
        safe = []
        for key, value in attrs:
            if key == 'alt' and tag == 'img':
                safe.append(f'alt="{html.escape(value or "", quote=True)}"')
            if ((key == 'href' and tag == 'a') or (key == 'src' and tag in {'img', 'video', 'source'})) and value and https_url(value):
                safe.append(f'{key}="{html.escape(value, quote=True)}"')
        if tag == 'video':
            safe.append('controls')
        if tag == 'a':
            safe.append('rel="noopener noreferrer"')
        self.parts.append('<' + tag + (' ' + ' '.join(safe) if safe else '') + '>')

    def handle_endtag(self, tag):
        if tag in self.hidden_tags:
            self.hidden = max(0, self.hidden - 1)
            return
        if not self.hidden and tag in self.tags and tag not in {'br', 'img', 'source'}:
            self.parts.append(f'</{tag}>')

    def handle_data(self, data):
        if not self.hidden:
            self.parts.append(html.escape(data))


def content_html(body, content_format):
    if content_format == 'text':
        return ''.join('<p>' + html.escape(p).replace('\n', '<br>') + '</p>' for p in re.split(r'\n\s*\n', body) if p.strip())
    if content_format != 'html':
        raise NewsError(400, 'Choose plain text or HTML for the article.')
    parser = SafeHTML()
    parser.feed(body)
    parser.close()
    result = ''.join(parser.parts)
    if not re.sub('<[^>]+>', '', result).strip():
        raise NewsError(400, 'Please enter article text.')
    return result


def required_text(payload, field, limit):
    value = payload.get(field)
    if not isinstance(value, str) or not value.strip() or len(value.encode('utf-8')) > limit:
        raise NewsError(400, f'{field} is required and must be at most {limit} bytes.')
    return value.strip()


class NewsStore:
    def __init__(self, table, s3, bucket):
        self.table, self.s3, self.bucket = table, s3, bucket

    def all_items(self):
        paginator = self.table.meta.client.get_paginator('scan')
        items = []
        for page in paginator.paginate(TableName=self.table.name, ConsistentRead=True):
            items.extend(page.get('Items', []))
        return sorted(items, key=lambda p: (p.get('publishDate', ''), p.get('createdAt', ''), p['id']), reverse=True)

    def image_url(self, item):
        key = item.get('imageKey', '')
        if key:
            if not re.fullmatch(r'news/(markham|vaughan)/[a-f0-9-]+\.(jpg|png|webp)', key):
                raise NewsError(500, 'Invalid news image key')
            return self.s3.generate_presigned_url('get_object', Params={'Bucket': self.bucket, 'Key': key}, ExpiresIn=3600)
        return item.get('image', '')

    def public_posts(self):
        posts = []
        for item in self.all_items():
            if item.get('status') != 'published':
                continue
            post = {key: item.get(key, '') for key in PUBLIC_FIELDS}
            post['image'] = self.image_url(item)
            posts.append(post)
            if len(posts) >= 50:
                break
        return posts

    def list_admin(self, branch, super_admin):
        result = []
        for item in self.all_items():
            editable = super_admin or item.get('ownerBranch') == branch
            if editable or item.get('status') == 'published':
                result.append({**item, 'image': self.image_url(item), 'canEdit': editable})
        return result

    def presign(self, payload, branch):
        mime, size = payload.get('contentType'), payload.get('size')
        if mime not in IMAGE_TYPES or type(size) is not int or not 0 < size <= MAX_IMAGE_BYTES:
            raise NewsError(400, 'Choose a JPG, PNG or WebP image up to 8 MB.')
        key = f'news/{branch}/{uuid.uuid4()}.{IMAGE_TYPES[mime]}'
        url = self.s3.generate_presigned_url('put_object', Params={
            'Bucket': self.bucket, 'Key': key, 'ContentType': mime, 'ContentLength': size,
        }, ExpiresIn=300)
        return {'key': key, 'uploadUrl': url, 'viewUrl': self.image_url({'imageKey': key})}

    def save(self, payload, branch, super_admin, post_id=None):
        existing = None
        if post_id:
            existing = self.table.get_item(Key={'id': post_id}, ConsistentRead=True).get('Item')
            if not existing or (not super_admin and existing.get('ownerBranch') != branch):
                raise NewsError(404, 'News article not found.')
            if payload.get('revision') != existing.get('revision'):
                raise NewsError(409, 'This article changed. Reload it before saving.')
        else:
            post_id = required_text(payload, 'id', 36)
            try:
                if str(uuid.UUID(post_id)) != post_id:
                    raise ValueError()
            except ValueError as error:
                raise NewsError(400, 'Invalid article ID.') from error
        item = {field: required_text(payload, field, limit) for field, limit in {
            'title': 200, 'description': 600, 'category': 80, 'author': 100, 'body': 50000,
        }.items()}
        publish_date = payload.get('publishDate', '')
        try:
            parsed = date.fromisoformat(publish_date)
        except (ValueError, TypeError) as error:
            raise NewsError(400, 'Choose a valid publication date.') from error
        if payload.get('status') not in {'draft', 'published'}:
            raise NewsError(400, 'Choose draft or published.')
        image_key = payload.get('imageKey', '')
        # Retain imported cover URLs, but never accept an arbitrary private key or URL.
        image = existing.get('image', '') if existing else ''
        if image_key and (not existing or image_key != existing.get('imageKey')):
            if not isinstance(image_key, str) or not re.fullmatch(rf'news/{branch}/[a-f0-9-]+\.(jpg|png|webp)', image_key):
                raise NewsError(400, 'Upload a cover image for this branch.')
            try:
                obj = self.s3.head_object(Bucket=self.bucket, Key=image_key)
            except self.s3.exceptions.ClientError as error:
                if error.response['Error']['Code'] in {'404', 'NoSuchKey', 'NotFound'}:
                    raise NewsError(400, 'The cover upload has not finished. Please upload it again.') from error
                raise
            if obj.get('ContentType') not in IMAGE_TYPES or not 0 < obj.get('ContentLength', 0) <= MAX_IMAGE_BYTES:
                raise NewsError(400, 'Choose a JPG, PNG or WebP image up to 8 MB.')
        if not image_key and not image:
            raise NewsError(400, 'Please upload a cover image.')
        timestamp = datetime.now(timezone.utc).isoformat()
        content_format = payload.get('contentFormat', 'text')
        item.update({
            'id': post_id, 'content': content_html(item['body'], content_format),
            'contentFormat': content_format, 'publishDate': parsed.isoformat(),
            'date': parsed.strftime('%B ') + str(parsed.day) + parsed.strftime(', %Y'),
            'status': payload['status'], 'imageKey': image_key, 'image': image,
            'ownerBranch': existing['ownerBranch'] if existing else branch,
            'createdAt': existing['createdAt'] if existing else timestamp,
            'updatedAt': timestamp, 'revision': str(uuid.uuid4()),
        })
        condition = Attr('revision').eq(existing['revision']) if existing else Attr('id').not_exists()
        try:
            self.table.put_item(Item=item, ConditionExpression=condition)
        except self.table.meta.client.exceptions.ConditionalCheckFailedException as error:
            raise NewsError(409, 'This article was already saved or changed. Reload the news list before retrying.') from error
        return {**item, 'image': self.image_url(item), 'canEdit': True}
