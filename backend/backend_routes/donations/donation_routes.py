"""Donation hub HTTP routes."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile

from backend_routes.auth.admin_guard import admin_guard

from .donation_schemas import (
    DonationCauseBody,
    DonationIntentBody,
    DonationOrganizationBody,
    DonationSettingsBody,
)
from .donation_media import donation_image_field_for_slot, save_donation_image, save_donation_org_logo
from .donation_service import (
    apply_donation_image,
    delete_donation_cause,
    delete_donation_organization,
    get_admin_donation_config,
    get_public_donation_config,
    list_donation_intents,
    log_donation_intent,
    save_donation_cause,
    save_donation_organization,
    update_donation_settings,
)

router = APIRouter(prefix="/donations", tags=["Donations"])


@router.get("/config")
async def public_donation_config():
    return {"status": "success", "data": await get_public_donation_config()}


@router.post("/intents")
async def create_donation_intent(body: DonationIntentBody):
    saved = await log_donation_intent(body.model_dump())
    return {"status": "success", "data": saved}


@router.get("/admin/config")
async def admin_donation_config(_admin: dict[str, Any] = Depends(admin_guard)):
    return {"status": "success", "data": await get_admin_donation_config()}


@router.put("/admin/settings")
async def admin_update_settings(body: DonationSettingsBody, _admin: dict[str, Any] = Depends(admin_guard)):
    data = await update_donation_settings(body.model_dump())
    return {"status": "success", "data": data}


@router.post("/admin/upload-image")
async def admin_upload_donation_image(
    file: UploadFile = File(...),
    slot: str = Form("hero"),
    _admin: dict[str, Any] = Depends(admin_guard),
):
    image_url = await save_donation_image(file, slot=slot.strip().lower())
    data = await apply_donation_image(slot.strip().lower(), image_url)
    field = donation_image_field_for_slot(slot.strip().lower())
    return {
        "status": "success",
        "data": {
            "url": image_url,
            "slot": slot.strip().lower(),
            "field": field,
            "config": data,
        },
    }


@router.post("/admin/upload-org-logo")
async def admin_upload_org_logo(
    file: UploadFile = File(...),
    org_id: str = Form(""),
    _admin: dict[str, Any] = Depends(admin_guard),
):
    image_url = await save_donation_org_logo(file, org_id=org_id.strip().lower())
    return {"status": "success", "data": {"url": image_url}}


@router.post("/admin/causes")
async def admin_save_cause(body: DonationCauseBody, _admin: dict[str, Any] = Depends(admin_guard)):
    data = await save_donation_cause(body.model_dump())
    return {"status": "success", "data": data}


@router.delete("/admin/causes/{cause_id}")
async def admin_delete_cause(cause_id: str, _admin: dict[str, Any] = Depends(admin_guard)):
    data = await delete_donation_cause(cause_id)
    return {"status": "success", "data": data}


@router.post("/admin/organizations")
async def admin_save_organization(body: DonationOrganizationBody, _admin: dict[str, Any] = Depends(admin_guard)):
    data = await save_donation_organization(body.model_dump())
    return {"status": "success", "data": data}


@router.delete("/admin/organizations/{org_id}")
async def admin_delete_organization(org_id: str, _admin: dict[str, Any] = Depends(admin_guard)):
    data = await delete_donation_organization(org_id)
    return {"status": "success", "data": data}


@router.get("/admin/intents")
async def admin_list_intents(
    limit: int = Query(100, ge=1, le=500),
    _admin: dict[str, Any] = Depends(admin_guard),
):
    rows = await list_donation_intents(limit)
    return {"status": "success", "data": rows}
