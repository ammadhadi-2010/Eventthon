"""EventThon proprietary user telemetry and behavior tracking engine."""
from telemetry_engine.insights import generate_growth_insights
from telemetry_engine.recommender import compute_user_interests
from telemetry_engine.tracker import router as telemetry_router
from telemetry_engine.store import ensure_telemetry_indexes

__all__ = [
    "telemetry_router",
    "ensure_telemetry_indexes",
    "compute_user_interests",
    "generate_growth_insights",
]
