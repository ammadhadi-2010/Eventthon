"""Company document serializers — API uses imageurl for profile logos."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict


def parse_imageurl(doc: dict) -> str:
    return str(doc.get("imageurl") or doc.get("logo_url") or "").strip()


def _format_joined(ts: Any) -> str:
    if not ts:
        return "—"
    if isinstance(ts, str):
        try:
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            return dt.strftime("%b %d, %Y")
        except (TypeError, ValueError):
            return ts[:10] if len(ts) >= 10 else str(ts)
    if isinstance(ts, datetime):
        return ts.strftime("%b %d, %Y")
    return "—"


def _is_verified(doc: dict) -> bool:
    if doc.get("is_verified") is True:
        return True
    return str(doc.get("status") or "").lower() == "verified"


def company_to_row(doc: dict, open_jobs: int = 0) -> Dict[str, Any]:
    cid = str(doc.get("_id") or "")
    status = str(doc.get("status") or "active").strip().lower()
    verified = _is_verified(doc)
    public_suffix = cid[-6:].upper() if len(cid) >= 6 else cid.upper()
    return {
        "id": cid,
        "publicId": f"ETC-{public_suffix}" if cid else "",
        "name": str(doc.get("name") or "Company").strip(),
        "tagline": str(doc.get("tagline") or "").strip(),
        "description": str(doc.get("description") or "").strip(),
        "imageurl": parse_imageurl(doc),
        "industry": str(doc.get("industry") or "").strip(),
        "website": str(doc.get("website") or "").strip(),
        "size": str(doc.get("size") or "").strip(),
        "location": str(doc.get("location") or "").strip(),
        "country": str(doc.get("country") or "").strip(),
        "contactEmail": str(doc.get("contact_email") or "").strip(),
        "registrationNumber": str(doc.get("registration_number") or "").strip(),
        "taxId": str(doc.get("tax_id") or "").strip(),
        "verificationProofImageurl": str(doc.get("verification_proof_imageurl") or "").strip(),
        "isClaimed": bool(doc.get("is_claimed")),
        "isAdminSeed": bool(doc.get("is_admin_seed")),
        "status": status,
        "isVerified": verified,
        "openJobs": int(open_jobs or 0),
        "completedHires": int(doc.get("completed_hires") or 0),
        "squadInteractions": int(doc.get("followers") or 0),
        "joined": _format_joined(doc.get("created_at")),
        "submittedOn": _format_joined(doc.get("verification_submitted_at") or doc.get("created_at")),
        "verificationMessage": str(doc.get("verification_message") or "").strip(),
        "createdAt": doc.get("created_at"),
        "updatedAt": doc.get("updated_at"),
    }


def company_db_from_body(body: dict) -> Dict[str, Any]:
    imageurl = str(body.get("imageurl") or body.get("logo_url") or "").strip()
    status = str(body.get("status") or "pending").strip().lower() or "pending"
    is_verified = body.get("is_verified")
    if is_verified is None:
        is_verified = status == "verified"
    return {
        "name": str(body.get("name") or "").strip(),
        "logo_url": imageurl,
        "imageurl": imageurl,
        "industry": str(body.get("industry") or "").strip(),
        "website": str(body.get("website") or "").strip(),
        "size": str(body.get("size") or "").strip(),
        "location": str(body.get("location") or "").strip(),
        "country": str(body.get("country") or "").strip(),
        "contact_email": str(body.get("contact_email") or "").strip(),
        "registration_number": str(body.get("registration_number") or "").strip(),
        "tax_id": str(body.get("tax_id") or "").strip(),
        "status": status,
        "is_verified": bool(is_verified),
    }
