"""Serialize Mongo user docs into network list rows for the profile UI."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

COMMANDER_BADGES = ("gold", "purple", "blue", "green", "purple", "gold", "blue", "green")


def _display_name(doc: dict) -> str:
    fn = str(doc.get("first_name") or "").strip()
    ln = str(doc.get("last_name") or "").strip()
    return f"{fn} {ln}".strip() or str(doc.get("name") or "Member")


def _avatar(doc: dict) -> str:
    return str(doc.get("imageurl") or doc.get("profile_image_url") or doc.get("avatar") or "").strip()


def _headline(doc: dict) -> str:
    return str(doc.get("headline") or doc.get("designation") or "Developer")


def _followers_count(doc: dict) -> int:
    ids = doc.get("follower_ids") or []
    if ids:
        return len(ids)
    ps = doc.get("profile_stats") or {}
    return int(ps.get("followers", 0) or 0)


def _connections_count(doc: dict) -> int:
    ids = doc.get("connection_ids") or []
    if ids:
        return len(ids)
    ps = doc.get("profile_stats") or {}
    return int(ps.get("connections", 0) or 0)


def _fmt_k(n: int) -> str:
    x = max(0, int(n or 0))
    if x >= 1000:
        text = f"{x / 1000:.1f}K"
        return text.replace(".0K", "K")
    return str(x)


def _commander_badge(doc: dict, idx: int) -> Optional[str]:
    rank = str(doc.get("rank_tier") or doc.get("rank") or "").lower()
    if rank and rank not in ("frontline", "frontline_recruit", "frontline-recruit", "recruit"):
        return COMMANDER_BADGES[idx % len(COMMANDER_BADGES)]
    ps = doc.get("profile_stats") or {}
    if int(ps.get("followers", 0) or 0) >= 500:
        return COMMANDER_BADGES[idx % len(COMMANDER_BADGES)]
    return None


def build_network_row(
    doc: dict,
    *,
    idx: int = 0,
    list_key: str = "connections",
    mutual_count: int = 0,
    mutual_face_urls: Optional[List[str]] = None,
) -> Dict[str, Any]:
    name = _display_name(doc)
    uid = str(doc.get("_id"))
    followers = _followers_count(doc)
    connections = _connections_count(doc)
    row: Dict[str, Any] = {
        "id": uid,
        "name": name,
        "avatarUrl": _avatar(doc),
        "headline": _headline(doc),
        "squadLine": str(doc.get("squad_line") or doc.get("niche") or "").strip(),
        "followersLabel": f"{_fmt_k(followers)} followers",
        "connectionsLabel": f"{connections} connections",
        "online": bool(doc.get("is_online")),
        "commanderBadge": _commander_badge(doc, idx) if list_key == "commanders" else None,
        "verified": str(doc.get("identity_status") or "").lower() in ("approved", "verified"),
    }
    if list_key == "mutual" and mutual_count > 0:
        row.update(
            {
                "squadLine": "",
                "mutualSummary": f"{mutual_count} mutual connection{'s' if mutual_count != 1 else ''}",
                "mutualFaceUrls": mutual_face_urls or [],
                "mutualExtraCount": max(0, mutual_count - len(mutual_face_urls or [])),
                "followersLabel": "",
                "connectionsLabel": "",
            }
        )
    return row
