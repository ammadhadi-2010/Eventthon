"""Email Outreach — MongoDB-backed email templates."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field

from database import outreach_templates_collection


class TemplateCreateBody(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field("", max_length=500)
    subject: str = Field(..., min_length=1, max_length=300)
    body: str = Field(..., min_length=1, max_length=12000)


DEFAULT_TEMPLATES: list[dict[str, Any]] = [
    {
        "slug": "partnership",
        "title": "Partnership Proposal",
        "description": "Introduces EventThon partnership opportunity",
        "tone": "amber",
        "icon": "handshake",
        "sort_order": 0,
        "subject": "Partnership Opportunity with EventThon",
        "body": (
            "Dear [Company Name] Team,\n\n"
            "EventThon is expanding our partner network across events, gigs, squads, and verified hiring. "
            "We believe there is strong alignment between our platforms and would love to explore a "
            "collaboration with your organization.\n\n"
            "We can discuss co-marketing, listings, integrations, or community partnerships at your convenience.\n\n"
            "Best regards,\nEventThon Support"
        ),
    },
    {
        "slug": "feedback",
        "title": "Feedback Request",
        "description": "Asks for feedback on the system",
        "tone": "green",
        "icon": "message-square",
        "sort_order": 1,
        "subject": "Share your feedback on EventThon",
        "body": (
            "Hello [Contact Name],\n\n"
            "We are continuously improving EventThon and value candid feedback from partners like you. "
            "If you have a few minutes, please share what is working well and what we should improve next.\n\n"
            "Your input directly shapes our product roadmap.\n\n"
            "Warm regards,\nEventThon Support"
        ),
    },
    {
        "slug": "beta",
        "title": "Beta Invitation",
        "description": "Invites users to join as a beta tester",
        "tone": "violet",
        "icon": "flask-conical",
        "sort_order": 2,
        "subject": "You are invited to the EventThon Beta Program",
        "body": (
            "Hi [Contact Name],\n\n"
            "We are inviting a select group of organizations to test upcoming EventThon features before "
            "public release. Beta partners receive early access and direct influence on our roadmap.\n\n"
            "Would you be open to a short onboarding call this week?\n\n"
            "Thank you,\nEventThon Support"
        ),
    },
    {
        "slug": "business",
        "title": "Business Introduction",
        "description": "Introduces EventThon services and platform tools",
        "tone": "purple",
        "icon": "briefcase",
        "sort_order": 3,
        "subject": "Introducing EventThon — your all-in-one events & hiring platform",
        "body": (
            "Dear [Company Name] Team,\n\n"
            "EventThon helps teams run events, manage gigs, build squads, and hire verified talent from one "
            "premium platform. We would be glad to give you a quick walkthrough of the tools most relevant to "
            "your workflow.\n\n"
            "Please let us know a convenient time for a brief introduction call.\n\n"
            "Best,\nEventThon Support"
        ),
    },
    {
        "slug": "bug-report",
        "title": "Bug Report Request",
        "description": "Requests users to report bugs or UX suggestions",
        "tone": "blue",
        "icon": "bug",
        "sort_order": 4,
        "subject": "Help us improve EventThon — report bugs or UX ideas",
        "body": (
            "Hello [Contact Name],\n\n"
            "We are actively refining the EventThon experience and would appreciate your help identifying "
            "bugs, broken flows, or UX friction points.\n\n"
            "If you notice anything that feels confusing or unreliable, please reply with screenshots or "
            "steps to reproduce. We review every report.\n\n"
            "Thank you,\nEventThon Support"
        ),
    },
]


def serialize_template(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": doc.get("id") or str(doc.get("_id", "")),
        "title": doc.get("title", ""),
        "description": doc.get("description", ""),
        "subject": doc.get("subject", ""),
        "body": doc.get("body", ""),
        "tone": doc.get("tone", "purple"),
        "icon": doc.get("icon", "file-text"),
    }


async def ensure_default_templates() -> None:
    count = await outreach_templates_collection.count_documents({})
    if count > 0:
        return
    now = datetime.now(timezone.utc)
    for tpl in DEFAULT_TEMPLATES:
        tpl_id = f"tpl-{tpl['slug']}"
        doc = {
            "_id": tpl_id,
            "id": tpl_id,
            "slug": tpl["slug"],
            "title": tpl["title"],
            "description": tpl["description"],
            "subject": tpl["subject"],
            "body": tpl["body"],
            "tone": tpl.get("tone", "purple"),
            "icon": tpl.get("icon", "file-text"),
            "sort_order": tpl.get("sort_order", 0),
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }
        await outreach_templates_collection.insert_one(doc)


async def list_templates() -> list[dict[str, Any]]:
    await ensure_default_templates()
    cursor = outreach_templates_collection.find({"is_active": True}).sort("sort_order", 1)
    docs = await cursor.to_list(length=200)
    return [serialize_template(doc) for doc in docs]


async def create_template(body: TemplateCreateBody) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    tpl_id = f"tpl-custom-{uuid.uuid4().hex[:10]}"
    doc = {
        "_id": tpl_id,
        "id": tpl_id,
        "slug": tpl_id.replace("tpl-", ""),
        "title": body.title.strip(),
        "description": body.description.strip(),
        "subject": body.subject.strip(),
        "body": body.body.strip(),
        "tone": "purple",
        "icon": "file-text",
        "sort_order": 999,
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }
    await outreach_templates_collection.insert_one(doc)
    return serialize_template(doc)
