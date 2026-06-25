from fastapi import APIRouter

from .routes_action import router as action_router
from .routes_delivery import router as delivery_router
from .routes_inbox import router as inbox_router
from .routes_company_inbox import router as company_inbox_router
from .routes_preferences import router as preferences_router
from .routes_send import router as send_router
from .routes_sidebar import router as sidebar_router
from .routes_upload import router as upload_router

router = APIRouter(prefix="/messages", tags=["Messages"])
router.include_router(upload_router)
router.include_router(inbox_router)
router.include_router(company_inbox_router)
router.include_router(send_router)
router.include_router(delivery_router)
router.include_router(action_router)
router.include_router(preferences_router)
router.include_router(sidebar_router)
