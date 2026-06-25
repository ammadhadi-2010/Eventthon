from fastapi import APIRouter

from .routes_write import router as write_router
from .routes_read import router as read_router
from .routes_mutate import router as mutate_router
from .routes_metrics import router as metrics_router
from .routes_comments import router as comments_router

router = APIRouter(prefix="/articles", tags=["Dashboard Articles"])

# Specific paths before parameterized routes
router.include_router(write_router)
router.include_router(read_router)
router.include_router(mutate_router)
router.include_router(metrics_router)
router.include_router(comments_router)
