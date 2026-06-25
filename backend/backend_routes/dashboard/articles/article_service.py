from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import HTTPException, UploadFile

from .article_config import article_collection
from .article_helpers import (
    build_slug,
    estimate_reading_time,
    resolve_author,
    save_uploaded_image,
    serialize_article,
    unlink_static_file,
)
from database import comment_collection
from backend_routes.dashboard.carousel_intel_pipeline import apply_carousel_intel


async def save_article_document(
    *,
    title: str,
    content: str,
    identifier: str,
    cover_image: Optional[UploadFile],
    status_value: str,
    slug: Optional[str],
    excerpt: Optional[str],
    tags: Optional[str],
    primary_keyword: Optional[str],
    meta_title: Optional[str],
    meta_description: Optional[str],
    category: Optional[str],
    seo_score: Optional[int],
):
    author = await resolve_author(identifier)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    cover_url = await save_uploaded_image(cover_image) if cover_image else ""
    tag_list = [tag.strip() for tag in (tags or "").split(",") if tag.strip()]
    clean_title = title.strip()
    clean_content = content.strip()
    article_slug = (slug or "").strip() or build_slug(clean_title)

    article_document = {
        "author_id": str(author["_id"]),
        "author_mobile": author.get("mobile", ""),
        "author_email": author.get("email", ""),
        "author_name": f"{author.get('first_name', 'User')} {author.get('last_name', '')}".strip(),
        "author_title": author.get("designation", "EventThon Member"),
        "title": clean_title,
        "slug": article_slug,
        "content": clean_content,
        "excerpt": (excerpt or clean_content[:180]).strip(),
        "cover_image": cover_url,
        "imageurl": cover_url,
        "tags": tag_list,
        "primary_keyword": (primary_keyword or "").strip(),
        "meta_title": (meta_title or clean_title[:60]).strip(),
        "meta_description": (meta_description or clean_content[:155]).strip(),
        "category": (category or "General").strip(),
        "status": status_value,
        "seo_score": seo_score or 0,
        "reading_time": estimate_reading_time(clean_content),
        "word_count": len(clean_content.split()),
        "metadata": {"views": 0, "likes": 0, "shares": 0, "sends": 0, "comments": 0},
        "comments_count": 0,
        "send_count": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    if status_value == "published":
        article_document = await apply_carousel_intel(article_document, "article")

    result = await article_collection.insert_one(article_document)
    article_document["_id"] = result.inserted_id
    return serialize_article(article_document)


async def update_article_document(
    article_id: str,
    *,
    title: str,
    content: str,
    identifier: str,
    cover_image: Optional[UploadFile],
    slug: Optional[str],
    excerpt: Optional[str],
    tags: Optional[str],
    primary_keyword: Optional[str],
    meta_title: Optional[str],
    meta_description: Optional[str],
    category: Optional[str],
    seo_score: Optional[int],
    status_value: Optional[str],
):
    if not ObjectId.is_valid(article_id):
        raise HTTPException(status_code=400, detail="Invalid article id")

    article = await article_collection.find_one({"_id": ObjectId(article_id)})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    from .article_helpers import require_article_author
    await require_article_author(article, identifier)

    cover_url = article.get("cover_image", "")
    if cover_image and cover_image.filename:
        cover_url = await save_uploaded_image(cover_image)

    clean_title = title.strip()
    clean_content = content.strip()
    tag_list = [tag.strip() for tag in (tags or "").split(",") if tag.strip()]
    article_slug = (slug or "").strip() or build_slug(clean_title)
    next_status = (status_value or article.get("status") or "draft").strip().lower()
    if next_status not in {"draft", "published"}:
        next_status = "draft"

    updates = {
        "title": clean_title,
        "slug": article_slug,
        "content": clean_content,
        "excerpt": (excerpt or clean_content[:180]).strip(),
        "cover_image": cover_url,
        "imageurl": cover_url,
        "tags": tag_list,
        "primary_keyword": (primary_keyword or "").strip(),
        "meta_title": (meta_title or clean_title[:60]).strip(),
        "meta_description": (meta_description or clean_content[:155]).strip(),
        "category": (category or "General").strip(),
        "status": next_status,
        "seo_score": seo_score or 0,
        "reading_time": estimate_reading_time(clean_content),
        "word_count": len(clean_content.split()),
        "updated_at": datetime.utcnow(),
    }
    if next_status == "published":
        preview = {**article, **updates}
        preview = await apply_carousel_intel(preview, "article")
        updates["is_carousel_update"] = preview.get("is_carousel_update", False)
        updates["update_type"] = preview.get("update_type", "article")

    await article_collection.update_one({"_id": ObjectId(article_id)}, {"$set": updates})
    updated = await article_collection.find_one({"_id": ObjectId(article_id)})
    return serialize_article(updated)


async def hard_delete_article(article_id: str, identifier: str) -> None:
    if not ObjectId.is_valid(article_id):
        raise HTTPException(status_code=400, detail="Invalid article id")

    article = await article_collection.find_one({"_id": ObjectId(article_id)})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    from .article_helpers import require_article_author
    await require_article_author(article, identifier)

    await comment_collection.delete_many(
        {"$or": [{"article_id": article_id}, {"post_id": article_id}]}
    )
    unlink_static_file(article.get("cover_image") or article.get("imageurl") or "")
    await article_collection.delete_one({"_id": ObjectId(article_id)})
