"""
Optional FastAPI mount for /api/squads/* routes.

Register in main.py (one line):
  from backend_routes.squads.compat_api_router import router as squads_api_compat_router
  app.include_router(squads_api_compat_router, prefix="/api")
"""
from fastapi import APIRouter

from .squads_api_surface import router as squads_surface_router

router = APIRouter()
router.include_router(squads_surface_router)
