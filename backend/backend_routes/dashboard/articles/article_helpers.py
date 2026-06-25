import os
import uuid
from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import HTTPException, UploadFile

from database import user_collection
from .article_config import STATIC_DIR, UPLOAD_DIR, COMMENTS_UPLOAD_DIR


def build_slug(title: str) -> str:
    clean = "".join(ch.lower() if ch.isalnum() else "-" for ch in title.strip())
    while "--" in clean:
        clean = clean.replace("--", "-")
    return clean.strip("-") or f"article-{uuid.uuid4().hex[:8]}"


def estimate_reading_time(content: str) -> int:
    words = len(content.split())
    return max(1, round(words / 200))


async def resolve_author(identifier: str):
    value = (identifier or "").strip()
    if not value:
        return None
    normalized = value.lower()
    clauses = [
        {"mobile": value},
        {"email": normalized},
        {"user_id": value},
        {"user_id": normalized},
    ]
    if ObjectId.is_valid(value):
        clauses.append({"_id": ObjectId(value)})
    return await user_collection.find_one({"$or": clauses})


def normalize_media_path(raw: str) -> str:
    path = (raw or "").strip()
    if not path:
        return ""
    if path.startswith("/uploads/"):
        return f"/static{path}"
    return path


def serialize_article(article: dict) -> dict:
    article["_id"] = str(article["_id"])
    cover_image = normalize_media_path(article.get("cover_image") or "")
    imageurl = normalize_media_path(article.get("imageurl") or cover_image)
    article["cover_image"] = cover_image
    article["imageurl"] = imageurl
    if isinstance(article.get("created_at"), datetime):
        article["created_at"] = article["created_at"].isoformat()
    if isinstance(article.get("updated_at"), datetime):
        article["updated_at"] = article["updated_at"].isoformat()
    return article


async def save_uploaded_image(file: UploadFile, *, target_dir: str = UPLOAD_DIR, url_prefix: str = "/static/uploads/articles") -> str:
    if not file or not file.filename:
        return ""
    file_extension = os.path.splitext(file.filename)[1] or ".jpg"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(target_dir, unique_filename)
    with open(file_path, "wb") as buffer:
        content_bytes = await file.read()
        buffer.write(content_bytes)
    return f"{url_prefix}/{unique_filename}"


async def save_comment_image(file: UploadFile) -> Optional[str]:
    if not file or not file.filename:
        return None
    return await save_uploaded_image(
        file,
        target_dir=COMMENTS_UPLOAD_DIR,
        url_prefix="/static/uploads/comments",
    )


def unlink_static_file(media_path: str) -> None:
    path = (media_path or "").strip()
    if not path:
        return
    relative = path.replace("/static/", "").lstrip("/")
    abs_path = os.path.join(STATIC_DIR, relative.replace("/", os.sep))
    if os.path.isfile(abs_path):
        try:
            os.remove(abs_path)
        except OSError:
            pass


def _author_owns_article(article: dict, author: dict) -> bool:
    if str(article.get("author_id") or "") == str(author.get("_id")):
        return True
    author_email = (author.get("email") or "").strip().lower()
    author_mobile = (author.get("mobile") or "").strip()
    stored_email = (article.get("author_email") or "").strip().lower()
    stored_mobile = (article.get("author_mobile") or "").strip()
    if author_email and stored_email and author_email == stored_email:
        return True
    if author_mobile and stored_mobile and author_mobile == stored_mobile:
        return True
    return False


async def require_article_author(article: dict, identifier: str) -> dict:
    author = await resolve_author(identifier)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    if not _author_owns_article(article, author):
        raise HTTPException(status_code=403, detail="You can only modify your own article")
    return author
