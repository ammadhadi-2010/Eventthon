"""Company team invitation email."""
from __future__ import annotations

import asyncio
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from backend_routes.email_sender import sender_from_env, smtp_credentials


def _send_invite_email_sync(
    to_email: str,
    *,
    company_name: str,
    inviter_name: str,
    role_label: str,
    accept_url: str,
    signup_url: str,
    is_existing_user: bool,
) -> None:
    smtp_host = os.getenv("SMTP_HOST") or os.getenv("MAIL_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT") or os.getenv("MAIL_PORT", "587"))
    smtp_user, smtp_password = smtp_credentials()
    _, _, from_header = sender_from_env()
    if not smtp_user or not smtp_password:
        raise RuntimeError("Email service is not configured on the server.")

    action = (
        f'<a href="{accept_url}" style="display:inline-block;padding:12px 18px;background:#6366f1;color:#fff;'
        f'border-radius:10px;text-decoration:none;font-weight:700;">Review invitation</a>'
        if is_existing_user
        else (
            f'<p>Create your EventThon account first, then accept the invite.</p>'
            f'<a href="{signup_url}" style="display:inline-block;padding:12px 18px;background:#6366f1;color:#fff;'
            f'border-radius:10px;text-decoration:none;font-weight:700;">Sign up</a>'
            f'<p style="margin-top:12px;"><a href="{accept_url}">Or open invite after signup</a></p>'
        )
    )

    msg = MIMEMultipart()
    msg["From"] = from_header
    msg["To"] = to_email
    msg["Subject"] = f"You're invited to join {company_name} on EventThon"
    body = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;">
      <h2>Company invitation</h2>
      <p><strong>{inviter_name}</strong> invited you to join <strong>{company_name}</strong>
         as <strong>{role_label}</strong>.</p>
      {action}
      <p style="color:#64748b;font-size:13px;margin-top:20px;">
        If you did not expect this email, you can ignore it.
      </p>
      <p>— EventThon</p>
    </div>
    """
    msg.attach(MIMEText(body, "html"))
    server = smtplib.SMTP(smtp_host, smtp_port, timeout=30)
    try:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to_email, msg.as_string())
    finally:
        server.quit()


async def send_team_invite_email(
    to_email: str,
    *,
    company_name: str,
    inviter_name: str,
    role_label: str,
    accept_url: str,
    signup_url: str,
    is_existing_user: bool,
) -> None:
    await asyncio.to_thread(
        _send_invite_email_sync,
        to_email,
        company_name=company_name,
        inviter_name=inviter_name,
        role_label=role_label,
        accept_url=accept_url,
        signup_url=signup_url,
        is_existing_user=is_existing_user,
    )
