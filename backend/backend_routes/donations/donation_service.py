"""Donation hub — MongoDB service."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from bson import ObjectId
from fastapi import HTTPException

from database import donation_config_collection, donation_intents_collection

CONFIG_ID = "donation_hub"

DEFAULT_SETTINGS = {
    "heroTitle": "Give Sadaqah, Earn Rewards, Make a Lasting Impact",
    "heroSubtitle": "Support verified organizations and be part of goodness that changes lives.",
    "heroImageUrl": "/assets/donation/donation-hero.png",
    "profitPledgePercent": 12,
    "feedCardEnabled": True,
    "feedCardTitle": "Support a Cause",
    "feedCardSubtitle": "Donate to verified organizations through EventThon. {percent}% of our net profits support community initiatives.",
    "presetAmounts": [500, 1000, 2500, 5000, 10000],
    "rewardTitle": "Small Act, Big Reward",
    "rewardSubtitle": "Every act of giving brings countless blessings.",
    "rewardImageUrl": "/assets/donation/donation-reward.png",
    "inviteTitle": "Invite Others, Spread Goodness",
    "inviteSubtitle": "Share EventThon Donate with friends and grow the circle of giving.",
    "inviteLink": "/",
    "learnMoreTitle": "About EventThon Donate",
    "learnMoreSubtitle": "Giving with trust, transparency, and lasting community impact.",
    "learnMoreIntro": "EventThon Donate connects members with verified charitable organizations across education, healthcare, food relief, and emergency support. Every organization is reviewed before appearing on the platform.",
    "learnMoreImageUrl": "",
    "learnMoreSections": [
        {"title": "Our Mission", "text": "We make it simple to discover trustworthy causes and support them through verified partners — while earning platform rewards for spreading goodness."},
        {"title": "Verified Organizations Only", "text": "Each NGO and charity on EventThon Donate is reviewed for legitimacy, active programs, and a clear public donation channel before going live."},
        {"title": "Transparent Giving", "text": "You choose the organization and amount in Thon. We log your intent and redirect you to the official partner website to complete your donation securely."},
        {"title": "Community Pledge", "text": "EventThon commits {percent}% of net profits to verified charitable initiatives, amplifying the impact of our community over time."},
    ],
    "heroFeatures": [
        {"iconKey": "users", "text": "100% Direct to organizations"},
        {"iconKey": "shield", "text": "Verified Organizations"},
        {"iconKey": "gift", "text": "Transparent & Secure"},
    ],
    "steps": [
        {"title": "Choose a Cause", "text": "Pick what matters most to you — education, health, food, or emergency relief."},
        {"title": "Donate Securely", "text": "Give through verified partners with full transparency on where your Thon goes."},
        {"title": "Make an Impact", "text": "Track your contribution and earn platform rewards for spreading goodness."},
    ],
    "commitments": [
        {"iconKey": "shield", "title": "Verified Partners Only", "text": "Every organization is reviewed before appearing on EventThon Donate."},
        {"iconKey": "heart", "title": "12% Net Profits Pledge", "text": "EventThon commits 12% of net profits to verified charitable initiatives."},
        {"iconKey": "gift", "title": "Full Transparency", "text": "Clear reporting on causes supported and community impact over time."},
    ],
}

DEFAULT_CAUSES = [
    {"id": "all", "label": "All Causes", "iconKey": "heart", "color": "#8b5cf6", "active": True, "sortOrder": 0},
    {"id": "education", "label": "Education", "iconKey": "book", "color": "#3b82f6", "active": True, "sortOrder": 1},
    {"id": "orphans", "label": "Orphans", "iconKey": "users", "color": "#ec4899", "active": True, "sortOrder": 2},
    {"id": "water", "label": "Water", "iconKey": "droplet", "color": "#06b6d4", "active": True, "sortOrder": 3},
    {"id": "food", "label": "Food", "iconKey": "coffee", "color": "#f59e0b", "active": True, "sortOrder": 4},
    {"id": "healthcare", "label": "Healthcare", "iconKey": "health", "color": "#ef4444", "active": True, "sortOrder": 5},
    {"id": "quran", "label": "Quran & Dawah", "iconKey": "book", "color": "#10b981", "active": True, "sortOrder": 6},
    {"id": "emergency", "label": "Emergency", "iconKey": "alert", "color": "#f97316", "active": True, "sortOrder": 7},
]

DEFAULT_ORGANIZATIONS = [
    {
        "id": "alkhidmat",
        "name": "Alkhidmat Foundation Pakistan",
        "description": "Humanitarian services including health, education, disaster relief, and community welfare across Pakistan.",
        "website": "https://alkhidmat.org/",
        "causes": ["education", "healthcare", "emergency", "food", "water"],
        "color": "#059669",
        "logo": "AK",
        "verified": True,
        "active": True,
        "sortOrder": 0,
    },
    {
        "id": "edhi",
        "name": "Edhi Foundation",
        "description": "Ambulance, orphanages, shelters, and emergency response — serving humanity without discrimination.",
        "website": "https://edhi.org/",
        "causes": ["orphans", "healthcare", "emergency", "food"],
        "color": "#16a34a",
        "logo": "EF",
        "verified": True,
        "active": True,
        "sortOrder": 1,
    },
    {
        "id": "skmt",
        "name": "Shaukat Khanum Memorial Trust",
        "description": "Cancer care, research, and treatment for patients who cannot afford life-saving medical support.",
        "website": "https://shaukatkhanum.org.pk/",
        "causes": ["healthcare", "emergency"],
        "color": "#2563eb",
        "logo": "SK",
        "verified": True,
        "active": True,
        "sortOrder": 2,
    },
    {
        "id": "akhuwat",
        "name": "Akhuwat Foundation",
        "description": "Interest-free microfinance, education, and health programs to uplift underserved communities.",
        "website": "https://akhuwat.org.pk/",
        "causes": ["education", "food", "healthcare"],
        "color": "#7c3aed",
        "logo": "AF",
        "verified": True,
        "active": True,
        "sortOrder": 3,
    },
]


def _serialize_intent(doc: dict) -> dict:
    out = dict(doc)
    out["id"] = str(out.pop("_id"))
    for key in ("created_at",):
        val = out.get(key)
        if isinstance(val, datetime):
            out[key] = val.isoformat()
    return out


async def _ensure_config() -> dict:
    doc = await donation_config_collection.find_one({"_id": CONFIG_ID})
    if doc:
        return doc
    now = datetime.utcnow()
    seed = {
        "_id": CONFIG_ID,
        "settings": DEFAULT_SETTINGS,
        "causes": DEFAULT_CAUSES,
        "organizations": DEFAULT_ORGANIZATIONS,
        "created_at": now,
        "updated_at": now,
    }
    await donation_config_collection.insert_one(seed)
    return seed


def _merge_settings(stored: dict | None) -> dict:
    base = {**DEFAULT_SETTINGS, **(stored or {})}
    for key in ("heroFeatures", "steps", "commitments"):
        if not base.get(key):
            base[key] = DEFAULT_SETTINGS[key]
    percent = base.get("profitPledgePercent", 12)
    for key in ("feedCardSubtitle",):
        text = str(base.get(key) or "")
        if "{percent}" in text:
            base[key] = text.replace("{percent}", str(percent))
    commitments = base.get("commitments") or []
    base["commitments"] = [
        {
            **row,
            "title": str(row.get("title") or "").replace("{percent}", str(percent)),
            "text": str(row.get("text") or "").replace("{percent}", str(percent)),
        }
        for row in commitments
    ]
    return base


def _public_payload(doc: dict) -> dict:
    settings = _merge_settings(doc.get("settings"))
    causes = sorted(
        [c for c in (doc.get("causes") or []) if c.get("active", True)],
        key=lambda row: row.get("sortOrder", 0),
    )
    organizations = sorted(
        [o for o in (doc.get("organizations") or []) if o.get("active", True)],
        key=lambda row: row.get("sortOrder", 0),
    )
    return {"settings": settings, "causes": causes, "organizations": organizations}


async def get_public_donation_config() -> dict:
    doc = await _ensure_config()
    return _public_payload(doc)


async def get_admin_donation_config() -> dict:
    doc = await _ensure_config()
    return {
        "settings": _merge_settings(doc.get("settings")),
        "causes": sorted(doc.get("causes") or [], key=lambda row: row.get("sortOrder", 0)),
        "organizations": sorted(doc.get("organizations") or [], key=lambda row: row.get("sortOrder", 0)),
        "updated_at": doc.get("updated_at"),
    }


async def update_donation_settings(payload: dict) -> dict:
    doc = await _ensure_config()
    settings = _merge_settings({**_merge_settings(doc.get("settings")), **payload})
    await donation_config_collection.update_one(
        {"_id": CONFIG_ID},
        {"$set": {"settings": settings, "updated_at": datetime.utcnow()}},
    )
    return await get_admin_donation_config()


async def apply_donation_image(slot: str, image_url: str) -> dict:
    from .donation_media import donation_image_field_for_slot

    field = donation_image_field_for_slot(slot)
    doc = await _ensure_config()
    settings = _merge_settings({**_merge_settings(doc.get("settings")), field: image_url})
    await donation_config_collection.update_one(
        {"_id": CONFIG_ID},
        {"$set": {"settings": settings, "updated_at": datetime.utcnow()}},
    )
    return await get_admin_donation_config()


def _upsert_list_item(items: list, item: dict, item_id: str) -> list:
    found = False
    updated = []
    for row in items:
        if str(row.get("id")) == item_id:
            updated.append({**row, **item, "id": item_id})
            found = True
        else:
            updated.append(row)
    if not found:
        updated.append({**item, "id": item_id})
    return updated


async def save_donation_cause(payload: dict) -> dict:
    doc = await _ensure_config()
    item_id = str(payload.get("id") or "").strip().lower()
    label = str(payload.get("label") or "").strip()
    if not item_id:
        raise HTTPException(status_code=400, detail="Cause id required")
    if not label:
        raise HTTPException(status_code=400, detail="Cause label required")
    payload = {**payload, "id": item_id, "label": label}
    causes = _upsert_list_item(doc.get("causes") or [], payload, item_id)
    await donation_config_collection.update_one(
        {"_id": CONFIG_ID},
        {"$set": {"causes": causes, "updated_at": datetime.utcnow()}},
    )
    return await get_admin_donation_config()


async def delete_donation_cause(cause_id: str) -> dict:
    if cause_id == "all":
        raise HTTPException(status_code=400, detail="Cannot delete All Causes")
    doc = await _ensure_config()
    causes = [c for c in (doc.get("causes") or []) if str(c.get("id")) != cause_id]
    await donation_config_collection.update_one(
        {"_id": CONFIG_ID},
        {"$set": {"causes": causes, "updated_at": datetime.utcnow()}},
    )
    return await get_admin_donation_config()


async def save_donation_organization(payload: dict) -> dict:
    doc = await _ensure_config()
    item_id = str(payload.get("id") or "").strip().lower()
    name = str(payload.get("name") or "").strip()
    if not item_id:
        raise HTTPException(status_code=400, detail="Organization id required")
    if not name:
        raise HTTPException(status_code=400, detail="Organization name required")
    website = _normalize_website(payload.get("website") or "")
    payload = {**payload, "id": item_id, "name": name, "website": website}
    orgs = _upsert_list_item(doc.get("organizations") or [], payload, item_id)
    await donation_config_collection.update_one(
        {"_id": CONFIG_ID},
        {"$set": {"organizations": orgs, "updated_at": datetime.utcnow()}},
    )
    return await get_admin_donation_config()


async def delete_donation_organization(org_id: str) -> dict:
    doc = await _ensure_config()
    orgs = [o for o in (doc.get("organizations") or []) if str(o.get("id")) != org_id]
    await donation_config_collection.update_one(
        {"_id": CONFIG_ID},
        {"$set": {"organizations": orgs, "updated_at": datetime.utcnow()}},
    )
    return await get_admin_donation_config()


def _normalize_website(raw: str) -> str:
    value = str(raw or "").strip()
    if not value:
        return ""
    if value.startswith("http://") or value.startswith("https://"):
        return value
    return f"https://{value.lstrip('/')}"


def _find_organization(doc: dict, org_id: str) -> dict | None:
    for row in doc.get("organizations") or []:
        if str(row.get("id")) == org_id and row.get("active", True):
            return row
    return None


async def log_donation_intent(payload: dict) -> dict:
    doc = await _ensure_config()
    org_id = str(payload.get("organizationId") or "").strip()
    org = _find_organization(doc, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    website = _normalize_website(org.get("website") or "")
    if not website:
        raise HTTPException(status_code=400, detail="Organization website is not configured")

    now = datetime.utcnow()
    saved_payload = {
        **payload,
        "organizationId": org_id,
        "organizationName": str(payload.get("organizationName") or org.get("name") or org_id).strip(),
        "amountThon": int(payload.get("amountThon") or 0),
        "status": "redirected",
        "created_at": now,
    }
    result = await donation_intents_collection.insert_one(saved_payload)
    saved = await donation_intents_collection.find_one({"_id": result.inserted_id})
    return _serialize_intent(saved or {**saved_payload, "_id": result.inserted_id})


async def list_donation_intents(limit: int = 100) -> list[dict]:
    cursor = donation_intents_collection.find({}).sort("created_at", -1).limit(max(1, min(limit, 500)))
    return [_serialize_intent(doc) async for doc in cursor]
