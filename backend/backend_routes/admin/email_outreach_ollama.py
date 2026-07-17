"""Email Outreach — local Ollama LLM client for auto-replies."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request

OLLAMA_BASE = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT_SEC", "120"))


def _post_json(path: str, payload: dict) -> dict:
    req = urllib.request.Request(
        f"{OLLAMA_BASE}{path}",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=OLLAMA_TIMEOUT) as resp:
        return json.loads(resp.read().decode("utf-8", errors="replace"))


def _chat_reply(system_prompt: str, user_message: str) -> str:
    data = _post_json(
        "/api/chat",
        {
            "model": OLLAMA_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt.strip()},
                {"role": "user", "content": user_message.strip()},
            ],
            "stream": False,
        },
    )
    text = str(data.get("message", {}).get("content") or "").strip()
    if not text:
        raise RuntimeError("Ollama chat returned an empty reply")
    return text[:12000]


def _generate_reply(system_prompt: str, user_message: str) -> str:
    prompt = (
        f"{system_prompt.strip()}\n\n"
        f"Incoming email:\n{user_message.strip()}\n\n"
        "Write a concise professional reply email body only:"
    )
    data = _post_json("/api/generate", {"model": OLLAMA_MODEL, "prompt": prompt, "stream": False})
    text = str(data.get("response") or "").strip()
    if not text:
        raise RuntimeError("Ollama generate returned an empty reply")
    return text[:12000]


def generate_ollama_reply(*, system_prompt: str, user_message: str) -> str:
    errors: list[str] = []
    for fn in (_chat_reply, _generate_reply):
        try:
            return fn(system_prompt, user_message)
        except (RuntimeError, urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            errors.append(str(exc))
    raise RuntimeError(
        f"Ollama failed for model '{OLLAMA_MODEL}' at {OLLAMA_BASE}: {' | '.join(errors)}"
    )
