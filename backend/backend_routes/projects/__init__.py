from fastapi import APIRouter

from .hub_aggregate_routes import router as aggregate_router
from .hub_routes import router as hub_router
from .market_routes import router as market_router
from .proposal_routes import router as proposal_router
from .reviews_routes import router as reviews_router

router = APIRouter()
router.include_router(market_router)
router.include_router(proposal_router)
router.include_router(aggregate_router)
router.include_router(hub_router)
router.include_router(reviews_router)

__all__ = ["router"]
