# location: backend/controllers/global_controller.py
from bson import ObjectId
from datetime import datetime

from backend_routes.alerts.alert_factory import push_alert

class GlobalController:
    # 1. SMART DELETE (Post + uske saare comments khatam)
    @staticmethod
    async def smart_delete(collection, comment_collection, item_id):
        try:
            # Item delete karo (Post ya Squad)
            res = await collection.delete_one({"_id": ObjectId(item_id)})
            if res.deleted_count > 0:
                # Saath hi us se jurre saare comments bhi delete kar do
                await comment_collection.delete_many({"post_id": item_id})
                return {"status": "success", "message": "Deleted successfully"}
            return {"status": "error", "message": "Item not found"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    # 2. REPORT SYSTEM
    @staticmethod
    async def report_item(report_collection, data):
        try:
            report_data = {
                "item_id": data.get("item_id"),
                "reporter_id": data.get("userId"),
                "reason": data.get("reason", "Inappropriate content"),
                "created_at": datetime.utcnow()
            }
            await report_collection.insert_one(report_data)
            return {"status": "success", "message": "Reported to Admin"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    # 3. TOGGLE LIKE (Abhi simple increment rakh rahe hain)
    @staticmethod
    async def toggle_like(collection, item_id):
        try:
            result = await collection.update_one(
                {"_id": ObjectId(item_id)},
                {"$inc": {"likes_count": 1}}
            )
            return {"status": "success"} if result.modified_count else {"status": "error"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    # 4. ADD COMMENT
    @staticmethod
    async def add_comment(comment_collection, post_collection, data):
        try:
            new_comment = {
                "post_id": data.get("post_id"),
                "user_id": data.get("userId"),
                "author_name": data.get("author_name"),
                "author_title": data.get("author_title", "Member"),
                "text": data.get("text"),
                "image_url": data.get("image_url"),
                "likes_count": 0,
                "replies": [],
                "created_at": datetime.utcnow()
            }
            result = await comment_collection.insert_one(new_comment)
            await post_collection.update_one(
                {"_id": ObjectId(data.get("post_id"))},
                {"$inc": {"comments_count": 1}}
            )
            return {
                "status": "success",
                "comment": {
                    "_id": str(result.inserted_id),
                    "post_id": new_comment["post_id"],
                    "user_id": new_comment["user_id"],
                    "author_name": new_comment["author_name"],
                    "author_title": new_comment["author_title"],
                    "text": new_comment["text"],
                    "image_url": new_comment.get("image_url"),
                    "likes_count": new_comment["likes_count"],
                    "replies": [],
                    "created_at": new_comment["created_at"].isoformat()
                }
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @staticmethod
    async def add_reply(comment_collection, comment_id, data):
        try:
            reply = {
                "id": f"reply-{datetime.utcnow().timestamp()}",
                "user_id": data.get("userId"),
                "author_name": data.get("author_name", "You"),
                "text": data.get("text"),
                "created_at": datetime.utcnow().isoformat()
            }
            result = await comment_collection.update_one(
                {"_id": ObjectId(comment_id)},
                {"$push": {"replies": reply}}
            )
            if result.modified_count == 0:
                return {"status": "error", "message": "Comment not found"}
            return {"status": "success", "reply": reply}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @staticmethod
    async def toggle_comment_like(comment_collection, comment_id, liked):
        try:
            delta = 1 if liked else -1
            result = await comment_collection.update_one(
                {"_id": ObjectId(comment_id)},
                {"$inc": {"likes_count": delta}}
            )
            if result.modified_count == 0:
                return {"status": "error", "message": "Comment not found"}
            updated = await comment_collection.find_one({"_id": ObjectId(comment_id)})
            if not updated:
                return {"status": "error", "message": "Comment not found"}
            updated["_id"] = str(updated["_id"])
            return {"status": "success", "data": updated}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @staticmethod
    async def repost_item(post_collection, user_collection, post_id, data):
        try:
            original_post = await post_collection.find_one({"_id": ObjectId(post_id)})
            if not original_post:
                return {"status": "error", "message": "Original post not found"}

            user = await user_collection.find_one({"_id": ObjectId(data.get("user_id"))})
            if not user:
                return {"status": "error", "message": "User not found"}

            caption = (data.get("caption") or "").strip()
            repost_doc = {
                "user_id": data.get("user_id"),
                "author_name": f"{user.get('first_name', 'User')} {user.get('last_name', '')}",
                "author_title": user.get("designation", "EventThon Member"),
                "post_type": "REPOST",
                "content": caption,
                "media": original_post.get("media", []),
                "likes_count": 0,
                "comments_count": 0,
                "repost_of": str(original_post["_id"]),
                "original_author_name": original_post.get("author_name", "EventThon Member"),
                "original_content": original_post.get("content", ""),
                "created_at": datetime.utcnow()
            }
            result = await post_collection.insert_one(repost_doc)
            await post_collection.update_one(
                {"_id": ObjectId(post_id)},
                {"$inc": {"reposts_count": 1}}
            )
            return {"status": "success", "repost_id": str(result.inserted_id)}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @staticmethod
    async def list_send_targets(user_collection, query_text="", limit=50):
        try:
            filter_query = {}
            if query_text and query_text.strip():
                q = query_text.strip()
                filter_query = {
                    "$or": [
                        {"first_name": {"$regex": q, "$options": "i"}},
                        {"last_name": {"$regex": q, "$options": "i"}},
                        {"designation": {"$regex": q, "$options": "i"}},
                        {"email": {"$regex": q, "$options": "i"}}
                    ]
                }
            fetch_cap = min(max(limit * 4, limit), 200)
            users = await user_collection.find(filter_query).limit(fetch_cap).to_list(length=fetch_cap)
            from backend_routes.ranks.rank_recruiter_sort import sort_recruiter_results

            users = sort_recruiter_results(users, limit=limit)
            mapped = []
            for user in users:
                mapped.append({
                    "_id": str(user.get("_id")),
                    "name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or "EventThon User",
                    "title": user.get("designation", "EventThon Member"),
                    "avatar": user.get("profile_image_url")
                })
            return {"status": "success", "data": mapped}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @staticmethod
    async def send_post(notification_collection, post_collection, user_collection, post_id, data):
        try:
            sender_id = data.get("sender_id")
            recipient_ids = data.get("recipient_ids") or []
            if not sender_id or not recipient_ids:
                return {"status": "error", "message": "sender_id and recipient_ids required"}

            sender = await user_collection.find_one({"_id": ObjectId(sender_id)})
            post = await post_collection.find_one({"_id": ObjectId(post_id)})
            if not sender:
                return {"status": "error", "message": "Sender not found"}
            if not post:
                return {"status": "error", "message": "Post not found"}

            sender_name = f"{sender.get('first_name', '')} {sender.get('last_name', '')}".strip() or "Someone"
            sent = 0
            for recipient_id in recipient_ids:
                rid = str(recipient_id or "").strip()
                if not rid:
                    continue
                alert_id = await push_alert(
                    recipient_identifier=rid,
                    category="mentions",
                    title=f"{sender_name} shared a post with you",
                    message=f"{sender_name} sent you a post to review.",
                    actor_name=sender_name,
                    action_label="Open Post",
                    action_url="/dashboard",
                    priority="medium",
                    audience="member",
                )
                if alert_id:
                    sent += 1

            if sent:
                await post_collection.update_one(
                    {"_id": ObjectId(post_id)},
                    {"$inc": {"send_count": sent}},
                )
            return {"status": "success", "sent_count": sent}
        except Exception as e:
            return {"status": "error", "message": str(e)}