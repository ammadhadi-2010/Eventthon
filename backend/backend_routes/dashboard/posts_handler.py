from fastapi import APIRouter, UploadFile, File, Form, Query
from database import user_collection, post_collection, comment_collection, report_collection, notification_collection
from controllers.global_controller import GlobalController
from backend_routes.dashboard.post_feed_enrich import author_imageurl_from_user, enrich_posts_list
from backend_routes.dashboard.post_create_routing import route_post_on_create
from typing import List, Optional
import asyncio
import shutil
import os
import uuid
from datetime import datetime
from pydantic import BaseModel

class RepostRequest(BaseModel):
    user_id: str
    caption: Optional[str] = ""

class SendPostRequest(BaseModel):
    sender_id: str
    recipient_ids: List[str]
router = APIRouter(tags=["Dashboard Posts"])

# Windows path fixing logic (jo aapne profile mein use ki hy)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIC_DIR = os.path.join(BASE_DIR, "static")
POSTS_UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads", "posts")
COMMENTS_UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads", "comments")

os.makedirs(POSTS_UPLOAD_DIR, exist_ok=True)
os.makedirs(COMMENTS_UPLOAD_DIR, exist_ok=True)

IMAGE_SUFFIXES = (".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp")


def pick_cover_imageurl(file_urls: list) -> str:
    for path in file_urls:
        if str(path or "").lower().endswith(IMAGE_SUFFIXES):
            return path
    return ""


@router.post("/create")
async def create_post(
    content: str = Form(...),
    identifier: str = Form(...), 
    post_type: str = Form(...),  
    squad_id: Optional[str] = Form(None),
    attach_to_squad: Optional[str] = Form(None),
    progress_percent: Optional[int] = Form(None),
    achievement_metric: Optional[str] = Form(None),
    files: Optional[List[UploadFile]] = File(None)
):
    # 1. User ko dhoondna
    query = {
        "$or": [
            {"mobile": identifier.strip()},
            {"email": identifier.lower().strip()}
        ]
    }
    
    user = await user_collection.find_one(query)
    if not user:
        return {"status": "error", "message": "User not found"}

    # 2. Files Handle karna
    file_urls = []
    if files:
        for file in files:
            unique_filename = f"{uuid.uuid4()}_{file.filename}"
            file_path = os.path.join(POSTS_UPLOAD_DIR, unique_filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            file_urls.append(f"/static/uploads/posts/{unique_filename}")

    author_imageurl = author_imageurl_from_user(user)
    cover_imageurl = pick_cover_imageurl(file_urls)
    clean_squad_id = str(squad_id or "").strip()
    clean_metric = str(achievement_metric or "").strip()

    new_post = {
        "user_id": str(user["_id"]),
        "author_name": f"{user.get('first_name', 'User')} {user.get('last_name', '')}",
        "author_title": user.get('designation', 'EventThon Member'),
        "author_rank": str(user.get("rank") or "frontline").strip().lower(),
        "author_imageurl": author_imageurl,
        "imageurl": cover_imageurl,
        "post_type": post_type,
        "content": content,
        "media": file_urls,
        "likes_count": 0,
        "comments_count": 0,
        "reposts_count": 0,
        "send_count": 0,
        "created_at": datetime.utcnow(),
    }
    if progress_percent is not None:
        new_post["progress_percent"] = max(0, min(100, int(progress_percent)))
    if clean_metric:
        new_post["achievement_metric"] = clean_metric
    if clean_squad_id:
        new_post["squad_id"] = clean_squad_id
    if attach_to_squad is not None:
        new_post["attach_to_squad"] = attach_to_squad

    new_post = await route_post_on_create(
        new_post,
        user_id=str(user["_id"]),
        author_name=new_post["author_name"].strip(),
    )
    result = await post_collection.insert_one(new_post)
    new_post["_id"] = str(result.inserted_id)

    return {
        "status": "success",
        "message": f"{post_type} shared successfully",
        "data": new_post
    }

@router.get("/all")
async def get_all_posts():
    """Home timeline — returns every post; carousel flag does not filter this list."""
    try:
        posts = await asyncio.wait_for(
            post_collection.find().sort("created_at", -1).to_list(length=100),
            timeout=8.0,
        )
        if not posts:
            return {"status": "success", "data": []}

        await enrich_posts_list(posts, include_comments=False)
        return {"status": "success", "data": posts}
    except asyncio.TimeoutError:
        print("CRITICAL ERROR in get_all_posts: database timeout")
        return {"status": "error", "message": "Feed query timed out", "data": []}
    except Exception as e:
        print(f"CRITICAL ERROR in get_all_posts: {str(e)}")
        return {"status": "error", "message": "Could not fetch feed. Check backend logs.", "data": []}
    

@router.put("/like/{post_id}")
async def toggle_like(post_id: str):
    # Asli kaam ab GlobalController karega
    return await GlobalController.toggle_like(post_collection, post_id)

@router.delete("/delete/{post_id}")
async def delete_post(post_id: str):
    """Permanent hard delete: post document + all linked comments."""
    result = await GlobalController.smart_delete(post_collection, comment_collection, post_id)
    if result.get("status") != "success":
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=result.get("message") or "Post not found")
    return result
    
@router.post("/{post_id}/comment")
async def add_comment(
    post_id: str,
    text: str = Form(""),
    userId: str = Form(""),
    author_name: str = Form(""),
    author_title: str = Form("Member"),
    image: Optional[UploadFile] = File(None),
):
    image_url = None
    if image and image.filename:
        unique_filename = f"{uuid.uuid4()}_{image.filename}"
        file_path = os.path.join(COMMENTS_UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/static/uploads/comments/{unique_filename}"

    data = {
        "post_id": post_id,
        "text": text,
        "userId": userId,
        "author_name": author_name,
        "author_title": author_title,
        "image_url": image_url,
    }
    return await GlobalController.add_comment(comment_collection, post_collection, data)

@router.post("/comment/{comment_id}/reply")
async def add_reply(comment_id: str, data: dict):
    return await GlobalController.add_reply(comment_collection, comment_id, data)


@router.put("/comment/{comment_id}/like")
async def toggle_comment_like(comment_id: str, liked: bool = Form(...)):
    return await GlobalController.toggle_comment_like(comment_collection, comment_id, liked)

@router.post("/{post_id}/report")
async def report_post(post_id: str, data: dict):
    data["item_id"] = post_id
    # Yahan 'report_collection' pass karna hoga
    return await GlobalController.report_item(report_collection, data)

@router.post("/{post_id}/repost")
async def repost_post(post_id: str, payload: RepostRequest):
    return await GlobalController.repost_item(
        post_collection,
        user_collection,
        post_id,
        {"user_id": payload.user_id, "caption": payload.caption}
    )

@router.get("/send-targets")
async def get_send_targets(query: str = Query(default=""), limit: int = Query(default=50)):
    return await GlobalController.list_send_targets(user_collection, query, limit)

@router.post("/{post_id}/send")
async def send_post_to_users(post_id: str, payload: SendPostRequest):
    return await GlobalController.send_post(
        notification_collection,
        post_collection,
        user_collection,
        post_id,
        {"sender_id": payload.sender_id, "recipient_ids": payload.recipient_ids}
    )