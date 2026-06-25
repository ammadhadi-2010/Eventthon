"""Badge theme metadata for E-1 .. E-6 matrix rows."""

from __future__ import annotations

import re
from typing import Any

RANK_ORDER = ["E-1", "E-2", "E-3", "E-4", "E-5", "E-6"]

THEME_BY_CODE: dict[str, dict[str, Any]] = {
    "E-1": {"themeId": "emerald", "badgeTier": "E1", "ribbonText": "RECRUIT", "starCount": 2},
    "E-2": {"themeId": "cyan", "badgeTier": "E2", "ribbonText": "SPECIALIST", "starCount": 3},
    "E-3": {"themeId": "silver", "badgeTier": "E3", "ribbonText": "OPERATIVE", "starCount": 3},
    "E-4": {"themeId": "gold", "badgeTier": "E4", "ribbonText": "COMMANDER", "starCount": 3},
    "E-5": {"themeId": "crimson", "badgeTier": "E5", "ribbonText": "ELITE", "starCount": 5},
    "E-6": {"themeId": "solar", "badgeTier": "E6", "ribbonText": "VANGUARD", "starCount": 5},
}

RANK_ALIASES: dict[str, str] = {
    "recruit": "E-1",
    "frontline": "E-1",
    "frontline_recruit": "E-1",
    "frontline-recruit": "E-1",
    "specialist": "E-2",
    "operative": "E-3",
    "squad": "E-4",
    "squad_leader": "E-4",
    "squad-leader": "E-4",
    "commander": "E-5",
    "elite": "E-6",
    "vanguard": "E-6",
    "e1": "E-1",
    "e2": "E-2",
    "e3": "E-3",
    "e4": "E-4",
    "e5": "E-5",
    "e6": "E-6",
}


def normalize_rank_code(raw: str | None) -> str:
    key = str(raw or "E-1").strip()
    if key.upper() in THEME_BY_CODE:
        return key.upper()
    compact = key.replace(" ", "").lower()
    if compact in RANK_ALIASES:
        return RANK_ALIASES[compact]
    if compact.startswith("e-"):
        return compact.upper()
    match = re.match(r"^e-?(\d)$", compact, re.I)
    return f"E-{match.group(1)}" if match else "E-1"


def theme_for_code(rank_code: str) -> dict[str, Any]:
    return THEME_BY_CODE.get(normalize_rank_code(rank_code), THEME_BY_CODE["E-1"])


BADGE_ASSET_BY_CODE: dict[str, str] = {
    "E-1": "/assets/Rank/E1.png",
    "E-2": "/assets/Rank/E2.png",
    "E-3": "/assets/Rank/E3.png",
    "E-4": "/assets/Rank/E4.png",
    "E-5": "/assets/Rank/E5.png",
    "E-6": "/assets/Rank/E6.png",
}


def badge_asset_url(rank_code: str) -> str:
    return BADGE_ASSET_BY_CODE.get(normalize_rank_code(rank_code), BADGE_ASSET_BY_CODE["E-1"])


def resolve_badge_icon_url(raw_url: str | None, rank_code: str) -> str:
    """Map legacy upload paths to locked frontend badge assets."""
    canonical = badge_asset_url(rank_code)
    cleaned = str(raw_url or "").strip()
    if not cleaned:
        return canonical
    if cleaned.startswith("/assets/Rank/"):
        return cleaned
    if "/static/uploads/ranks" in cleaned or cleaned.endswith(".png") and "/assets/" not in cleaned:
        return canonical
    return cleaned
