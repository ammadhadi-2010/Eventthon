from backend_routes.admin import admin
from backend_routes.admin.user_management import router as admin_user_management_router
from backend_routes.admin.dashboard_summary import router as admin_dashboard_summary_router
from backend_routes.admin.dashboard_views import router as admin_dashboard_views_router
from backend_routes.admin.admin_profile import router as admin_profile_router
from backend_routes.admin.rank_management import router as admin_rank_management_router
from backend_routes.ranks import router as rank_system_router
from backend_routes.admin.system_settings import router as admin_system_settings_router
from backend_routes.admin.gig_management import router as admin_gig_management_router
from backend_routes.admin.gig_admin_list import router as admin_gig_list_router
from backend_routes.admin.job_management import router as admin_job_management_router
from backend_routes.admin.job_admin_hub_lists import router as admin_job_hub_lists_router
from backend_routes.admin.company_management import router as admin_company_management_router
from backend_routes.admin.squad_management import router as admin_squad_management_router
from backend_routes.admin.project_management import router as admin_project_management_router
from backend_routes.admin.automation_management import router as admin_automation_router
from backend_routes.admin.lead_hunter import router as admin_lead_hunter_router
from backend_routes.admin.admin_chat import router as admin_chat_router
from backend_routes.admin.admin_notifications import router as admin_notifications_router
from backend_routes.admin.system_health import router as admin_system_health_router
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import os
import logging
import asyncio

# Existing imports
from backend_routes.auth import auth, google_auth
from backend_routes.finance import wallet
from backend_routes.dashboard import dashboard_main, posts_handler, article_handler, post_ai_routes, posts_squad_routes, updates_routes
from backend_routes.alerts import alerts
from backend_routes.alerts.employer_alerts import router as employer_alerts_router
from backend_routes.alerts.user_notifications import router as user_notifications_router
from backend_routes.profile.profile import router as profile_router
from backend_routes.profile.profile_overview import router as profile_overview_router
from backend_routes.squads.main_squad import api_router as squads_api_router
from backend_routes.squads.main_squad import router as squads_router
from backend_routes.squads.squad_users_routes import router as squad_users_router
from backend_routes.gigs.gigs import router as gigs_router
from backend_routes.gigs.category_browse import router as gigs_category_browse_router
from backend_routes.gigs.orders import router as gig_orders_router
from backend_routes.gigs.create_gig import router as gig_create_router
from backend_routes.gigs.actions import router as gig_actions_router
from backend_routes.gigs.proposals import router as gig_proposals_router
from backend_routes.gigs.reviews import router as gig_reviews_router
from backend_routes.gigs.hub_metrics import router as gig_hub_metrics_router
from backend_routes.gigs.earnings import router as gig_earnings_router
from backend_routes.messages import router as messages_router
from backend_routes.messages.routes_chat import router as chat_router
from backend_routes.projects import router as projects_hub_router
from backend_routes.jobs import router as jobs_hub_router
from backend_routes.company_portal import router as company_portal_router
from backend_routes.public import router as public_router
from backend_routes.footer_resources import router as footer_resources_router
from backend_routes.founders_story import router as founders_story_router
from backend_routes.public.public_showroom_seed import ensure_all_public_seeds
from database import user_collection
from telemetry_engine import ensure_telemetry_indexes, telemetry_router
from feedback_engine.routes import router as feedback_router
from feedback_engine.admin_routes import router as admin_feedback_router
from backend_routes.profile.profile_helpers import normalize_user_profile

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="EventThon - The Verified Network",
    description="Backend API for EventThon Wedding Services & Social Automation",
    version="1.2.0"
)

# --- 1. DYNAMIC FOLDER SETUP (Global Safety) ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) 
STATIC_DIR = os.path.join(BASE_DIR, "static")
UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads")

# ❌ Pehle ye list define karein (Jo missing thi):
SUB_FOLDERS = ["profiles", "banners", "identity", "posts", "projects"]



# --- 2. STATIC FILES MOUNTING ---
# Ensure karein ke 'static' folder physically exist karta ho
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# --- 3. CORS SETTINGS ---
_default_origins = [
    "http://localhost:3001",
    "http://localhost:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3000",
]
_env_origins = os.getenv("ALLOWED_ORIGINS", "").strip()
origins = [o.strip() for o in _env_origins.split(",") if o.strip()] if _env_origins else _default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 4. GLOBAL ERROR HANDLER ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Internal Server Error"},
    )

# --- 5. ENHANCED USER FETCHING (Sync with Global Schema) ---

_DB_LOOKUP_SEC = 6.0


async def _find_user_or_timeout(coro):
    try:
        return await asyncio.wait_for(coro, timeout=_DB_LOOKUP_SEC)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=503, detail="Database timeout — check MongoDB connection")


@app.get("/api/health", tags=["Health"])
async def api_health():
    try:
        await asyncio.wait_for(user_collection.database.client.admin.command("ping"), timeout=3.0)
        return {"status": "ok", "mongo": True}
    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content={"status": "degraded", "mongo": False, "detail": str(exc)},
        )


