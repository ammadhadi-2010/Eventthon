"""Follow / connect / unfollow actions between users."""

from __future__ import annotations

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException

from database import user_collection

from .queries import user_lookup_query
from .schemas import SocialActionBody

ALLOWED_ACTIONS = (
    "follow",
    "unfollow",
    "connect",
    "accept_connect",
    "reject_connect",
    "message",
)


async def _load_target(tid: str) -> tuple[ObjectId, dict]:
    try:
        oid = ObjectId(tid)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail="Invalid target_user_id")
    target = await user_collection.find_one({"_id": oid})
    if not target:
        raise HTTPException(status_code=404, detail="Target user not found")
    return oid, target


async def _inc_stat(user_filter: dict, field: str, delta: int) -> None:
    if not delta:
        return
    await user_collection.update_one(user_filter, {"$inc": {f"profile_stats.{field}": delta}})


async def apply_social_action(identifier: str, body: SocialActionBody) -> dict:
    if body.action not in ALLOWED_ACTIONS:
        raise HTTPException(status_code=400, detail="Invalid action")

    q = user_lookup_query(identifier)
    user = await user_collection.find_one(q)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if body.action == "message":
        return {"ok": True, "hint": "Open Messages from the top nav to start a chat."}

    tid = (body.target_user_id or "").strip()
    if not tid:
        raise HTTPException(status_code=400, detail="target_user_id required")

    oid, target = await _load_target(tid)
    self_id = str(user["_id"])
    if self_id == tid:
        raise HTTPException(status_code=400, detail="Cannot target self")

    if body.action == "follow":
        own = await user_collection.update_one(q, {"$addToSet": {"following_ids": tid}})
        if own.modified_count:
            await user_collection.update_one({"_id": oid}, {"$addToSet": {"follower_ids": self_id}})
            await _inc_stat(q, "following", 1)
            await _inc_stat({"_id": oid}, "followers", 1)

    elif body.action == "unfollow":
        own = await user_collection.update_one(q, {"$pull": {"following_ids": tid}})
        if own.modified_count:
            await user_collection.update_one({"_id": oid}, {"$pull": {"follower_ids": self_id}})
            await _inc_stat(q, "following", -1)
            await _inc_stat({"_id": oid}, "followers", -1)

    elif body.action == "connect":
        await user_collection.update_one(q, {"$addToSet": {"pending_connect_user_ids": tid}})
        await user_collection.update_one({"_id": oid}, {"$addToSet": {"incoming_connect_user_ids": self_id}})

    elif body.action == "accept_connect":
        incoming = [str(x) for x in (user.get("incoming_connect_user_ids") or [])]
        if tid not in incoming:
            raise HTTPException(status_code=400, detail="No pending connect request from this user")
        await user_collection.update_one(q, {"$pull": {"incoming_connect_user_ids": tid}})
        await user_collection.update_one({"_id": oid}, {"$pull": {"pending_connect_user_ids": self_id}})
        await user_collection.update_one(q, {"$addToSet": {"connection_ids": tid}})
        await user_collection.update_one({"_id": oid}, {"$addToSet": {"connection_ids": self_id}})
        await _inc_stat(q, "connections", 1)
        await _inc_stat({"_id": oid}, "connections", 1)

    elif body.action == "reject_connect":
        await user_collection.update_one(q, {"$pull": {"incoming_connect_user_ids": tid}})
        await user_collection.update_one({"_id": oid}, {"$pull": {"pending_connect_user_ids": self_id}})

    return {"ok": True, "action": body.action}
