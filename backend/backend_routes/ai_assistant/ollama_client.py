"""EventThon AI Assistant — Ollama generate client (httpx)."""

from __future__ import annotations

import logging
import os

import httpx

logger = logging.getLogger("ai_assistant.ollama")

OLLAMA_BASE = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:1.5b")
OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT_SEC", "120"))

SYSTEM_PROMPT = (
    "You are the official EventThon AI Assistant. Provide helpful, short, concise, "
    "and professional responses guiding users about Squads, Gigs, Jobs, and the Wallet on EventThon."
)


async def generate_assistant_answer(question: str) -> str:
    cleaned = str(question or "").strip()
    if not cleaned:
        raise ValueError("Question cannot be empty")

    payload = {
        "model": OLLAMA_MODEL,
        "system": SYSTEM_PROMPT,
        "prompt": cleaned,
        "stream": False,
    }

    logger.info("Ollama generate | model=%s question_len=%s", OLLAMA_MODEL, len(cleaned))

    try:
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
            response = await client.post(f"{OLLAMA_BASE}/api/generate", json=payload)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text[:300] if exc.response is not None else str(exc)
        raise RuntimeError(f"Ollama HTTP {exc.response.status_code}: {detail}") from exc
    except httpx.RequestError as exc:
        raise RuntimeError(
            f"Ollama unavailable at {OLLAMA_BASE}. Start Ollama and pull model '{OLLAMA_MODEL}'."
        ) from exc

    answer = str(data.get("response") or "").strip()
    if not answer:
        raise RuntimeError("Ollama returned an empty response")
    return answer[:12000]
