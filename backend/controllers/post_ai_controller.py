import asyncio
import json
import os
import re
import urllib.error
import urllib.request

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")


def _build_prompt(text: str, post_type: str) -> str:
    tone = {
        "SQUAD": "collaborative and clear, inviting squad feedback",
        "PROJECT": "professional and action-oriented for a project update",
        "WIN": "celebratory and humble for an achievement",
    }.get((post_type or "POST").upper(), "warm, professional, and engaging")

    return (
        "You are a social copy editor for EventThon Network. "
        f"Rewrite the draft into a {tone} post. "
        "Use short paragraphs, keep under 220 words, no hashtags unless present in draft. "
        "Return only the enhanced post text.\n\nDraft:\n"
        f"{text.strip()}"
    )


def _local_fallback(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", text.strip())
    if not cleaned:
        return ""
    if cleaned.endswith((".", "!", "?")):
        return cleaned
    return f"{cleaned}."


def _call_gemini_sync(prompt: str) -> str:
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    )
    payload = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    candidates = data.get("candidates") or []
    if not candidates:
        raise ValueError("Empty Gemini response")
    parts = candidates[0].get("content", {}).get("parts") or []
    text = "".join(part.get("text", "") for part in parts).strip()
    if not text:
        raise ValueError("Gemini returned no text")
    return text


async def enhance_social_post(text: str, post_type: str = "POST") -> str:
    draft = (text or "").strip()
    if not draft:
        return ""
    if not GEMINI_API_KEY:
        return _local_fallback(draft)
    try:
        prompt = _build_prompt(draft, post_type)
        return await asyncio.to_thread(_call_gemini_sync, prompt)
    except (urllib.error.URLError, ValueError, json.JSONDecodeError, TimeoutError):
        return _local_fallback(draft)
