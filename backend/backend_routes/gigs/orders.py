from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from database import gig_orders_collection, gigs_collection

from .gig_notify import notify_seller_new_order
from .gigs_session import assert_actor_id, assert_gig_owner, verify_gigs_session

router = APIRouter(prefix="/gigs/orders", tags=["Gig Orders"])

BETA_ORDER_STATUS = "In Progress / Beta Mode"


class OrderCreate(BaseModel):
    """Create a gig order using user ids (no phone/email required on the client)."""

    gig_id: str = Field(..., min_length=12, max_length=32)
    buyer_user_id: str = Field(..., min_length=2, max_length=120)
    package_tier: str = Field("basic", max_length=24)
    amount: float = Field(0, ge=0)
    status: str = Field(default=BETA_ORDER_STATUS)
    beta_mode: bool = Field(default=True)
    buyer_display_name: Optional[str] = Field(None, max_length=120)
    gig_title: Optional[str] = Field(None, max_length=180)


class OrderStatusUpdate(BaseModel):
    status: str


def _serialize_order(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    if isinstance(doc.get("gig_id"), ObjectId):
        doc["gig_id"] = str(doc["gig_id"])
    return doc


def _parse_object_id(raw_id: str) -> ObjectId:
    if not ObjectId.is_valid(raw_id):
        raise HTTPException(status_code=400, detail="Invalid order id")
    return ObjectId(raw_id)


@router.post("/")
async def create_order(payload: OrderCreate, user: dict = Depends(verify_gigs_session)):
    await assert_actor_id(payload.buyer_user_id, user)
    gid = payload.gig_id.strip()
    if not ObjectId.is_valid(gid):
        raise HTTPException(status_code=400, detail="Invalid gig id")

    oid = ObjectId(gid)
    gig = await gigs_collection.find_one({"_id": oid})
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")

    seller_uid = (gig.get("seller_user_id") or "").strip()
    buyer_uid = payload.buyer_user_id.strip()
    if not seller_uid:
        raise HTTPException(status_code=400, detail="This gig has no seller user id configured")
    if buyer_uid == seller_uid:
        raise HTTPException(status_code=400, detail="Cannot order your own gig")

    title_source = (payload.gig_title or "").strip()
    gig_title = title_source or (gig.get("title") or "Untitled").strip()
    tier = (payload.package_tier or "basic").strip().lower()

    buyer_name = (payload.buyer_display_name or "").strip() or "Verified buyer"
    beta_mode = bool(payload.beta_mode)
    tier_label = tier.capitalize() if tier else "Basic"

    if beta_mode:
        order_status = BETA_ORDER_STATUS
        order_amount = 0.0
    else:
        order_status = (payload.status or "Pending").strip() or "Pending"
        order_amount = float(payload.amount)

    now = datetime.utcnow()
    doc = {
        "gig_id": oid,
        "gig_title": gig_title,
        "seller_user_id": seller_uid,
        "buyer_user_id": buyer_uid,
        "package_tier": tier,
        "buyer": {
            "name": buyer_name,
            "user_id": buyer_uid,
        },
        "amount": order_amount,
        "status": order_status,
        "beta_mode": beta_mode,
        "created_at": now,
        "updated_at": now,
    }
    result = await gig_orders_collection.insert_one(doc)
    await gigs_collection.update_one({"_id": oid}, {"$inc": {"orders": 1}})
    created = await gig_orders_collection.find_one({"_id": result.inserted_id})
    order = _serialize_order(created)
    order_id = order.get("_id") or str(result.inserted_id)
    await notify_seller_new_order(
        seller_uid,
        buyer_label=buyer_name,
        gig_title=gig_title,
        order_id=order_id,
    )
    chat_body = (
        f"Hi! I'm interested in the {tier_label} package for \"{gig_title}\". "
        "Global beta — let's discuss scope in chat. No payment checkout required."
    )
    return {
        "status": "success",
        "order": order,
        "messages_route": "/messages",
        "chat_context": {
            "chat_type": "gig",
            "chat_tag": "Gig Inquiry",
            "seller_user_id": seller_uid,
            "context_id": str(oid),
            "context_title": gig_title,
            "order_id": order_id,
            "package_tier": tier,
            "body": chat_body,
        },
    }


@router.get("/")
async def list_orders(
    status: str = Query("", description="Filter by status"),
    seller_mobile: str = Query("", description="Legacy filter by seller mobile"),
    seller_user_id: str = Query("", description="Filter by gig seller user id"),
    buyer_mobile: str = Query("", description="Legacy filter by buyer mobile"),
    buyer_user_id: str = Query("", description="Filter by buyer user id"),
    search: str = Query("", description="Search by gig title or buyer name"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    query: dict = {}

    if status.strip():
        query["status"] = status.strip()
    if seller_user_id.strip():
        query["seller_user_id"] = seller_user_id.strip()
    elif seller_mobile.strip():
        query["seller_mobile"] = seller_mobile.strip()
    if buyer_user_id.strip():
        query["buyer_user_id"] = buyer_user_id.strip()
    elif buyer_mobile.strip():
        query["buyer.mobile"] = buyer_mobile.strip()

    if search.strip():
        safe = search.strip()
        query["$or"] = [
            {"gig_title": {"$regex": safe, "$options": "i"}},
            {"buyer.name": {"$regex": safe, "$options": "i"}},
            {"buyer_user_id": {"$regex": safe, "$options": "i"}},
        ]

    cursor = gig_orders_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    orders = [_serialize_order(doc) async for doc in cursor]
    total = await gig_orders_collection.count_documents(query)
    return {"status": "success", "total": total, "orders": orders}


@router.get("/buyers")
async def list_order_buyers(
    status: str = Query("", description="Filter buyers by order status"),
    seller_mobile: str = Query("", description="Legacy filter sellers by seller mobile"),
    seller_user_id: str = Query("", description="Filter sellers by seller user id"),
):
    query: dict = {}
    if status.strip():
        query["status"] = status.strip()
    if seller_user_id.strip():
        query["seller_user_id"] = seller_user_id.strip()
    elif seller_mobile.strip():
        query["seller_mobile"] = seller_mobile.strip()

    cursor = gig_orders_collection.find(query).sort("created_at", -1)
    buyer_rows = []
    async for doc in cursor:
        buyer = doc.get("buyer", {}) or {}
        buyer_rows.append(
            {
                "order_id": str(doc["_id"]),
                "buyer_user_id": doc.get("buyer_user_id", ""),
                "buyer_name": buyer.get("name", ""),
                "buyer_email": buyer.get("email", ""),
                "buyer_phone": buyer.get("phone", ""),
                "buyer_country": buyer.get("country", ""),
                "amount": doc.get("amount", 0),
                "status": doc.get("status", ""),
            }
        )

    return {"status": "success", "total": len(buyer_rows), "buyers": buyer_rows}


@router.get("/stats")
async def orders_stats(
    seller_mobile: str = Query("", description="Legacy seller filter"),
    seller_user_id: str = Query("", description="Seller user id"),
):
    query: dict = {}
    if seller_user_id.strip():
        query["seller_user_id"] = seller_user_id.strip()
    elif seller_mobile.strip():
        query["seller_mobile"] = seller_mobile.strip()

    total = await gig_orders_collection.count_documents(query)
    pending = await gig_orders_collection.count_documents({**query, "status": "Pending"})
    in_progress = await gig_orders_collection.count_documents({
        **query,
        "status": {"$in": ["In Progress", BETA_ORDER_STATUS]},
    })
    completed = await gig_orders_collection.count_documents({**query, "status": "Completed"})

    pipeline = [
        {"$match": query},
        {"$group": {"_id": None, "revenue": {"$sum": "$amount"}}},
    ]
    revenue = 0.0
    async for row in gig_orders_collection.aggregate(pipeline):
        revenue = float(row.get("revenue", 0.0))

    return {
        "status": "success",
        "stats": {
            "total_orders": total,
            "pending_orders": pending,
            "in_progress_orders": in_progress,
            "completed_orders": completed,
            "total_revenue": revenue,
        },
    }


@router.get("/{order_id}")
async def get_order(order_id: str):
    oid = _parse_object_id(order_id)
    order = await gig_orders_collection.find_one({"_id": oid})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"status": "success", "order": _serialize_order(order)}


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str,
    payload: OrderStatusUpdate,
    seller_user_id: str = Query("", max_length=120),
    buyer_user_id: str = Query("", max_length=120),
    user: dict = Depends(verify_gigs_session),
):
    oid = _parse_object_id(order_id)
    existing = await gig_orders_collection.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Order not found")

    seller_uid = str(existing.get("seller_user_id") or "").strip()
    buyer_uid = str(existing.get("buyer_user_id") or "").strip()
    actor = seller_user_id.strip() or buyer_user_id.strip()
    if not actor:
        raise HTTPException(status_code=400, detail="seller_user_id or buyer_user_id is required")
    await assert_actor_id(actor, user)
    if actor not in {seller_uid, buyer_uid}:
        raise HTTPException(status_code=403, detail="You may only update your own orders")

    result = await gig_orders_collection.update_one(
        {"_id": oid},
        {"$set": {"status": payload.status.strip(), "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    updated = await gig_orders_collection.find_one({"_id": oid})
    return {"status": "success", "order": _serialize_order(updated)}


@router.delete("/{order_id}")
async def delete_order(
    order_id: str,
    seller_user_id: str = Query(..., min_length=2, max_length=120),
    user: dict = Depends(verify_gigs_session),
):
    await assert_gig_owner(seller_user_id.strip(), user)
    oid = _parse_object_id(order_id)
    result = await gig_orders_collection.delete_one(
        {"_id": oid, "seller_user_id": seller_user_id.strip()}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"status": "success", "message": "Order deleted"}
