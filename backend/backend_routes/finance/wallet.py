"""Finance wallet router — aggregates modular wallet route modules."""

from fastapi import APIRouter

from backend_routes.finance.wallet_bank import router as bank_router
from backend_routes.finance.wallet_escrow import router as escrow_router
from backend_routes.finance.wallet_routes import router as core_router

router = APIRouter()
router.include_router(core_router)
router.include_router(bank_router)
router.include_router(escrow_router)

# Re-export helpers used by ledger_service and admin modules.
from backend_routes.finance.wallet_core import ensure_wallet, sanitize_wallet, utc_iso  # noqa: E402,F401
