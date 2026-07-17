"""Email Outreach — Gemini-powered subject/body generation."""

from __future__ import annotations

import asyncio
import json
import re
import urllib.error

from controllers.post_ai_controller import GEMINI_API_KEY, _call_gemini_sync


def _fallback_email(prompt: str, company: str) -> dict[str, str]:
    name = company or "your team"
    return {
        "subject": f"Partnership opportunity with EventThon — {name}",
        "body": (
            f"Dear {name},\n\n"
            f"{prompt.strip() or 'We would love to connect about a potential collaboration with EventThon.'}\n\n"
            "Best regards,\nEventThon Support"
        ),
    }


def _parse_ai_json(raw: str) -> dict[str, str]:
    text = str(raw or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.IGNORECASE | re.DOTALL).strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise ValueError("AI response was not valid JSON")
        data = json.loads(match.group(0))
    subject = str(data.get("subject") or "").strip()
    body = str(data.get("body") or "").strip()
    if not subject or not body:
        raise ValueError("AI response missing subject or body")
    return {"subject": subject[:300], "body": body[:12000]}


def _build_prompt(user_prompt: str, company: str, to_email: str) -> str:
    return (
        "You write professional B2B outreach emails for EventThon (events, gigs, squads, hiring). "
        "Return ONLY valid JSON with keys subject and body. Body should be plain text with paragraphs.\n"
        f"Recipient company: {company or 'Unknown'}\n"
        f"Recipient email: {to_email or 'unknown'}\n"
        f"User instruction: {user_prompt.strip()}\n"
        'Example: {"subject":"...","body":"Dear ...\\n\\n..."}'
    )


async def generate_outreach_email(
    *,
    prompt: str,
    company: str = "",
    to_email: str = "",
) -> dict[str, str]:
    clean_prompt = str(prompt or "").strip()
    if not clean_prompt:
        raise ValueError("Prompt is required")
    if not GEMINI_API_KEY:
        return _fallback_email(clean_prompt, company)
    try:
        raw = await asyncio.to_thread(_call_gemini_sync, _build_prompt(clean_prompt, company, to_email))
        return _parse_ai_json(raw)
    except (urllib.error.URLError, ValueError, json.JSONDecodeError, TimeoutError):
        return _fallback_email(clean_prompt, company)
