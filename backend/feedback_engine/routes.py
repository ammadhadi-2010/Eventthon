"""Enterprise user feedback submission API."""
from __future__ import annotations

import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from .reply import submit_feedback_reply
from .resolve import submit_feedback_resolve
from .schema import FeedbackReplyPayload, FeedbackStatusPayload, FeedbackSubmitPayload
from .status_handler import submit_feedback_status
from .store import build_feedback_document, insert_feedback_report
from .upload import save_feedback_screenshot

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.post("/submit")
async def submit_feedback_report(
    type: str = Form(...),
    description: str = Form(...),
    pageUrl: str = Form(...),
    clientDevice: str = Form(default="{}"),
    imageurl: UploadFile | None = File(None),
    user_id: str | None = Form(None),
    user_email: str | None = Form(None),
    user_mobile: str | None = Form(None),
):
    """Accept issue reports with optional screenshot and background telemetry."""
    try:
        screenshot_path = await save_feedback_screenshot(imageurl)
        payload = FeedbackSubmitPayload(
            type=type,
            description=description,
            page_url=pageUrl,
            imageurl=screenshot_path or None,
            client_device=clientDevice,
            user_id=user_id,
            user_email=user_email,
            user_mobile=user_mobile,
        )
        document = build_feedback_document(payload.model_dump())
        report_id = await insert_feedback_report(document)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Feedback report insert failed: %s", exc)
        raise HTTPException(status_code=500, detail="Could not save feedback report.") from exc

    logger.info(
        "Feedback report stored: id=%s type=%s page=%s device=%s",
        report_id,
        document["type"],
        document["page_url"][:120],
        document.get("client_device", {}).get("summary", "unknown"),
    )
    return {
        "status": "success",
        "message": "Thank you — your report was submitted.",
        "data": {"id": report_id, "type": document["type"], "status": document["status"]},
    }


@router.post("/status/{report_id}")
async def update_feedback_status(report_id: str, payload: FeedbackStatusPayload):
    """Admin status transition for bug report workflow pills."""
    try:
        updated = await submit_feedback_status(report_id, payload.status)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Feedback status update failed: %s", exc)
        raise HTTPException(status_code=500, detail="Could not update feedback status.") from exc

    return {
        "status": "success",
        "message": "Feedback status updated.",
        "data": updated,
    }


@router.post("/resolve/{report_id}")
async def resolve_feedback_report(report_id: str):
    """Admin one-click solve — marks report resolved and notifies the reporter."""
    try:
        updated = await submit_feedback_resolve(report_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Feedback resolve failed: %s", exc)
        raise HTTPException(status_code=500, detail="Could not resolve feedback report.") from exc

    return {
        "status": "success",
        "message": "Feedback report resolved and user notification dispatched.",
        "data": updated,
    }


@router.post("/reply/{report_id}")
async def reply_to_feedback_report(report_id: str, payload: FeedbackReplyPayload):
    """Admin resolution reply — marks report resolved and notifies the reporter."""
    try:
        updated = await submit_feedback_reply(report_id, payload.message, payload.admin_name)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Feedback reply failed: %s", exc)
        raise HTTPException(status_code=500, detail="Could not send feedback reply.") from exc

    return {
        "status": "success",
        "message": "Feedback reply sent and report marked as resolved.",
        "data": updated,
    }