@app.get("/get-user-by-email/{email}", tags=["User Fetching"])
@app.get("/api/users/by-email/{email}", tags=["User Fetching"])
async def get_user_by_email(email: str):
    user = await _find_user_or_timeout(user_collection.find_one({"email": email.lower().strip()}))
    if user:
        return normalize_user_profile(user)
    raise HTTPException(status_code=404, detail="User not found")

@app.get("/get-user/{mobile}", tags=["User Fetching"])
@app.get("/api/users/by-mobile/{mobile}", tags=["User Fetching"])
async def get_user_by_mobile(mobile: str):
    user = await _find_user_or_timeout(user_collection.find_one({"mobile": mobile.strip()}))
    if user:
        return normalize_user_profile(user)
    raise HTTPException(status_code=404, detail="Mobile user not found")

# --- 6. ROUTES REGISTRATION ---
app.include_router(auth.router, prefix="/api/auth", tags=["Standard Auth"])
app.include_router(google_auth.router, prefix="/api/google", tags=["Google Auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(admin_user_management_router, prefix="/api/admin")
app.include_router(admin_dashboard_summary_router, prefix="/api/admin")
app.include_router(admin_dashboard_views_router, prefix="/api/admin")
app.include_router(admin_profile_router, prefix="/api/admin")
app.include_router(admin_rank_management_router, prefix="/api/admin")
app.include_router(rank_system_router, prefix="/api/ranks")
app.include_router(admin_system_settings_router, prefix="/api/admin")
app.include_router(admin_gig_management_router, prefix="/api/admin")
app.include_router(admin_gig_list_router, prefix="/api/admin")
app.include_router(admin_company_management_router, prefix="/api/admin")
app.include_router(admin_squad_management_router, prefix="/api/admin")
app.include_router(admin_project_management_router, prefix="/api/admin")
app.include_router(admin_automation_router, prefix="/api/admin")
app.include_router(admin_lead_hunter_router, prefix="/api/admin")
app.include_router(admin_job_hub_lists_router, prefix="/api/admin")
app.include_router(admin_job_management_router, prefix="/api/admin")
app.include_router(admin_chat_router, prefix="/api/admin")
app.include_router(admin_notifications_router, prefix="/api/admin")
app.include_router(admin_system_health_router, prefix="/api/admin")
app.include_router(wallet.router, prefix="/finance", tags=["Finance"])
app.include_router(squads_router, prefix="/squads")
app.include_router(squads_api_router, prefix="/api")
app.include_router(squad_users_router, prefix="/users", tags=["Squad Users"])
app.include_router(dashboard_main.router, prefix="/api/dashboard", tags=["Dashboard Main"]) 
app.include_router(posts_handler.router, prefix="/api/posts", tags=["Posts"])
app.include_router(posts_squad_routes.router, prefix="/api/posts", tags=["Posts"])
app.include_router(post_ai_routes.router, prefix="/api/posts", tags=["Post AI"])
app.include_router(updates_routes.router, prefix="/api/updates", tags=["Dashboard Updates"])
app.include_router(article_handler.router, prefix="/api/articles", tags=["Articles"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(employer_alerts_router, prefix="/api/alerts", tags=["Employer Alerts"])
app.include_router(user_notifications_router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(profile_router, prefix="/api/profile")
app.include_router(profile_overview_router, prefix="/api/profile")
app.include_router(gigs_router, prefix="/api")
app.include_router(gigs_category_browse_router, prefix="/api/gigs")
app.include_router(gig_orders_router, prefix="/api")
app.include_router(gig_actions_router, prefix="/api")
app.include_router(gig_proposals_router, prefix="/api")
app.include_router(gig_reviews_router, prefix="/api")
app.include_router(gig_hub_metrics_router, prefix="/api")
app.include_router(gig_earnings_router, prefix="/api")
app.include_router(gig_create_router, prefix="/api")
app.include_router(messages_router, prefix="/api")
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
app.include_router(projects_hub_router, prefix="/api")
app.include_router(jobs_hub_router, prefix="/api")
app.include_router(company_portal_router, prefix="/api")
app.include_router(public_router, prefix="/api")
app.include_router(footer_resources_router, prefix="/api")
app.include_router(founders_story_router, prefix="/api")
app.include_router(telemetry_router, prefix="/api/telemetry", tags=["Telemetry"])
app.include_router(feedback_router, prefix="/api")
app.include_router(admin_feedback_router, prefix="/api/admin")


@app.on_event("startup")
async def bootstrap_public_showrooms():
    try:
        await ensure_all_public_seeds(force=True)
        logger.info("Public showroom seed data synced.")
    except Exception as exc:
        logger.warning("Public showroom seed skipped: %s", exc)
    try:
        await ensure_telemetry_indexes()
    except Exception as exc:
        logger.warning("Telemetry index bootstrap skipped: %s", exc)
    try:
        from feedback_engine.store import ensure_feedback_indexes

        await ensure_feedback_indexes()
    except Exception as exc:
        logger.warning("Feedback index bootstrap skipped: %s", exc)


@app.get("/", tags=["Health Check"])
async def root():
    return {
        "status": "online",
        "project": "EventThon",
        "message": "Global API is Running Cleanly"
    }