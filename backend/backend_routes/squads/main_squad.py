from fastapi import APIRouter

from .compat_api_router import router as api_compat_router
from .squad_core import router as core_router
from .squad_message_routes import router as message_router

router = APIRouter()
router.include_router(core_router)
router.include_router(message_router)

# Mount with prefix="/api" in main.py for GET/POST /api/squads/*
api_router = api_compat_router