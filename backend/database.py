import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

MONGO_DETAILS = os.getenv("MONGO_DETAILS", "").strip()
DB_NAME = os.getenv("DB_NAME", "").strip()

if not MONGO_DETAILS:
    raise RuntimeError(
        "MONGO_DETAILS is missing. Add your MongoDB URI to backend/.env "
        '(see backend/.env.example). Example:\n'
        'MONGO_DETAILS=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority'
    )

if not DB_NAME:
    DB_NAME = "EventThon_Network"

# Shorter than PyMongo default (30s) so APIs fail fast if Atlas/local Mongo is unreachable
# (otherwise axios + browser both hit 30s and look like a "mystery" timeout).
_mongo_sel_ms = int(os.getenv("MONGO_SERVER_SELECTION_TIMEOUT_MS", "5000"))
_mongo_conn_ms = int(os.getenv("MONGO_CONNECT_TIMEOUT_MS", "5000"))

client = AsyncIOMotorClient(
    MONGO_DETAILS,
    serverSelectionTimeoutMS=_mongo_sel_ms,
    connectTimeoutMS=_mongo_conn_ms,
)
database = client[DB_NAME]

# Collections
user_collection = database.get_collection("users")
squad_collection = database.get_collection("squads")
notification_collection = database.get_collection("notifications")
transaction_collection = database.get_collection("transactions") # Transaction collection bhi add kar di
post_collection = database.get_collection("posts")
comment_collection = database.get_collection("comments")
report_collection = database.get_collection("reports")
wallet_collection = database.get_collection("wallets")
escrow_collection = database.get_collection("escrows")
gigs_collection = database.get_collection("gigs")
rank_collection = database.get_collection("ranks")
settings_collection = database.get_collection("settings")
gig_orders_collection = database.get_collection("gig_orders")
gig_contact_messages_collection = database.get_collection("gig_contact_messages")
gig_reports_collection = database.get_collection("gig_reports")
gig_reviews_collection = database.get_collection("gig_reviews")
gig_saved_collection = database.get_collection("gig_saved")
gig_proposals_collection = database.get_collection("gig_proposals")
job_contact_messages_collection = database.get_collection("job_contact_messages")
company_support_messages_collection = database.get_collection("company_support_messages")
admin_candidate_messages_collection = database.get_collection("admin_candidate_messages")
admin_alert_reads_collection = database.get_collection("admin_alert_reads")
project_contact_messages_collection = database.get_collection("project_contact_messages")
hub_projects_collection = database.get_collection("hub_projects")
hub_project_saved_collection = database.get_collection("hub_project_saved")
hub_project_reviews_collection = database.get_collection("hub_project_reviews")
jobs_collection = database.get_collection("jobs")
companies_collection = database.get_collection("companies")
job_alerts_collection = database.get_collection("job_alerts")
job_applications_collection = database.get_collection("job_applications")
job_saved_collection = database.get_collection("job_saved")
message_conversation_preferences_collection = database.get_collection("message_conversation_preferences")
user_telemetry_log_collection = database.get_collection("user_telemetry_logs")
feedbacks_collection = database.get_collection("feedbacks")
footer_resources_collection = database.get_collection("footer_resources")
automation_posts_collection = database.get_collection("automation_posts")
automation_settings_collection = database.get_collection("automation_settings")
lead_hunter_leads_collection = database.get_collection("lead_hunter_leads")
founders_story_collection = database.get_collection("founders_story")
founders_story_comments_collection = database.get_collection("founders_story_comments")
founders_story_likes_collection = database.get_collection("founders_story_likes")