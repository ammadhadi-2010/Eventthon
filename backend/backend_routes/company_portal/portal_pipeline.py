"""Company hub — talent pipeline columns from application statuses."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from .portal_shared import relative_time
from .portal_resolve import find_user
from backend_routes.jobs.hub_shared import normalize_status

PIPELINE_STAGES = (
    ("applied", "Applied"),
    ("screening", "Screening"),
    ("interview", "Interview"),
    ("technical", "Technical Test"),
    ("final", "Final Interview"),
    ("offer", "Offer Sent"),
    ("hired", "Hired"),
)


def pipeline_stage(raw: Any, pipeline_hint: Any = None) -> Optional[str]:
    stage_keys = {key for key, _ in PIPELINE_STAGES}
    hint = str(pipeline_hint or "").strip().lower().replace("_", "-")
    if hint in stage_keys:
        return hint
    text = str(raw or "").strip().lower().replace("_", "-")
    if "reject" in text:
        return None
    if text in stage_keys:
        return text
    if "hire" in text or text == "hired":
        return "hired"
    if "offer" in text or text == "offered":
        return "offer"
    if "final" in text:
        return "final"
    if "technical" in text or "tech-test" in text or "tech test" in text:
        return "technical"
    if "shortlist" in text:
        return "offer"
    key = normalize_status(raw)
    if key == "interview":
        return "interview"
    if key == "in-review":
        return "screening"
    if key == "offered":
        return "offer"
    return "applied"


async def build_talent_pipeline(apps: List[dict], per_column: int = 3) -> dict:
    buckets: Dict[str, List[dict]] = {key: [] for key, _ in PIPELINE_STAGES}
    for doc in apps:
        stage = pipeline_stage(doc.get("status"), doc.get("pipeline_stage"))
        if not stage or stage not in buckets:
            continue
        buckets[stage].append(doc)

    columns = []
    for key, label in PIPELINE_STAGES:
        docs = sorted(buckets[key], key=lambda d: str(d.get("created_at") or ""), reverse=True)
        cards: List[dict] = []
        for doc in docs[:per_column]:
            uid = str(doc.get("user_identifier") or doc.get("user_id") or "")
            user = await find_user(uid) if uid else None
            if user:
                fn = (user.get("first_name") or "").strip()
                ln = (user.get("last_name") or "").strip()
                name = f"{fn} {ln}".strip() or "Applicant"
                imageurl = str(user.get("profile_image_url") or user.get("avatar") or "")
            else:
                name = uid or "Applicant"
                imageurl = ""
            cards.append(
                {
                    "id": str(doc.get("_id") or ""),
                    "name": name,
                    "imageurl": imageurl,
                    "position": str(doc.get("role") or "Role"),
                    "time": relative_time(doc.get("created_at")),
                }
            )
        columns.append({"key": key, "label": label, "count": len(docs), "cards": cards})

    return {"columns": columns}
