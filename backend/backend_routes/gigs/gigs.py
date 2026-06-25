import re
from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from database import gigs_collection, user_collection

from .gig_serialize import serialize_gig
from .gigs_session import assert_gig_owner, verify_gigs_session
from .list_filters import build_gig_list_query, gig_list_sort_options

_ALLOWED_BUCKETS = {"24h", "3d", "7d", "week_plus"}
_ALLOWED_SELLER_LEVELS = {"top", "lvl2", "lvl1", "new"}


def _parse_pipe_buckets(raw: str, allowed: set[str]) -> list[str]:
    out: list[str] = []
    for part in str(raw).split("|"):
        tok = part.strip().lower()
        if tok == "week+":
            tok = "week_plus"
        if tok in allowed:
            out.append(tok)
    return out

router = APIRouter(prefix="/gigs", tags=["Gigs"])


class GigCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=140)
    description: str = Field("", max_length=5000)
    category: str = Field("General", max_length=120)
    starting_price: float = Field(..., ge=0)
    seller_user_id: str = Field(..., min_length=3, max_length=120)
    owner_type: str = Field("user")
    squad_id: Optional[str] = None
    status: str = Field("Draft")
    tags: list[str] = []


class GigUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=140)
    description: Optional[str] = Field(None, max_length=5000)
    category: Optional[str] = Field(None, max_length=120)
    starting_price: Optional[float] = Field(None, ge=0)
    status: Optional[str] = None
    tags: Optional[list[str]] = None


class GigStatusUpdate(BaseModel):
    status: str


def _object_id_or_404(gig_id: str) -> ObjectId:
    if not ObjectId.is_valid(gig_id):
        raise HTTPException(status_code=400, detail="Invalid gig id")
    return ObjectId(gig_id)


@router.post("/")
async def create_gig(payload: GigCreate, user: dict = Depends(verify_gigs_session)):
    await assert_gig_owner(payload.seller_user_id, user)
    now = datetime.utcnow()
    clean_owner_type = (payload.owner_type or "user").strip().lower()
    gig_doc = {
        "title": payload.title.strip(),
        "description": payload.description.strip(),
        "category": payload.category.strip(),
        "starting_price": payload.starting_price,
        "seller_user_id": payload.seller_user_id.strip(),
        "owner_type": clean_owner_type if clean_owner_type in {"user", "squad"} else "user",
        "owner_id": (payload.squad_id or "").strip() if clean_owner_type == "squad" else payload.seller_user_id.strip(),
        "squad_id": (payload.squad_id or "").strip() if clean_owner_type == "squad" else None,
        "status": payload.status.strip() or "Draft",
        "tags": payload.tags,
        "orders": 0,
        "rating": 0.0,
        "created_at": now,
        "updated_at": now,
    }
    result = await gigs_collection.insert_one(gig_doc)
    created = await gigs_collection.find_one({"_id": result.inserted_id})
    return {"status": "success", "gig": serialize_gig(created)}


