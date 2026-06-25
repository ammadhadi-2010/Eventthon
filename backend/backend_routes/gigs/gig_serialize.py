"""Gig document serialization with imageurl sync."""
from __future__ import annotations

from datetime import datetime


def resolve_gig_imageurl(doc: dict) -> str:
    direct = str(doc.get("imageurl") or doc.get("cover_imageurl") or "").strip()
    if direct:
        return direct
    gallery = doc.get("gallery") if isinstance(doc.get("gallery"), dict) else {}
    images = gallery.get("images") if isinstance(gallery.get("images"), list) else []
    if images:
        return str(images[0] or "").strip()
    legacy = doc.get("image_urls") or doc.get("images") or []
    if isinstance(legacy, list) and legacy:
        return str(legacy[0] or "").strip()
    return ""


def serialize_gig(doc: dict) -> dict:
    out = dict(doc)
    out.pop("seller_mobile", None)
    if "_id" in out:
        out["_id"] = str(out["_id"])
    imageurl = resolve_gig_imageurl(out)
    if imageurl:
        out["imageurl"] = imageurl
        gallery = dict(out.get("gallery") or {})
        imgs = list(gallery.get("images") or [])
        if not imgs:
            imgs = [imageurl]
        gallery["images"] = imgs
        out["gallery"] = gallery
    for key in ("created_at", "updated_at"):
        if isinstance(out.get(key), datetime):
            out[key] = out[key].isoformat()
    return out
