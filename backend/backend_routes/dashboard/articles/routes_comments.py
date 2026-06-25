from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from database import comment_collection
from .article_config import article_collection
from .article_helpers import save_comment_image

router = APIRouter()


@router.get("/{article_id}/comments")
async def get_article_comments(article_id: str):
    try:
        comments = await comment_collection.find({"article_id": article_id}).sort("created_at", 1).to_list(length=200)
        for comment in comments:
            comment["_id"] = str(comment["_id"])
            if isinstance(comment.get("created_at"), datetime):
                comment["created_at"] = comment["created_at"].isoformat()
        return {"status": "success", "data": comments}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Comments fetch failed: {exc}")


@router.post("/{article_id}/comment")
async def add_article_comment(
    article_id: str,
    text: str = Form(""),
    userId: str = Form(""),
    author_name: str = Form(""),
    author_title: str = Form("EventThon Member"),
    image: Optional[UploadFile] = File(None),
):
    try:
        if not ObjectId.is_valid(article_id):
            raise HTTPException(status_code=400, detail="Invalid article id")

        clean_text = (text or "").strip()
        image_url = await save_comment_image(image) if image else None
        if not clean_text and not image_url:
            raise HTTPException(status_code=400, detail="Comment text or image is required")

        new_comment = {
            "article_id": article_id,
            "user_id": str(userId or ""),
            "author_name": (author_name or "EventThon Member").strip(),
            "author_title": author_title or "EventThon Member",
            "text": clean_text,
            "image_url": image_url,
            "likes_count": 0,
            "replies": [],
            "created_at": datetime.utcnow(),
        }
        result = await comment_collection.insert_one(new_comment)
        await article_collection.update_one(
            {"_id": ObjectId(article_id)},
            {"$inc": {"comments_count": 1, "metadata.comments": 1}, "$set": {"updated_at": datetime.utcnow()}},
        )
        new_comment["_id"] = str(result.inserted_id)
        new_comment["created_at"] = new_comment["created_at"].isoformat()
        return {"status": "success", "comment": new_comment}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Comment add failed: {exc}")


@router.put("/comment/{comment_id}/like")
async def like_article_comment(comment_id: str, liked: bool = Form(...)):
    try:
        if not ObjectId.is_valid(comment_id):
            raise HTTPException(status_code=400, detail="Invalid comment id")
        delta = 1 if liked else -1
        result = await comment_collection.update_one(
            {"_id": ObjectId(comment_id)},
            {"$inc": {"likes_count": delta}},
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Comment not found")
        updated = await comment_collection.find_one({"_id": ObjectId(comment_id)})
        updated["_id"] = str(updated["_id"])
        return {"status": "success", "data": updated}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Comment like failed: {exc}")


@router.post("/comment/{comment_id}/reply")
async def add_article_reply(comment_id: str, data: dict):
    try:
        if not ObjectId.is_valid(comment_id):
            raise HTTPException(status_code=400, detail="Invalid comment id")
        text = (data.get("text") or "").strip()
        if not text:
            raise HTTPException(status_code=400, detail="Reply text is required")

        reply = {
            "id": f"reply-{datetime.utcnow().timestamp()}",
            "user_id": str(data.get("userId") or ""),
            "author_name": (data.get("author_name") or "EventThon Member").strip(),
            "text": text,
            "created_at": datetime.utcnow().isoformat(),
        }
        result = await comment_collection.update_one(
            {"_id": ObjectId(comment_id)},
            {"$push": {"replies": reply}},
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Comment not found")
        return {"status": "success", "reply": reply}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Reply failed: {exc}")
