import os
import re
import uuid
from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import HTTPException, UploadFile

from .related_content_helpers import normalize_related_content
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
        {"email": value},
        {"user_id": value},
        {"user_id": normalized},
        {"username": value},
        {"username": normalized},
    ]
    if ObjectId.is_valid(value):
        clauses.append({"_id": ObjectId(value)})
    return await user_collection.find_one({"$or": clauses})


def normalize_media_path(raw: str) -> str:
    path = (raw or "").strip()
    if not path:
        return ""
    if path.startswith("http://") or path.startswith("https://"):
        from urllib.parse import urlparse

        path = urlparse(path).path or ""
    if path.startswith("/uploads/"):
        return f"/static{path}"
    return path


def static_file_abspath(stored_path: str) -> str:
    path = normalize_media_path(stored_path)
    if not path.startswith("/static/"):
        return ""
    relative = path.replace("/static/", "", 1).lstrip("/")
    return os.path.join(STATIC_DIR, relative.replace("/", os.sep))


def resolve_existing_media_path(stored: str) -> str:
    """Return a /static/... path only when the file exists on disk."""
    path = normalize_media_path(stored)
    if not path:
        return ""

    abs_path = static_file_abspath(path)
    if not abs_path:
        return ""

    candidates = [abs_path]
    base, ext = os.path.splitext(abs_path)
    if ext:
        candidates.extend([base + ext.lower(), base + ext.upper()])

    seen = set()
    for candidate in candidates:
        norm = os.path.normcase(candidate)
        if norm in seen:
            continue
        seen.add(norm)
        if os.path.isfile(candidate):
            rel = os.path.relpath(candidate, STATIC_DIR).replace("\\", "/")
            return f"/static/{rel}"
    return ""


def rewrite_article_content_html(html: str) -> str:
    source = html or ""
    if not source:
        return ""

    def repl(match: re.Match) -> str:
        quote = match.group(1)
        src = (match.group(2) or "").strip()
        if not src or src.startswith("data:") or src.startswith("blob:"):
            return match.group(0)
        resolved = resolve_existing_media_path(src)
        if not resolved:
            return ""
        return f"src={quote}{resolved}{quote}"

    return re.sub(r'src=(["\'])([^"\']+)\1', repl, source, flags=re.IGNORECASE)


def serialize_article(article: dict) -> dict:
    article["_id"] = str(article["_id"])
    cover_image = resolve_existing_media_path(article.get("cover_image") or "")
    imageurl = resolve_existing_media_path(article.get("imageurl") or "") or cover_image
    article["cover_image"] = cover_image
    article["imageurl"] = imageurl
    article["content"] = rewrite_article_content_html(article.get("content") or "")
    metadata = article.get("metadata")
    if not isinstance(metadata, dict):
        metadata = {}
    article["metadata"] = {
        "views": int(metadata.get("views") or 0),
        "likes": int(metadata.get("likes") or 0),
        "shares": int(metadata.get("shares") or 0),
        "sends": int(metadata.get("sends") or 0),
        "comments": int(metadata.get("comments") or 0),
    }
    article["related_content"] = normalize_related_content(article.get("related_content"))
    if isinstance(article.get("created_at"), datetime):
        article["created_at"] = article["created_at"].isoformat()
    if isinstance(article.get("updated_at"), datetime):
        article["updated_at"] = article["updated_at"].isoformat()
    return article


async def save_uploaded_image(file: UploadFile, *, target_dir: str = UPLOAD_DIR, url_prefix: str = "/static/uploads/articles") -> str:
    if not file or not file.filename:
        return ""
    file_extension = (os.path.splitext(file.filename)[1] or ".jpg").lower()
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(target_dir, unique_filename)
    os.makedirs(target_dir, exist_ok=True)
    content_bytes = await file.read()
    if not content_bytes:
        raise HTTPException(status_code=400, detail="Empty image upload")
    with open(file_path, "wb") as buffer:
        buffer.write(content_bytes)
        buffer.flush()
        os.fsync(buffer.fileno())
    if not os.path.isfile(file_path) or os.path.getsize(file_path) == 0:
        raise HTTPException(status_code=500, detail="Image upload failed to save")
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
    author_oid = str(author.get("_id") or "").strip()
    stored_oid = str(article.get("author_id") or "").strip()
    if author_oid and stored_oid and author_oid == stored_oid:
        return True

    author_email = (author.get("email") or "").strip().lower()
    author_mobile = (author.get("mobile") or "").strip()
    stored_email = (article.get("author_email") or "").strip().lower()
    stored_mobile = (article.get("author_mobile") or "").strip()
    if author_email and stored_email and author_email == stored_email:
        return True
    if author_mobile and stored_mobile and author_mobile == stored_mobile:
        return True

    stored_name = (article.get("author_name") or "").strip().lower()
    if stored_name:
        first = f"{author.get('first_name', '')} {author.get('last_name', '')}".strip().lower()
        username = (author.get("username") or author.get("name") or "").strip().lower()
        email_prefix = author_email.split("@")[0] if "@" in author_email else ""
        for candidate in (first, username, email_prefix):
            if candidate and candidate == stored_name:
                return True

    return False


async def require_article_author(article: dict, identifier: str) -> dict:
    author = await resolve_author(identifier)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    if not _author_owns_article(article, author):
        raise HTTPException(status_code=403, detail="You can only modify your own article")
    return author
