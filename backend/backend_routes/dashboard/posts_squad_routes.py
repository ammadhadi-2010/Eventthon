from fastapi import APIRouter

from database import post_collection, squad_collection
from backend_routes.dashboard.post_feed_enrich import enrich_posts_list
from backend_routes.dashboard.post_squad_link import build_squad_posts_query

router = APIRouter(tags=["Dashboard Posts"])


@router.get("/squad/{squad_id}")
async def get_squad_posts(squad_id: str):
    try:
        squad = await squad_collection.find_one(
            {"_id": squad_id},
            {"_id": 1, "leader_id": 1, "members": 1},
        )
        if not squad:
            return {"status": "error", "message": "Squad not found", "data": []}

        posts = await post_collection.find(
            build_squad_posts_query(squad_id, squad)
        ).sort("created_at", -1).to_list(length=30)
        if not posts:
            return {"status": "success", "data": []}

        await enrich_posts_list(posts)
        return {"status": "success", "data": posts}
    except Exception as exc:
        print(f"CRITICAL ERROR in get_squad_posts: {exc}")
        return {"status": "error", "message": "Could not fetch squad feed."}
