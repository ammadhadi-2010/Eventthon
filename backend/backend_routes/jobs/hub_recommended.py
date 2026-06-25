"""Skill-based job recommendations for the Jobs hub."""
from __future__ import annotations

import re
from typing import Any, List

from database import user_collection
from .hub_listings import fetch_public_job_docs, job_doc_to_listing_card


def _normalize_skills(raw: Any) -> List[str]:
    if not isinstance(raw, list):
        return []
    out: List[str] = []
    for item in raw:
        if isinstance(item, str) and item.strip():
            out.append(item.strip())
        elif isinstance(item, dict):
            name = item.get("name") or item.get("skill") or item.get("label")
            if name and str(name).strip():
                out.append(str(name).strip())
    return out


def _skill_tokens(skills: List[str]) -> set[str]:
    tokens: set[str] = set()
    for skill in skills:
        key = skill.lower().strip()
        if key:
            tokens.add(key)
            for part in re.split(r"[/\s,.-]+", key):
                if len(part) > 1:
                    tokens.add(part)
    return tokens


def compute_skill_match(user_skills: List[str], job_tags: List[str]) -> dict:
    user_tokens = _skill_tokens(user_skills)
    tag_tokens = _skill_tokens(job_tags)
    if not tag_tokens:
        return {"matchPercent": 0, "matchingTags": []}
    matching = [t for t in tag_tokens if t in user_tokens]
    for tag in list(tag_tokens):
        if tag in matching:
            continue
        for ut in user_tokens:
            if tag in ut or ut in tag:
                matching.append(tag)
                break
    matching = sorted(set(matching))
    percent = min(100, round((len(matching) / len(tag_tokens)) * 100)) if tag_tokens else 0
    if user_tokens and not matching:
        percent = max(percent, 25)
    return {"matchPercent": percent, "matchingTags": matching}


async def load_user_skills(user_id: str) -> List[str]:
    uid = str(user_id or "").strip()
    if not uid:
        return ["React", "Node.js"]
    doc = await user_collection.find_one(
        {"$or": [{"user_id": uid}, {"mobile": uid}, {"email": uid.lower()}]}
    )
    skills = _normalize_skills(doc.get("skills") if doc else [])
    return skills or ["React", "Node.js", "TypeScript"]


async def recommended_jobs(user_id: str, limit: int = 20) -> List[dict]:
    user_skills = await load_user_skills(user_id)
    docs = await fetch_public_job_docs(limit=80)
    rows: List[dict] = []
    for doc in docs:
        card = job_doc_to_listing_card(doc)
        match = compute_skill_match(user_skills, card["tags"])
        matched_set = {t.lower() for t in match["matchingTags"]}
        tag_matches = {
            tag: tag.lower() in matched_set
            or any(tag.lower() in m or m in tag.lower() for m in matched_set)
            for tag in card["tags"]
        }
        rows.append(
            {
                **card,
                "matchPercent": match["matchPercent"],
                "matchLabel": f"{match['matchPercent']}% match",
                "matchingTags": match["matchingTags"],
                "tagMatches": tag_matches,
            }
        )
    rows.sort(key=lambda r: r["matchPercent"], reverse=True)
    return rows[:limit]
