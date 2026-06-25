from fastapi import APIRouter

from .hub_routes import router as hub_router
from .jobs_api_routes import router as marketplace_router

router = APIRouter()
router.include_router(hub_router)
router.include_router(marketplace_router)

__all__ = ["router"]
