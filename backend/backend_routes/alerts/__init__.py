from fastapi import APIRouter

from .alerts import router as core_router
from .employer_alerts import router as employer_router

router = APIRouter()
router.include_router(core_router)
router.include_router(employer_router)

