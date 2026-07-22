from bson import ObjectId
from datetime import datetime

from database import user_collection, comment_collection

GENERIC_AUTHOR_NAMES = {
    "",
    "user",
    "member",
    "eventthon member",
    "article author",
}


def author_imageurl_from_user(user: dict) -> str:
    return str(
        user.get("imageurl") or user.get("profile_image_url") or user.get("avatar") or ""
    ).strip()


def author_rank_from_user(user: dict) -> str:
    return str(user.get("rank") or "frontline").strip().lower()


def author_display_name_from_user(user: dict) -> str:
    first = str(user.get("first_name") or "").strip()
    last = str(user.get("last_name") or "").strip()
    full = f"{first} {last}".strip()
    if full and full.lower() not in GENERIC_AUTHOR_NAMES:
        return full

    for key in ("username", "name", "display_name"):
        value = str(user.get(key) or "").strip()
        if value and value.lower() not in GENERIC_AUTHOR_NAMES:
            return value

    email = str(user.get("email") or "").strip()
    if "@" in email:
        return email.split("@")[0]

    return "Member"


def _is_generic_author_name(name: str) -> bool:
    return str(name or "").strip().lower() in GENERIC_AUTHOR_NAMES


def _format_comment(comment: dict) -> dict:
    comment["_id"] = str(comment["_id"])
    if "created_at" in comment and isinstance(comment["created_at"], datetime):
        comment["created_at"] = comment["created_at"].isoformat()
    else:
        comment["created_at"] = None
    return comment


async def enrich_posts_list(posts: list, *, include_comments: bool = True) -> list:
    if not posts:
        return posts

    post_ids = [str(post["_id"]) for post in posts]
    author_ids = []
    for post in posts:
        uid = str(post.get("user_id") or "")
        if ObjectId.is_valid(uid):
            author_ids.append(ObjectId(uid))

    comments_by_post = {}
    if include_comments:
        comment_rows = await comment_collection.find(
            {"post_id": {"$in": post_ids}}
        ).sort("created_at", 1).to_list(length=2500)
        for row in comment_rows:
            pid = str(row.get("post_id") or "")
            bucket = comments_by_post.setdefault(pid, [])
            if len(bucket) < 50:
                bucket.append(_format_comment(row))

    authors_by_id = {}
    if author_ids:
        unique_ids = list({str(item): item for item in author_ids}.values())
        author_rows = await user_collection.find(
            {"_id": {"$in": unique_ids}},
            {"imageurl": 1, "profile_image_url": 1, "avatar": 1, "rank": 1},
        ).to_list(length=len(unique_ids))
        for author in author_rows:
            authors_by_id[str(author["_id"])] = author

    for index, post in enumerate(posts):
        post_id_str = str(post["_id"])
        post["_id"] = post_id_str

        if include_comments:
            comments = comments_by_post.get(post_id_str, [])
            post["comments"] = comments
            if "comments_count" not in post:
                post["comments_count"] = len(comments)
        else:
            post["comments"] = []
            post["comments_count"] = int(post.get("comments_count") or 0)

        if "reposts_count" not in post:
            post["reposts_count"] = 0
        if "send_count" not in post:
            post["send_count"] = 0

        if "created_at" in post and isinstance(post["created_at"], datetime):
            post["created_at"] = post["created_at"].isoformat()

        author = authors_by_id.get(str(post.get("user_id") or ""))
        if author:
            if not post.get("author_imageurl"):
                post["author_imageurl"] = author_imageurl_from_user(author)
            post["author_rank"] = author_rank_from_user(author)
        elif not post.get("author_rank"):
            post["author_rank"] = "frontline"

        posts[index] = post

    return posts


async def enrich_post_document(post: dict, *, include_comments: bool = True) -> dict:
    rows = await enrich_posts_list([post], include_comments=include_comments)
    return rows[0]


async def enrich_articles_list(articles: list) -> list:
    if not articles:
        return articles

    author_ids = []
    for article in articles:
        uid = str(article.get("author_id") or "")
        if ObjectId.is_valid(uid):
            author_ids.append(ObjectId(uid))

    authors_by_id = {}
    if author_ids:
        unique_ids = list({str(item): item for item in author_ids}.values())
        author_rows = await user_collection.find(
            {"_id": {"$in": unique_ids}},
            {
                "first_name": 1,
                "last_name": 1,
                "username": 1,
                "name": 1,
                "email": 1,
                "designation": 1,
                "imageurl": 1,
                "profile_image_url": 1,
                "avatar": 1,
                "rank": 1,
            },
        ).to_list(length=len(unique_ids))
        for author in author_rows:
            authors_by_id[str(author["_id"])] = author

    for index, article in enumerate(articles):
        author = authors_by_id.get(str(article.get("author_id") or ""))
        if author:
            if _is_generic_author_name(article.get("author_name")):
                article["author_name"] = author_display_name_from_user(author)
            if not article.get("author_imageurl"):
                article["author_imageurl"] = author_imageurl_from_user(author)
            article["author_rank"] = author_rank_from_user(author)
            if not str(article.get("author_title") or "").strip():
                article["author_title"] = str(author.get("designation") or "").strip()
        elif _is_generic_author_name(article.get("author_name")):
            email = str(article.get("author_email") or "").strip()
            if "@" in email:
                article["author_name"] = email.split("@")[0]
            else:
                article["author_name"] = "Member"
        if not article.get("author_rank"):
            article["author_rank"] = "frontline"
        articles[index] = article

    return articles
