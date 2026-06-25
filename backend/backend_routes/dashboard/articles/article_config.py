import os
from database import database

_BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
STATIC_DIR = os.path.join(_BACKEND_ROOT, "static")
UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads", "articles")
COMMENTS_UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads", "comments")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(COMMENTS_UPLOAD_DIR, exist_ok=True)

article_collection = database.get_collection("articles")
