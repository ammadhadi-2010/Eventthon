"""Alerts session checks, serialization, and actor avatar (imageurl) resolution."""
from __future__ import annotations

from datetime import datetime

from bson import ObjectId
from fastapi import Header, HTTPException

from database import companies_collection, notification_collection, user_collection
from backend_routes.common.media_urls import resolve_public_media_url


def user_lookup_query(identifier: str) -> dict:
    ident = (identifier or "").strip()
    if not ident:
        return {"_id": None}
    return {
        "$or": [
            {"user_id": ident.lower()},
            {"email": ident.lower()},
            {"mobile": ident},
        ]
    }


async def resolve_user(identifier: str) -> dict | None:
    value = (identifier or "").strip()
    if not value:
        return None
    return await user_collection.find_one(user_lookup_query(value))


async def verify_alerts_owner(
    identifier: str,
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    x_user_mobile: str | None = Header(default=None, alias="X-User-Mobile"),
) -> dict:
    ident = (identifier or "").strip()
    if not ident:
        raise HTTPException(status_code=400, detail="User identifier required")
    email_h = (x_user_email or "").strip().lower()
    mobile_h = (x_user_mobile or "").strip()
    if not email_h and not mobile_h:
        raise HTTPException(status_code=401, detail="Authenticated session required")

    user = await resolve_user(ident)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    owner_email = str(user.get("email") or "").strip().lower()
    owner_mobile = str(user.get("mobile") or "").strip()
    if email_h and owner_email and email_h == owner_email:
        return user
    if mobile_h and owner_mobile and mobile_h == owner_mobile:
        return user
    raise HTTPException(status_code=403, detail="You may only access your own alerts")


async def verify_alerts_owner_from_headers(
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    x_user_mobile: str | None = Header(default=None, alias="X-User-Mobile"),
) -> dict:
    email_h = (x_user_email or "").strip().lower()
    mobile_h = (x_user_mobile or "").strip()
    if not email_h and not mobile_h:
        raise HTTPException(status_code=401, detail="Authenticated session required")
    ident = email_h or mobile_h
    return await verify_alerts_owner(ident, x_user_email, x_user_mobile)


def parse_entity_imageurl(doc: dict | None) -> str:
    """Pick any common avatar/logo field from a user or company document."""
    if not doc:
        return ""
    return str(
        doc.get("imageurl")
        or doc.get("profile_image_url")
        or doc.get("profile_image")
        or doc.get("avatar")
        or doc.get("logo_url")
        or doc.get("photo")
        or ""
    ).strip()


def parse_user_imageurl(user: dict | None) -> str:
    return parse_entity_imageurl(user)


def _public_image(raw: str) -> str:
    value = str(raw or "").strip()
    if not value:
        return ""
    return resolve_public_media_url(value) or value


async def lookup_actor_imageurl(
    actor_name: str,
    *,
    actor_user_id: str = "",
    actor_email: str = "",
) -> str:
    """Resolve avatar for an alert actor — user first, then company logo."""
    # Direct user id / email / mobile
    for key in (actor_user_id, actor_email):
        key = str(key or "").strip()
        if not key:
            continue
        if ObjectId.is_valid(key):
            user = await user_collection.find_one({"_id": ObjectId(key)})
            if user:
                url = parse_user_imageurl(user)
                if url:
                    return _public_image(url)
        user = await resolve_user(key)
        if user:
            url = parse_user_imageurl(user)
            if url:
                return _public_image(url)

    name = (actor_name or "").strip()
    if not name or name.lower().startswith("eventthon"):
        return ""

    parts = name.split()
    if len(parts) >= 2:
        user = await user_collection.find_one(
            {
                "first_name": {"$regex": f"^{parts[0]}$", "$options": "i"},
                "last_name": {"$regex": f"^{parts[-1]}$", "$options": "i"},
            }
        )
        if user:
            url = parse_user_imageurl(user)
            if url:
                return _public_image(url)

    # Full display name / handle
    user = await user_collection.find_one(
        {
            "$or": [
                {"name": {"$regex": f"^{name}$", "$options": "i"}},
                {"user_id": name.lower()},
                {"email": name.lower()},
                {"mobile": name},
            ]
        }
    )
    if user:
        url = parse_user_imageurl(user)
        if url:
            return _public_image(url)

    # Company logo by name
    company = await companies_collection.find_one(
        {"name": {"$regex": f"^{name}$", "$options": "i"}}
    )
    if company:
        url = parse_entity_imageurl(company)
        if url:
            return _public_image(url)

    return ""


def serialize_alert(doc: dict) -> dict:
    out = dict(doc)
    out["_id"] = str(out["_id"])
    if isinstance(out.get("created_at"), datetime):
        out["created_at"] = out["created_at"].isoformat()
    if isinstance(out.get("updated_at"), datetime):
        out["updated_at"] = out["updated_at"].isoformat()
    url = _public_image(
        str(out.get("imageurl") or out.get("actor_imageurl") or "").strip()
    )
    if url:
        out["imageurl"] = url
        out["actor_imageurl"] = url
    return out


async def enrich_alerts_images(alerts: list[dict]) -> list[dict]:
    cache: dict[str, str] = {}
    enriched = []
    for doc in alerts:
        row = serialize_alert(doc)
        if row.get("imageurl"):
            enriched.append(row)
            continue
        actor = str(row.get("actor_name") or "")
        actor_user = str(row.get("actor_user_id") or row.get("actor_ref") or "")
        actor_email = str(row.get("actor_email") or "")
        cache_key = f"{actor}|{actor_user}|{actor_email}"
        if cache_key not in cache:
            cache[cache_key] = await lookup_actor_imageurl(
                actor,
                actor_user_id=actor_user,
                actor_email=actor_email,
            )
        if cache[cache_key]:
            row["imageurl"] = cache[cache_key]
            row["actor_imageurl"] = cache[cache_key]
        enriched.append(row)
    return enriched


async def verify_alert_belongs_to_user(alert_id: str, user: dict) -> dict:
    """Allow member and employer alerts owned by this user (company detail uses same item API)."""
    if not ObjectId.is_valid(alert_id):
        raise HTTPException(status_code=400, detail="Invalid alert id")
    doc = await notification_collection.find_one({"_id": ObjectId(alert_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Alert not found")
    if str(doc.get("user_ref")) != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Alert does not belong to this user")
    return doc
