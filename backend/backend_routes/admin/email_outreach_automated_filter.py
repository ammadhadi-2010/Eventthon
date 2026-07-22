"""Email Outreach — block Facebook/system/automated messages before AI processing."""

from __future__ import annotations

import logging
from typing import Any

IGNORE_LOG_PREFIX = "[Ignored] Automated email from Facebook/System"

BLOCKED_SENDER_DOMAIN_SUFFIXES = (
    "facebookmail.com",
    "noreply.com",
    "linkedinmail.com",
    "updates.facebook.com",
    "groups.facebook.com",
    "notification.facebook.com",
)

AUTOMATED_DOMAIN_KEYWORDS = (
    "facebookmail",
    "noreply",
    "no-reply",
    "donotreply",
    "do-not-reply",
    "mailer-daemon",
    "groupupdates",
    "bounce",
    "maildaemon",
)

AUTOMATED_LOCAL_PARTS = (
    "noreply",
    "no-reply",
    "no_reply",
    "donotreply",
    "do-not-reply",
    "mailer-daemon",
    "postmaster",
    "notifications",
    "notification",
    "groupupdates",
    "bounce",
    "mailerdaemon",
)

AUTOMATED_SENDER_NAME_PHRASES = (
    "facebook groups",
    "facebook notifications",
    "meta platforms",
)

HEADER_KEYWORDS = (
    "noreply",
    "no-reply",
    "notification",
    "groupupdates",
)

SYSTEM_NOTIFICATION_SUBJECT_PHRASES = (
    "posted in the group",
    "posted a photo in",
    "commented on a post",
    "commented on your post",
    "tagged you in",
    "invited you to join",
    "new notification from",
    "facebook group",
    "groups notification",
    "security alert",
    "password reset",
    "verify your email",
    "delivery status notification",
    "out of office",
    "automatic reply",
    "auto-reply",
)

SYSTEM_NOTIFICATION_BODY_PHRASES = (
    "view post in group",
    "see more posts in",
    "facebook group",
    "groups notification",
    "unsubscribe from these notifications",
    "do not reply to this email",
    "automated message",
)


def _sender_parts(sender: str) -> tuple[str, str]:
    email = str(sender or "").strip().lower()
    if "@" not in email:
        return "", ""
    local, _, domain = email.rpartition("@")
    return local.strip(), domain.strip()


def _contains_keyword(text: str, keywords: tuple[str, ...]) -> str | None:
    lowered = str(text or "").strip().lower()
    if not lowered:
        return None
    for keyword in keywords:
        if keyword in lowered:
            return keyword
    return None


def _domain_is_blocked(domain: str) -> bool:
    if not domain:
        return False
    if "facebookmail.com" in domain:
        return True
    for suffix in BLOCKED_SENDER_DOMAIN_SUFFIXES:
        if domain == suffix or domain.endswith(f".{suffix}"):
            return True
    return _contains_keyword(domain, AUTOMATED_DOMAIN_KEYWORDS) is not None


def _email_address_is_automated(address: str) -> bool:
    local, domain = _sender_parts(address)
    if not domain:
        return False
    if _domain_is_blocked(domain):
        return True
    base_local = local.split("+", 1)[0]
    return base_local in AUTOMATED_LOCAL_PARTS


def _header_fields(payload: dict[str, Any]) -> str:
    parts = [
        payload.get("from_header"),
        payload.get("reply_to"),
        payload.get("return_path"),
        payload.get("sender_email"),
        payload.get("sender_name"),
    ]
    return " ".join(str(part or "").strip() for part in parts if part)


def should_ignore_automated_email(payload: dict[str, Any]) -> tuple[bool, str]:
    """Return (True, reason) when the message must not enter the AI pipeline."""
    sender_email = str(payload.get("sender_email") or "").strip().lower()
    sender_name = str(payload.get("sender_name") or "").strip()
    subject = str(payload.get("subject") or "").strip()
    body = str(payload.get("body_content") or payload.get("body") or "").strip()

    if _email_address_is_automated(sender_email):
        return True, "sender_email_automated"

    reply_to = str(payload.get("reply_to") or "").strip().lower()
    if reply_to and _email_address_is_automated(reply_to):
        return True, "reply_to_automated"

    if _contains_keyword(sender_name, AUTOMATED_SENDER_NAME_PHRASES):
        return True, "facebook_groups_sender_name"

    header_match = _contains_keyword(_header_fields(payload), HEADER_KEYWORDS)
    if header_match:
        return True, f"header_keyword:{header_match}"

    subject_match = _contains_keyword(subject, SYSTEM_NOTIFICATION_SUBJECT_PHRASES)
    if subject_match:
        return True, f"subject_phrase:{subject_match}"

    body_match = _contains_keyword(body, SYSTEM_NOTIFICATION_BODY_PHRASES)
    if body_match:
        return True, f"body_phrase:{body_match}"

    return False, ""


def log_ignored_automated_email(logger: logging.Logger, payload: dict[str, Any], reason: str) -> None:
    sender = str(payload.get("sender_email") or "unknown")
    subject = str(payload.get("subject") or "")[:120]
    logger.info(
        "%s | reason=%s sender=%s sender_name=%r subject=%r",
        IGNORE_LOG_PREFIX,
        reason,
        sender,
        payload.get("sender_name") or "",
        subject,
    )
