"""Email Outreach — SMTP delivery via Gmail."""

from __future__ import annotations

import asyncio
import logging
import os
import re
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from backend_routes.email_sender import ensure_smtp_identity

logger = logging.getLogger("email_outreach.smtp")


def _smtp_host_port() -> tuple[str, int]:
    host = (os.getenv("SMTP_HOST") or os.getenv("MAIL_SERVER") or "smtp.gmail.com").strip()
    port = int(os.getenv("SMTP_PORT") or os.getenv("MAIL_PORT") or "587")
    return host, port


def _connect_smtp(host: str, port: int) -> smtplib.SMTP:
    """Open Gmail SMTP connection with TLS on port 587 (or SSL on 465)."""
    if port == 465:
        return smtplib.SMTP_SSL(host, port, timeout=30)
    server = smtplib.SMTP(host, port, timeout=30)
    server.ehlo()
    server.starttls()
    server.ehlo()
    return server


def _parse_recipients(to_email: str, cc: str, bcc: str) -> list[str]:
    recipients = [to_email.strip()]
    for chunk in (cc, bcc):
        if not chunk.strip():
            continue
        recipients.extend([part.strip() for part in chunk.split(",") if part.strip()])
    return list(dict.fromkeys(recipients))


def _html_to_plain(body_html: str) -> str:
    text = re.sub(r"<br\s*/?>", "\n", body_html, flags=re.I)
    text = re.sub(r"</p>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    return text.strip()


def _build_message(
    *,
    from_header: str,
    from_email: str,
    to_email: str,
    subject: str,
    body_html: str,
    cc: str,
) -> MIMEMultipart:
    msg = MIMEMultipart("alternative")
    msg["From"] = from_header
    msg["To"] = to_email.strip()
    msg["Subject"] = subject.strip()
    msg["Reply-To"] = from_email
    if cc.strip():
        msg["Cc"] = cc.strip()
    plain = _html_to_plain(body_html)
    msg.attach(MIMEText(plain or body_html, "plain", "utf-8"))
    msg.attach(MIMEText(body_html, "html", "utf-8"))
    return msg


def send_outreach_email_sync(
    *,
    to_email: str,
    subject: str,
    body_html: str,
    cc: str = "",
    bcc: str = "",
) -> None:
    smtp_user, smtp_password, from_email, from_header = ensure_smtp_identity()
    host, port = _smtp_host_port()
    recipients = _parse_recipients(to_email, cc, bcc)
    msg = _build_message(
        from_header=from_header,
        from_email=from_email,
        to_email=to_email,
        subject=subject,
        body_html=body_html,
        cc=cc,
    )

    logger.info(
        "SMTP sending | host=%s:%s from=%s to=%s subject=%r",
        host,
        port,
        from_header,
        to_email,
        subject,
    )

    server: smtplib.SMTP | None = None
    try:
        server = _connect_smtp(host, port)
        server.login(smtp_user, smtp_password)
        refused = server.sendmail(smtp_user, recipients, msg.as_string())
        if refused:
            raise smtplib.SMTPRecipientsRefused(refused)
        logger.info("SMTP success | to=%s via=%s", to_email, smtp_user)
    except smtplib.SMTPAuthenticationError as exc:
        logger.error("SMTP Error: authentication failed — %s", exc)
        raise RuntimeError(
            "Gmail rejected SMTP login. Verify eventthon@gmail.com App Password in backend/.env."
        ) from exc
    except smtplib.SMTPRecipientsRefused as exc:
        logger.error("SMTP Error: recipient refused — %s", exc)
        raise RuntimeError(f"Recipient refused by Gmail SMTP: {exc}") from exc
    except smtplib.SMTPException as exc:
        logger.error("SMTP Error: %s", exc)
        raise RuntimeError(f"SMTP delivery failed: {exc}") from exc
    except OSError as exc:
        logger.error("SMTP Error: connection failed — %s", exc)
        raise RuntimeError(f"Could not connect to SMTP server {host}:{port} — {exc}") from exc
    finally:
        if server is not None:
            try:
                server.quit()
            except smtplib.SMTPException:
                pass


async def send_outreach_email(**kwargs) -> None:
    await asyncio.to_thread(send_outreach_email_sync, **kwargs)