@router.get("/")
async def list_gigs(
    search: str = Query("", description="Title, category, or description search"),
    status: str = Query("", description="Filter by gig status"),
    category: str = Query("", description="Category substring"),
    seller_user_id: str = Query("", description="Seller user id"),
    service_type: str = Query("", description="Substring match service_type"),
    budget_ranges: str = Query("", description="Pipe-coded ranges lo:hi|lo:hi"),
    sort: str = Query("", description="recent|reviews|price_asc|price_desc|fastest_delivery"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    delivery_days_max: Optional[int] = Query(None, ge=0, le=365),
    delivery_buckets: str = Query(
        "",
        description="Delivery facet filters (OR): pipe-separated 24h|3d|7d|week_plus",
    ),
    seller_levels: str = Query(
        "",
        description="Seller level filters (OR): pipe-separated top|lvl2|lvl1|new",
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    parsed_buckets = _parse_pipe_buckets(delivery_buckets, _ALLOWED_BUCKETS)
    parsed_sellers = _parse_pipe_buckets(seller_levels, _ALLOWED_SELLER_LEVELS)
    query = build_gig_list_query(
        search=search,
        category=category,
        status=status,
        seller_user_id=seller_user_id,
        service_type=service_type,
        min_rating=min_rating,
        min_price=min_price,
        max_price=max_price,
        delivery_days_max=delivery_days_max,
        budgets_encoded=budget_ranges,
        delivery_buckets=parsed_buckets or None,
        seller_levels=parsed_sellers or None,
    )
    sort_spec = gig_list_sort_options(sort)
    cursor = gigs_collection.find(query).sort(sort_spec).skip(skip).limit(limit)
    gigs = [serialize_gig(doc) async for doc in cursor]
    total = await gigs_collection.count_documents(query)

    return {"status": "success", "total": total, "gigs": gigs}


def _display_name_from_user(doc: dict) -> str:
    fn = str(doc.get("first_name") or "").strip()
    ln = str(doc.get("last_name") or "").strip()
    full = f"{fn} {ln}".strip()
    if full:
        return full
    for key in ("user_id", "email", "mobile"):
        val = doc.get(key)
        if val:
            return str(val).strip()
    return "Seller"


async def _seller_profiles_lookup(seller_ids: list[str]) -> dict[str, dict]:
    """Map normalized seller identifiers (mongo id / user_id / mobile) → display info."""
    clean = sorted({str(x).strip() for x in seller_ids if str(x).strip()})
    if not clean:
        return {}

    oid_list = []
    for x in clean:
        if ObjectId.is_valid(x):
            try:
                oid_list.append(ObjectId(x))
            except Exception:
                pass

    or_clauses: list[dict] = [
        {"user_id": {"$in": clean}},
        {"mobile": {"$in": clean}},
    ]
    if oid_list:
        or_clauses.append({"_id": {"$in": oid_list}})

    keyed: dict[str, dict] = {}
    cursor = user_collection.find({"$or": or_clauses})
    async for u in cursor:
        display_name = _display_name_from_user(u)
        initials_source = (
            display_name.split()[0] if display_name and display_name != "Seller" else str(u.get("user_id") or "")
        )
        initial = initials_source.strip()[:1].upper() or "S"

        mongo_id = str(u["_id"])
        alias_keys = {
            mongo_id,
            str(u.get("user_id") or "").strip(),
            str(u.get("mobile") or "").strip(),
        }
        entry = {"display_name": display_name, "avatar_initial": initial}

        for key in alias_keys:
            if key:
                keyed[key] = entry

    resolved: dict[str, dict] = {}
    for sid in clean:
        if sid in keyed:
            resolved[sid] = keyed[sid]
        else:
            short = sid[-4:] if len(sid) > 6 else sid
            resolved[sid] = {
                "display_name": f"Seller {short}" if short else "Seller",
                "avatar_initial": (sid[:1] or "?").upper(),
            }

    return resolved


@router.get("/providers/by-category")
async def list_providers_by_category(
    category: str = Query(..., min_length=1, max_length=160, description="Category label (substring match case-insensitive)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(80, ge=1, le=200),
):
    """
    Unique sellers offering published gigs in this category.
    Frontend uses GLOBAL_SERVICE_CATEGORY_OPTIONS names (Web Development, etc.).
    """
    cat = category.strip()
    if not cat:
        raise HTTPException(status_code=400, detail="category is required")

    cat_rx = re.escape(cat)

    base_match = {
        "status": "Published",
        "category": {"$regex": cat_rx, "$options": "i"},
        "seller_user_id": {"$exists": True, "$nin": [None, "", " "]},
    }

    total_cursor = gigs_collection.aggregate(
        [
            {"$match": base_match},
            {"$group": {"_id": "$seller_user_id"}},
            {"$count": "total"},
        ]
    )
    total_row = await total_cursor.to_list(1)
    total = int(total_row[0]["total"]) if total_row else 0

    pipeline = [
        {"$match": base_match},
        {
            "$group": {
                "_id": "$seller_user_id",
                "gig_count": {"$sum": 1},
                "orders_sum": {"$sum": {"$ifNull": ["$orders", 0]}},
                "titles": {"$push": "$title"},
                "avg_rating_val": {"$avg": "$rating"},
                "min_price": {"$min": "$starting_price"},
            },
        },
        {"$sort": {"orders_sum": -1, "gig_count": -1, "_id": 1}},
        {"$skip": skip},
        {"$limit": limit},
    ]

    rows = await gigs_collection.aggregate(pipeline).to_list(length=limit)

    seller_ids = [str(r["_id"]).strip() for r in rows if r.get("_id")]
    profiles = await _seller_profiles_lookup(seller_ids)

    providers: list[dict] = []
    for r in rows:
        sid = str(r["_id"]).strip()
        prof = profiles.get(sid) or {}
        titles = [t for t in (r.get("titles") or []) if isinstance(t, str) and t.strip()]
        avg_r = r.get("avg_rating_val")
        avg_out = round(float(avg_r), 2) if avg_r is not None and float(avg_r) > 0 else None
        mp = r.get("min_price")
        min_p = float(mp) if mp is not None else None

        providers.append(
            {
                "seller_user_id": sid,
                "display_name": prof.get("display_name") or (f"Seller {sid[-6:]}" if sid else "Seller"),
                "avatar_initial": prof.get("avatar_initial") or (sid[:1] or "?").upper(),
                "gig_count": int(r.get("gig_count") or 0),
                "orders_completed": int(r.get("orders_sum") or 0),
                "avg_rating": avg_out,
                "from_price": min_p,
                "sample_titles": titles[:3],
            },
        )

    return {"status": "success", "category": cat, "total": total, "providers": providers}


@router.get("/my/{user_id}")
async def my_gigs(user_id: str, user: dict = Depends(verify_gigs_session)):
    uid = user_id.strip()
    await assert_gig_owner(uid, user)
    query = {"seller_user_id": uid}
    cursor = gigs_collection.find(query).sort("created_at", -1)
    gigs = [serialize_gig(doc) async for doc in cursor]
    return {"status": "success", "total": len(gigs), "gigs": gigs}


@router.get("/{gig_id}")
async def get_gig(gig_id: str):
    oid = _object_id_or_404(gig_id)
    gig = await gigs_collection.find_one({"_id": oid})
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    return {"status": "success", "gig": serialize_gig(gig)}


@router.put("/{gig_id}")
async def update_gig(gig_id: str, payload: GigUpdate, user: dict = Depends(verify_gigs_session)):
    oid = _object_id_or_404(gig_id)
    existing = await gigs_collection.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Gig not found")
    await assert_gig_owner(str(existing.get("seller_user_id") or ""), user)
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided")
    updates["updated_at"] = datetime.utcnow()
    result = await gigs_collection.update_one({"_id": oid}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Gig not found")

    updated = await gigs_collection.find_one({"_id": oid})
    return {"status": "success", "gig": serialize_gig(updated)}


@router.patch("/{gig_id}/status")
async def update_gig_status(gig_id: str, payload: GigStatusUpdate, user: dict = Depends(verify_gigs_session)):
    oid = _object_id_or_404(gig_id)
    existing = await gigs_collection.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Gig not found")
    await assert_gig_owner(str(existing.get("seller_user_id") or ""), user)
    result = await gigs_collection.update_one(
        {"_id": oid},
        {"$set": {"status": payload.status.strip(), "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Gig not found")
    updated = await gigs_collection.find_one({"_id": oid})
    return {"status": "success", "gig": serialize_gig(updated)}


@router.delete("/{gig_id}")
async def delete_gig(gig_id: str, user: dict = Depends(verify_gigs_session)):
    oid = _object_id_or_404(gig_id)
    existing = await gigs_collection.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Gig not found")
    await assert_gig_owner(str(existing.get("seller_user_id") or ""), user)
    result = await gigs_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Gig not found")
    return {"status": "success", "message": "Gig deleted"}
