"""Shared Gmail sender identity for outbound mail."""

from __future__ import annotations

import os

DEFAULT_FROM_NAME = "EventThon Network"
DEFAULT_FROM_EMAIL = "eventthon@gmail.com"


def _clean_env(value: str) -> str:
    """Trim env values and remove optional surrounding quotes."""
    text = (value or "").strip()
    if len(text) >= 2 and text[0] == text[-1] and text[0] in "\"'":
        return text[1:-1].strip()
    return text


def sender_from_env() -> tuple[str, str, str]:
    """Return display name, display email, and RFC5322 From header."""
    name = _clean_env(os.getenv("MAIL_FROM_NAME") or DEFAULT_FROM_NAME) or DEFAULT_FROM_NAME
    email = _clean_env(os.getenv("MAIL_FROM") or DEFAULT_FROM_EMAIL) or DEFAULT_FROM_EMAIL
    return name, email, f"{name} <{email}>"


def smtp_credentials() -> tuple[str, str]:
    _, from_email, _ = sender_from_env()
    user = _clean_env(os.getenv("SMTP_USER") or os.getenv("MAIL_USERNAME") or from_email)
    password = _clean_env(os.getenv("SMTP_PASSWORD") or os.getenv("MAIL_PASSWORD") or "")
    return user, password


def ensure_smtp_identity() -> tuple[str, str, str, str]:
    """Validate Gmail SMTP login matches the public From address."""
    _, from_email, from_header = sender_from_env()
    user, password = smtp_credentials()
    if not user or not password:
        raise RuntimeError(
            "SMTP is not configured. Set SMTP_USER and SMTP_PASSWORD (Gmail App Password) in backend/.env."
        )
    if user.lower() != from_email.lower():
        raise RuntimeError(
            f"SMTP_USER ({user}) must match MAIL_FROM ({from_email}). "
            "Authenticate with eventthon@gmail.com and its Google App Password."
        )
    return user, password, from_email, from_header
