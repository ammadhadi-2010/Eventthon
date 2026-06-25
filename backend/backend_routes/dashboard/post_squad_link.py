import re

from database import squad_collection


def _norm_name(value: str) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip().lower())


def squad_member_keys(squad: dict) -> list[str]:
    keys = set()
    leader = str(squad.get("leader_id") or "").strip()
    if leader:
        keys.add(leader)
    for member in squad.get("members", []):
        for field in ("id", "user_id"):
            value = str(member.get(field) or "").strip()
            if value:
                keys.add(value)
    return list(keys)


async def find_user_squad_ids(user_id: str, author_name: str = "") -> list[str]:
    uid = str(user_id or "").strip()
    if not uid:
        return []

    squads = await squad_collection.find(
        {
            "$or": [
                {"leader_id": uid},
                {"members.id": uid},
                {"members.user_id": uid},
            ]
        },
        {"_id": 1},
    ).to_list(length=100)

    ids = [str(row["_id"]) for row in squads]
    name_key = _norm_name(author_name)
    if not name_key:
        return ids

    name_rows = await squad_collection.find(
        {"members.name": {"$regex": f"^{re.escape(author_name.strip())}$", "$options": "i"}},
        {"_id": 1},
    ).to_list(length=50)
    for row in name_rows:
        sid = str(row["_id"])
        if sid not in ids:
            ids.append(sid)
    return ids


def build_squad_posts_query(squad_id: str, squad: dict) -> dict:
    clauses = [
        {"squad_id": squad_id},
        {"squad_ids": squad_id},
        {"squad_activity_feed": True, "squad_ids": squad_id},
    ]

    member_keys = squad_member_keys(squad)
    if member_keys:
        clauses.append({"post_type": {"$in": ["SQUAD", "squad"]}, "user_id": {"$in": member_keys}})

    return {"$or": clauses}
