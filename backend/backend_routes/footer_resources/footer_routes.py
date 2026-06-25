"""Footer resource CMS HTTP routes."""
from __future__ import annotations

from fastapi import APIRouter, File, Query, UploadFile

from .footer_media import save_footer_media
from .footer_schemas import (
    FOOTER_CATEGORIES,
    FOOTER_COMPANY_CATEGORIES,
    FOOTER_RESOURCE_CATEGORIES,
    FooterResourceCreate,
    FooterResourceUpdate,
)
from .footer_service import (
    create_footer_resource,
    delete_footer_resource,
    get_footer_resources,
    update_footer_resource,
)

router = APIRouter(prefix="/footer-cms-resources", tags=["Footer CMS Resources"])


@router.get("")
async def list_footer_resources(
    category: str = Query("", max_length=80),
    footer_block: str = Query("", max_length=20),
):
    rows = await get_footer_resources(category, footer_block)
    return {
        "status": "success",
        "categories": list(FOOTER_CATEGORIES),
        "resourceCategories": list(FOOTER_RESOURCE_CATEGORIES),
        "companyCategories": list(FOOTER_COMPANY_CATEGORIES),
        "data": rows,
    }


@router.post("")
async def create_footer_resource_route(payload: FooterResourceCreate):
    row = await create_footer_resource(payload)
    return {"status": "success", "data": row}


@router.post("/upload-media")
async def upload_footer_media_route(file: UploadFile = File(...)):
    payload = await save_footer_media(file)
    return {"status": "success", "data": payload}


@router.put("/{resource_id}")
async def update_footer_resource_route(resource_id: str, payload: FooterResourceUpdate):
    row = await update_footer_resource(resource_id, payload)
    return {"status": "success", "data": row}


@router.delete("/{resource_id}")
async def delete_footer_resource_route(resource_id: str):
    result = await delete_footer_resource(resource_id)
    return {"status": "success", "data": result}
