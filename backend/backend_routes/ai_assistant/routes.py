"""EventThon AI Assistant — public ask endpoint."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .ollama_client import OLLAMA_MODEL, generate_assistant_answer

logger = logging.getLogger("ai_assistant.routes")
router = APIRouter(tags=["AI Assistant"])


class AskAssistantBody(BaseModel):
    question: str = Field(..., min_length=1, max_length=4000)


@router.post("/ask")
async def ask_ai_assistant(body: AskAssistantBody):
    try:
        answer = await generate_assistant_answer(body.question)
        return {"status": "success", "answer": answer, "model": OLLAMA_MODEL}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        logger.error("AI assistant ask failed — %s", exc)
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("AI assistant unexpected error")
        raise HTTPException(status_code=500, detail=f"AI assistant failed: {exc}") from exc
