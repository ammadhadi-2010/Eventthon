from bson import ObjectId
from datetime import datetime

from database import user_collection, comment_collection
from backend_routes.common.media_urls import apply_public_media_urls

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
    for key in ("full_name", "display_name"):
        value = str(user.get(key) or "").strip()
        if value and value.lower() not in GENERIC_AUTHOR_NAMES:
            return value

    first = str(user.get("first_name") or "").strip()
    last = str(user.get("last_name") or "").strip()
    full = f"{first} {last}".strip()
    if full and full.lower() not in GENERIC_AUTHOR_NAMES:
        return full

    for key in ("username", "user_name", "name"):
        value = str(user.get(key) or "").strip()
        if value and value.lower() not in GENERIC_AUTHOR_NAMES:
            return value

    email = str(user.get("email") or "").strip()
    if "@" in email:
        return email.split("@")[0]

    return "Member"


def _is_generic_author_name(name: str) -> bool:
    return str(name or "").strip().lower() in GENERIC_AUTHOR_NAMES


def _is_account_handle_name(name: str, author: dict, *, email: str = "") -> bool:
    """True when stored name is username/email prefix rather than a display name."""
    text = str(name or "").strip().lower()
    if not text or _is_generic_author_name(text):
        return False
    username = str(author.get("username") or author.get("user_name") or author.get("name") or "").strip().lower()
    if username and text == username:
        return True
    author_email = str(email or author.get("email") or "").strip().lower()
    if author_email and "@" in author_email and text == author_email.split("@")[0]:
        return True
    return False


def _format_comment(comment: dict) -> dict:
    comment["_id"] = str(comment["_id"])
    if "created_at" in comment and isinstance(comment["created_at"], datetime):
        comment["created_at"] = comment["created_at"].isoformat()
    else:
        comment["created_at"] = None
    return comment


_AUTHOR_LOOKUP_FIELDS = {
    "first_name": 1,
    "last_name": 1,
    "full_name": 1,
    "username": 1,
    "user_name": 1,
    "name": 1,
    "display_name": 1,
    "email": 1,
    "designation": 1,
    "imageurl": 1,
    "profile_image_url": 1,
    "avatar": 1,
    "rank": 1,
}


async def _load_authors_index(items: list, *, id_keys=("author_id", "user_id"), email_keys=("author_email", "email")):
    author_ids = []
    author_emails = []
    for item in items:
        for key in id_keys:
            uid = str(item.get(key) or "").strip()
            if ObjectId.is_valid(uid):
                author_ids.append(ObjectId(uid))
                break
        for key in email_keys:
            email = str(item.get(key) or "").strip().lower()
            if email and "@" in email:
                author_emails.append(email)
                break

    authors_by_id = {}
    authors_by_email = {}
    if not author_ids and not author_emails:
        return authors_by_id, authors_by_email

    query_clauses = []
    if author_ids:
        unique_ids = list({str(item): item for item in author_ids}.values())
        query_clauses.append({"_id": {"$in": unique_ids}})
    if author_emails:
        unique_emails = sorted(set(author_emails))
        query_clauses.append({"email": {"$in": unique_emails}})

    author_rows = await user_collection.find(
        {"$or": query_clauses},
        _AUTHOR_LOOKUP_FIELDS,
    ).to_list(length=max(len(author_ids), len(set(author_emails)), 1) * 2)

    for author in author_rows:
        authors_by_id[str(author["_id"])] = author
        email = str(author.get("email") or "").strip().lower()
        if email:
            authors_by_email[email] = author

    return authors_by_id, authors_by_email


def _resolve_author_record(item: dict, authors_by_id: dict, authors_by_email: dict, *, id_keys=("author_id", "user_id"), email_keys=("author_email", "email")):
    for key in id_keys:
        author = authors_by_id.get(str(item.get(key) or "").strip())
        if author:
            return author
    for key in email_keys:
        email = str(item.get(key) or "").strip().lower()
        if email and "@" in email:
            author = authors_by_email.get(email)
            if author:
                return author
    return None


def _apply_author_profile_fields(target: dict, author: dict, *, email_key="author_email") -> None:
    target["author_name"] = author_display_name_from_user(author)

    if not target.get("author_imageurl"):
        target["author_imageurl"] = author_imageurl_from_user(author)
    target["author_rank"] = author_rank_from_user(author)
    if not str(target.get("author_title") or "").strip():
        target["author_title"] = str(author.get("designation") or "").strip()
    author_oid = str(author["_id"])
    if not str(target.get("author_id") or "").strip():
        target["author_id"] = author_oid
    if not str(target.get("user_id") or "").strip():
        target["user_id"] = author_oid


async def enrich_posts_list(posts: list, *, include_comments: bool = True) -> list:
    if not posts:
        return posts

    post_ids = [str(post["_id"]) for post in posts]
    authors_by_id, authors_by_email = await _load_authors_index(posts, id_keys=("user_id", "author_id"), email_keys=("author_email", "email"))

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

        author = _resolve_author_record(
            post,
            authors_by_id,
            authors_by_email,
            id_keys=("user_id", "author_id"),
            email_keys=("author_email", "email"),
        )
        if author:
            _apply_author_profile_fields(post, author, email_key="author_email")
        elif not post.get("author_rank"):
            post["author_rank"] = "frontline"

        posts[index] = apply_public_media_urls(post)

    return posts


async def enrich_post_document(post: dict, *, include_comments: bool = True) -> dict:
    rows = await enrich_posts_list([post], include_comments=include_comments)
    return rows[0]


async def enrich_articles_list(articles: list) -> list:
    if not articles:
        return articles

    authors_by_id, authors_by_email = await _load_authors_index(
        articles,
        id_keys=("author_id", "user_id"),
        email_keys=("author_email", "email"),
    )

    for index, article in enumerate(articles):
        author = _resolve_author_record(
            article,
            authors_by_id,
            authors_by_email,
            id_keys=("author_id", "user_id"),
            email_keys=("author_email", "email"),
        )
        if author:
            _apply_author_profile_fields(article, author, email_key="author_email")
        elif _is_generic_author_name(article.get("author_name")):
            article["author_name"] = "Member"
        if not article.get("author_rank"):
            article["author_rank"] = "frontline"
        articles[index] = apply_public_media_urls(article)

    return articles
