from fastapi import APIRouter, Header, HTTPException

from database import user_collection, squad_collection, hub_projects_collection, gig_orders_collection

router = APIRouter(tags=["Dashboard Main"])

ACTIVE_ORDER_STATUSES = ["Pending", "In Progress", "Beta Mode", "In Progress / Beta Mode"]


async def _resolve_user(email_h: str, mobile_h: str) -> dict:
    email = (email_h or "").strip().lower()
    mobile = (mobile_h or "").strip()
    if not email and not mobile:
        raise HTTPException(status_code=401, detail="Session required")
    query = {"email": email} if email else {"mobile": mobile}
    user = await user_collection.find_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return user


@router.get("/user-summary/{mobile}")
async def get_user_summary(mobile: str):
    user = await user_collection.find_one({"mobile": mobile.strip()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found in Atlas")
    user["_id"] = str(user["_id"])
    return {
        "status": "success",
        "first_name": user.get("first_name"),
        "last_name": user.get("last_name"),
        "role": user.get("role"),
        "wallet_balance": user.get("wallet_balance", 0.0),
        "identity_status": user.get("identity_status", "Not Submitted"),
        "is_verified": user.get("is_verified", False),
    }


@router.get("/hub-metrics")
async def get_hub_metrics(
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    x_user_mobile: str | None = Header(default=None, alias="X-User-Mobile"),
):
    """Aggregated Gigs / Squads / Projects counters for the home power dashboard."""
    user = await _resolve_user(x_user_email, x_user_mobile)
    uid = user["_id"]
    mobile = user.get("mobile") or ""

    seller_query: dict = {"seller_user_id": uid}
    if not uid and mobile:
        seller_query = {"seller_mobile": mobile}
    buyer_query = {"$or": [{"buyer_user_id": uid}]}
    if mobile:
        buyer_query["$or"].append({"buyer.mobile": mobile})

    in_progress = await gig_orders_collection.count_documents({
        **seller_query,
        "status": {"$in": ACTIVE_ORDER_STATUSES},
    })
    buyer_active = await gig_orders_collection.count_documents({
        **buyer_query,
        "status": {"$in": ACTIVE_ORDER_STATUSES},
    })
    total_orders = await gig_orders_collection.count_documents({
        "$or": [seller_query, buyer_query],
    })
    revenue = 0.0
    pipeline = [{"$match": seller_query}, {"$group": {"_id": None, "revenue": {"$sum": "$amount"}}}]
    async for row in gig_orders_collection.aggregate(pipeline):
        revenue = float(row.get("revenue") or 0)

    squads_joined = 0
    async for squad in squad_collection.find({}, {"members": 1, "leader_id": 1}):
        if str(squad.get("leader_id") or "") == uid:
            squads_joined += 1
            continue
        for member in squad.get("members") or []:
            if str(member.get("id") or "") == uid:
                squads_joined += 1
                break

    pending_proposals = 0
    my_projects = 0
    async for proj in hub_projects_collection.find({"owner_user_id": uid}, {"proposals": 1}):
        my_projects += 1
        for proposal in proj.get("proposals") or []:
            if (proposal.get("status") or "pending").lower() == "pending":
                pending_proposals += 1

    return {
        "status": "success",
        "metrics": {
            "gigs": {
                "active_orders": int(in_progress + buyer_active),
                "earnings": round(revenue, 2),
                "total_orders": int(total_orders),
            },
            "squads": {"joined_count": squads_joined},
            "projects": {
                "pending_proposals": pending_proposals,
                "my_projects": my_projects,
            },
        },
    }
