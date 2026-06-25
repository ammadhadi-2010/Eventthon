from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from .article_helpers import resolve_author, save_uploaded_image
from .article_service import save_article_document

router = APIRouter()


@router.post("/upload-media")
async def upload_article_media(
    identifier: str = Form(...),
    file: UploadFile = File(...),
):
    author = await resolve_author(identifier)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    imageurl = await save_uploaded_image(file)
    if not imageurl:
        raise HTTPException(status_code=400, detail="No image file provided")
    return {"status": "success", "imageurl": imageurl, "url": imageurl}


@router.post("/publish")
async def publish_article(
    title: str = Form(...),
    content: str = Form(...),
    identifier: str = Form(...),
    cover_image: Optional[UploadFile] = File(None),
    slug: Optional[str] = Form(None),
    excerpt: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    primary_keyword: Optional[str] = Form(None),
    meta_title: Optional[str] = Form(None),
    meta_description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    seo_score: Optional[int] = Form(None),
):
    try:
        article = await save_article_document(
            title=title,
            content=content,
            identifier=identifier,
            cover_image=cover_image,
            status_value="published",
            slug=slug,
            excerpt=excerpt,
            tags=tags,
            primary_keyword=primary_keyword,
            meta_title=meta_title,
            meta_description=meta_description,
            category=category,
            seo_score=seo_score,
        )
        return {"status": "success", "message": "Article published successfully", "data": article}
    except HTTPException:
        raise
    except Exception as exc:
        print(f"Publish error: {exc}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Publish failed")


@router.post("/save-draft")
async def save_draft(
    title: str = Form(...),
    content: str = Form(...),
    identifier: str = Form(...),
    cover_image: Optional[UploadFile] = File(None),
    slug: Optional[str] = Form(None),
    excerpt: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    primary_keyword: Optional[str] = Form(None),
    meta_title: Optional[str] = Form(None),
    meta_description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    seo_score: Optional[int] = Form(None),
):
    try:
        article = await save_article_document(
            title=title,
            content=content,
            identifier=identifier,
            cover_image=cover_image,
            status_value="draft",
            slug=slug,
            excerpt=excerpt,
            tags=tags,
            primary_keyword=primary_keyword,
            meta_title=meta_title,
            meta_description=meta_description,
            category=category,
            seo_score=seo_score,
        )
        return {"status": "success", "message": "Draft saved successfully", "data": article}
    except HTTPException:
        raise
    except Exception as exc:
        print(f"Draft error: {exc}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not save draft")
