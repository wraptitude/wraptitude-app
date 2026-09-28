import base64
import json
import os
import smtplib
from email.message import EmailMessage

import boto3


secrets = boto3.client("secretsmanager")
_credentials = None


def build_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json", "Cache-Control": "no-store"},
        "body": json.dumps(body),
    }


def parse_body(event):
    body = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        body = base64.b64decode(body).decode("utf-8")
    payload = json.loads(body)
    if not isinstance(payload, dict):
        raise ValueError("Request body must be an object")
    return payload


def gmail_credentials():
    global _credentials
    if _credentials is None:
        secret = secrets.get_secret_value(SecretId=os.environ["SECRET_ARN"])
        _credentials = json.loads(secret["SecretString"])
    return _credentials


def safe_header(value):
    value = str(value or "").strip()
    if "\r" in value or "\n" in value:
        raise ValueError("Invalid email header")
    return value


def lambda_handler(event, context):
    method = (
        event.get("requestContext", {}).get("http", {}).get("method")
        or event.get("httpMethod")
    )
    if method and method != "POST":
        return build_response(405, {"success": False, "message": "Method not allowed"})

    try:
        payload = parse_body(event)
        to_email = safe_header(payload.get("to"))
        subject = safe_header(payload.get("subject"))
        filename = safe_header(payload.get("filename"))
        cc_email = safe_header(payload.get("cc"))
        body_text = str(payload.get("bodyText") or "").strip()
        pdf_base64 = str(payload.get("pdfBase64") or "").strip()

        if not to_email or not subject or not body_text or not filename or not pdf_base64:
            return build_response(
                400,
                {
                    "success": False,
                    "message": "Missing required fields: to, subject, bodyText, filename, pdfBase64",
                },
            )

        prefix = "data:application/pdf;base64,"
        if pdf_base64.startswith(prefix):
            pdf_base64 = pdf_base64[len(prefix):]
        pdf_bytes = base64.b64decode(pdf_base64, validate=True)
        if not pdf_bytes or len(pdf_bytes) > 8 * 1024 * 1024:
            return build_response(400, {"success": False, "message": "Invalid PDF attachment"})

        credentials = gmail_credentials()
        gmail_user = credentials["username"]
        gmail_password = credentials["password"]
        from_email = os.environ.get("FROM_EMAIL", gmail_user)
        internal_copy = os.environ.get("INTERNAL_COPY_EMAIL", "wraptitude.ca@gmail.com")

        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = from_email
        message["To"] = to_email
        if cc_email:
            message["Cc"] = cc_email
        message.set_content(body_text)
        message.add_attachment(
            pdf_bytes,
            maintype="application",
            subtype="pdf",
            filename=filename,
        )

        recipients = [to_email, internal_copy]
        if cc_email:
            recipients.append(cc_email)
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=20) as smtp:
            smtp.login(gmail_user, gmail_password)
            smtp.send_message(message, to_addrs=recipients)

        return build_response(
            200,
            {
                "success": True,
                "message": "Email sent successfully",
                "requestId": getattr(context, "aws_request_id", None),
            },
        )
    except (ValueError, KeyError, json.JSONDecodeError):
        return build_response(400, {"success": False, "message": "Invalid request"})
    except Exception as error:
        print(json.dumps({"error": type(error).__name__}))
        return build_response(
            500,
            {
                "success": False,
                "message": "Unable to send invoice email",
                "requestId": getattr(context, "aws_request_id", None),
            },
        )
