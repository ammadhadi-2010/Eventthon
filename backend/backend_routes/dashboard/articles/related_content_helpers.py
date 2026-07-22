import json
from typing import Any

RELATED_CONTENT_KEYS = ("squads", "projects", "jobs", "gigs", "members", "articles")
MAX_ITEMS_PER_CATEGORY = 20


def normalize_related_content(raw: Any) -> dict[str, list[dict[str, str]]]:
    base = {key: [] for key in RELATED_CONTENT_KEYS}
    data: Any = raw

    if isinstance(raw, str) and raw.strip():
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            return base
    if not isinstance(data, dict):
        return base

    for key in RELATED_CONTENT_KEYS:
        rows = data.get(key)
        if not isinstance(rows, list):
            continue
        cleaned: list[dict[str, str]] = []
        for row in rows:
            if not isinstance(row, dict):
                continue
            item_id = str(row.get("id") or "").strip()
            label = str(row.get("label") or "").strip()
            if item_id and label:
                cleaned.append({"id": item_id, "label": label})
        base[key] = cleaned[:MAX_ITEMS_PER_CATEGORY]
    return base
