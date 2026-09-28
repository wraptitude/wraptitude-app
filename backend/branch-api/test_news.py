import json
import os
import unittest
from unittest.mock import MagicMock, patch

from news import NewsError, NewsStore, content_html
from test_orders import app, event


class Conflict(Exception):
    pass


class NewsTests(unittest.TestCase):
    def setUp(self):
        self.table, self.s3 = MagicMock(), MagicMock()
        self.table.name = 'news-table'
        self.table.meta.client.exceptions.ConditionalCheckFailedException = Conflict
        self.table.meta.client.get_paginator.return_value.paginate.return_value = []
        self.s3.generate_presigned_url.return_value = 'https://example.com/signed-image'
        self.s3.head_object.return_value = {'ContentLength': 200, 'ContentType': 'image/png'}
        self.store = NewsStore(self.table, self.s3, 'private-images')
        self.payload = {
            'id': '12345678-1234-4234-8234-123456789012', 'title': 'New service', 'description': 'Our latest update',
            'category': 'News', 'author': 'Wraptitude', 'publishDate': '2026-09-28',
            'body': 'First paragraph.\n\nSecond paragraph.', 'contentFormat': 'text', 'status': 'draft',
            'imageKey': 'news/markham/12345678-1234-4234-8234-123456789012.png',
        }

    def seed(self, **overrides):
        item = {**self.payload, 'createdAt': '2026-09-27T00:00:00Z', 'ownerBranch': 'markham', 'revision': 'original', **overrides}
        self.table.get_item.return_value = {'Item': item}
        return item

    def test_create_checks_uploaded_image_and_stores_safe_html(self):
        result = self.store.save(self.payload, 'markham', False)
        self.assertEqual(result['content'], '<p>First paragraph.</p><p>Second paragraph.</p>')
        self.assertEqual(result['date'], 'September 28, 2026')
        self.assertEqual(result['ownerBranch'], 'markham')
        self.assertEqual(result['status'], 'draft')
        self.s3.head_object.assert_called_once_with(Bucket='private-images', Key=self.payload['imageKey'])
        self.assertIn('ConditionExpression', self.table.put_item.call_args.kwargs)

    def test_no_cross_branch_upload_keys_or_service_images(self):
        for key in ['service/markham/private.png', 'news/vaughan/1234.png', '../private.png']:
            with self.assertRaises(NewsError) as raised:
                self.store.save({**self.payload, 'imageKey': key}, 'markham', False)
            self.assertEqual(raised.exception.status_code, 400)
        self.table.put_item.assert_not_called()

    def test_invalid_fields_and_oversized_files_are_rejected(self):
        for changes in [{'title': ''}, {'body': 'x' * 50001}, {'publishDate': 'bad'}, {'status': 'unknown'}, {'imageKey': ''}, {'id': 'legacy-id'}]:
            with self.subTest(changes=list(changes)), self.assertRaises(NewsError):
                self.store.save({**self.payload, **changes}, 'markham', False)
        self.s3.head_object.return_value = {'ContentLength': 9 * 1024 * 1024, 'ContentType': 'image/png'}
        with self.assertRaises(NewsError):
            self.store.save(self.payload, 'markham', False)
        self.table.put_item.assert_not_called()

    def test_html_cannot_execute_scripts_or_retain_unsafe_urls(self):
        self.assertEqual(content_html('<script>alert(1)</script>\nHello', 'text'), '<p>&lt;script&gt;alert(1)&lt;/script&gt;<br>Hello</p>')
        result = content_html('<script>alert(1)</script><p onclick="evil()">Safe <a href="javascript:evil()">link</a><img src="https://example.com/a.png" onerror="evil()"></p><iframe src="https://evil.com">bad</iframe>', 'html')
        self.assertNotIn('script', result)
        self.assertNotIn('evil', result)
        self.assertNotIn('iframe', result)
        self.assertIn('https://example.com/a.png', result)

    def test_other_branch_cannot_edit_or_read_private_drafts(self):
        self.seed(ownerBranch='vaughan')
        with self.assertRaises(NewsError) as raised:
            self.store.save({**self.payload, 'revision': 'original'}, 'markham', False, self.payload['id'])
        self.assertEqual(raised.exception.status_code, 404)
        with patch.object(self.store, 'all_items', return_value=[self.seed(ownerBranch='vaughan')]):
            self.assertEqual(self.store.list_admin('markham', False), [])
        self.table.put_item.assert_not_called()

    def test_only_super_admin_edits_imported_global_articles(self):
        self.seed(ownerBranch='global', image='https://example.com/legacy.png', imageKey='')
        changes = {**self.payload, 'revision': 'original', 'imageKey': ''}
        with self.assertRaises(NewsError):
            self.store.save(changes, 'markham', False, self.payload['id'])
        result = self.store.save(changes, 'markham', True, self.payload['id'])
        self.assertEqual(result['ownerBranch'], 'global')
        self.assertEqual(result['image'], 'https://example.com/legacy.png')

    def test_update_keeps_identity_and_rejects_stale_or_racing_saves(self):
        existing = self.seed()
        with self.assertRaises(NewsError) as raised:
            self.store.save(self.payload, 'markham', False, self.payload['id'])
        self.assertEqual(raised.exception.status_code, 409)
        result = self.store.save({**self.payload, 'revision': 'original', 'status': 'published'}, 'markham', False, self.payload['id'])
        self.assertEqual(result['createdAt'], existing['createdAt'])
        self.assertNotEqual(result['revision'], 'original')
        self.table.put_item.side_effect = Conflict()
        with self.assertRaises(NewsError) as raised:
            self.store.save({**self.payload, 'revision': 'original'}, 'markham', False, self.payload['id'])
        self.assertEqual(raised.exception.status_code, 409)

    def test_presign_limits_file_size_type_and_branch_prefix(self):
        for payload in [{'size': 0, 'contentType': 'image/png'}, {'size': 10, 'contentType': 'image/svg+xml'}, {'size': True, 'contentType': 'image/png'}, {'size': 9000000, 'contentType': 'image/png'}]:
            with self.assertRaises(NewsError): self.store.presign(payload, 'markham')
        result = self.store.presign({'size': 1024, 'contentType': 'image/png'}, 'vaughan')
        self.assertTrue(result['key'].startswith('news/vaughan/'))
        args = self.s3.generate_presigned_url.call_args_list[0].kwargs
        self.assertEqual(args['Params']['ContentLength'], 1024)
        self.assertEqual(args['ExpiresIn'], 300)

    def test_public_feed_hides_drafts_and_internal_fields(self):
        published = self.seed(status='published', content='<p>Public</p>')
        with patch.object(self.store, 'all_items', return_value=[published, {**published, 'id': 'private', 'status': 'draft'}]):
            posts = self.store.public_posts()
        self.assertEqual(len(posts), 1)
        self.assertEqual(posts[0]['image'], 'https://example.com/signed-image')
        self.assertNotIn('imageKey', posts[0])
        self.assertNotIn('revision', posts[0])
        self.assertNotIn('ownerBranch', posts[0])

    def test_paginator_includes_all_pages_and_sorts_by_article_date(self):
        self.table.meta.client.get_paginator.return_value.paginate.return_value = [
            {'Items': [{'id': 'old', 'publishDate': '2025-01-01'}]},
            {'Items': [{'id': 'new', 'publishDate': '2026-01-01'}]},
        ]
        self.assertEqual([x['id'] for x in self.store.all_items()], ['new', 'old'])

    def test_news_routes_require_the_existing_branch_authorization(self):
        with patch.dict(os.environ, {'NEWS_TABLE': 'news-table'}), patch.object(app, 'NewsStore') as store:
            for path, method in [('/admin/news', 'GET'), ('/admin/news', 'POST'), ('/admin/news/123', 'PATCH'), ('/admin/news/uploads/presign', 'POST')]:
                request = event(branch='markham', group='vaughan-admin', path=path, method=method)
                result = app.lambda_handler(request, None)
                self.assertEqual(result['statusCode'], 403)
            store.assert_not_called()
            request = event(branch='markham', group='markham-admin', path='/admin/news', method='POST')
            request['body'] = json.dumps({**self.payload, 'branchId': 'markham'})
            app.route(request)
            store.return_value.save.assert_called_once_with({**self.payload, 'branchId': 'markham'}, 'markham', False)


if __name__ == '__main__':
    unittest.main()
