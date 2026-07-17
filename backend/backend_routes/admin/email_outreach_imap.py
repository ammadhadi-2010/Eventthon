"""Email Outreach — IMAP inbox fetch for incoming replies."""

from __future__ import annotations

import email
import imaplib
import logging
import os
from email.header import decode_header
from email.utils import parsedate_to_datetime, parseaddr
from typing import Any

from backend_routes.email_sender import smtp_credentials

logger = logging.getLogger("email_outreach.imap")

IMAP_HOST = os.getenv("IMAP_HOST", "imap.gmail.com")
IMAP_PORT = int(os.getenv("IMAP_PORT", "993"))


def _decode_header_value(value: str | None) -> str:
    if not value:
        return ""
    chunks: list[str] = []
    for part, charset in decode_header(value):
        if isinstance(part, bytes):
            chunks.append(part.decode(charset or "utf-8", errors="replace"))
        else:
            chunks.append(str(part))
    return "".join(chunks).strip()


def _extract_body(msg: email.message.Message) -> str:
    if msg.is_multipart():
        plain = ""
        html = ""
        for part in msg.walk():
            if part.get_content_maintype() == "multipart":
                continue
            if "attachment" in str(part.get("Content-Disposition") or "").lower():
                continue
            payload = part.get_payload(decode=True)
            if not payload:
                continue
            charset = part.get_content_charset() or "utf-8"
            text = payload.decode(charset, errors="replace").strip()
            if part.get_content_type() == "text/plain" and not plain:
                plain = text
            if part.get_content_type() == "text/html" and not html:
                html = text
        return plain or html
    payload = msg.get_payload(decode=True)
    if not payload:
        return ""
    return payload.decode(msg.get_content_charset() or "utf-8", errors="replace").strip()


def _parse_message(uid: bytes, raw: bytes) -> dict[str, Any] | None:
    msg = email.message_from_bytes(raw)
    sender_name, sender_email = parseaddr(_decode_header_value(msg.get("From")))
    recipient_name, recipient_email = parseaddr(_decode_header_value(msg.get("To")))
    subject = _decode_header_value(msg.get("Subject"))
    body = _extract_body(msg)
    if not sender_email:
        return None
    received_at = parsedate_to_datetime(msg.get("Date")) if msg.get("Date") else None
    return {
        "gmail_uid": uid.decode() if isinstance(uid, bytes) else str(uid),
        "message_id": _decode_header_value(msg.get("Message-ID")),
        "in_reply_to": _decode_header_value(msg.get("In-Reply-To")),
        "sender_email": sender_email.lower().strip(),
        "sender_name": sender_name.strip() or sender_email,
        "recipient_email": recipient_email.lower().strip(),
        "subject": subject,
        "body_content": body,
        "received_at": received_at,
    }


def fetch_unread_reply_messages() -> list[dict[str, Any]]:
    user, password = smtp_credentials()
    if not user or not password:
        logger.warning("IMAP skipped: SMTP credentials missing in backend/.env")
        return []

    own_mailbox = user.lower().strip()
    rows: list[dict[str, Any]] = []
    mail: imaplib.IMAP4_SSL | None = None
    try:
        mail = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT)
        mail.login(user, password)
        mail.select("INBOX")
        status, data = mail.search(None, "UNSEEN")
        if status != "OK" or not data or not data[0]:
            return []
        for uid in data[0].split():
            fetch_status, fetched = mail.fetch(uid, "(RFC822)")
            if fetch_status != "OK" or not fetched:
                continue
            raw = fetched[0][1]
            parsed = _parse_message(uid, raw)
            if not parsed or parsed["sender_email"] == own_mailbox:
                continue
            rows.append(parsed)
        logger.info("IMAP fetched %s unread reply candidate(s)", len(rows))
        return rows
    except imaplib.IMAP4.error as exc:
        logger.error("IMAP Error: %s", exc)
        raise RuntimeError(f"IMAP inbox fetch failed: {exc}") from exc
    finally:
        if mail is not None:
            try:
                mail.logout()
            except imaplib.IMAP4.error:
                pass


def mark_message_seen(gmail_uid: str) -> None:
    user, password = smtp_credentials()
    if not user or not password or not gmail_uid:
        return
    mail: imaplib.IMAP4_SSL | None = None
    try:
        mail = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT)
        mail.login(user, password)
        mail.select("INBOX")
        mail.store(gmail_uid.encode(), "+FLAGS", "\\Seen")
    except imaplib.IMAP4.error as exc:
        logger.error("IMAP mark-read failed for uid=%s — %s", gmail_uid, exc)
    finally:
        if mail is not None:
            try:
                mail.logout()
            except imaplib.IMAP4.error:
                pass
