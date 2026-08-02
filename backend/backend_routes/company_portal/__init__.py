from fastapi import APIRouter

from .portal_routes import router as portal_router
from .portal_jobs_routes import router as portal_jobs_router
from .portal_followers_routes import router as portal_followers_router
from .company_settings import router as company_settings_router
from .team_routes import router as team_router

router = APIRouter()
router.include_router(portal_router)
router.include_router(portal_jobs_router)
router.include_router(portal_followers_router)
router.include_router(company_settings_router)
router.include_router(team_router)

__all__ = ["router"]
