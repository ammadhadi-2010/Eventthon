from fastapi import APIRouter

from .portal_routes import router as portal_router
from .company_settings import router as company_settings_router

router = APIRouter()
router.include_router(portal_router)
router.include_router(company_settings_router)

__all__ = ["router"]
