from __future__ import annotations

import re
from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel, Field, field_validator

from database import newsletter_subscribers_collection

router = APIRouter(tags=["Newsletter"])

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class NewsletterSubscribeBody(BaseModel):
    email: str = Field(..., min_length=5, max_length=200)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        email = str(value or "").strip().lower()
        if not _EMAIL_RE.match(email):
            raise ValueError("Enter a valid email address.")
        return email


@router.post("/newsletter/subscribe")
async def subscribe_newsletter(body: NewsletterSubscribeBody):
    existing = await newsletter_subscribers_collection.find_one({"email": body.email})
    if existing:
        return {
            "status": "success",
            "message": "You are already subscribed.",
            "alreadySubscribed": True,
        }

    now = datetime.now(timezone.utc)
    await newsletter_subscribers_collection.insert_one(
        {
            "email": body.email,
            "source": "footer",
            "created_at": now,
            "updated_at": now,
        }
    )
    return {
        "status": "success",
        "message": "Thanks for subscribing! We will send updates to your inbox.",
        "alreadySubscribed": False,
    }
