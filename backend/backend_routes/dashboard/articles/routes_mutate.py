from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile

from .article_service import hard_delete_article, update_article_document

router = APIRouter()


@router.put("/{article_id}")
async def update_article(
    article_id: str,
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
    status_value: Optional[str] = Form(None),
):
    try:
        updated = await update_article_document(
            article_id,
            title=title,
            content=content,
            identifier=identifier,
            cover_image=cover_image,
            slug=slug,
            excerpt=excerpt,
            tags=tags,
            primary_keyword=primary_keyword,
            meta_title=meta_title,
            meta_description=meta_description,
            category=category,
            seo_score=seo_score,
            status_value=status_value,
        )
        return {"status": "success", "message": "Article updated successfully", "data": updated}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Article update failed: {exc}")


@router.delete("/{article_id}")
async def delete_article(article_id: str, identifier: str = Query(...)):
    try:
        await hard_delete_article(article_id, identifier)
        return {"status": "success", "message": "Article permanently deleted"}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Article delete failed: {exc}")
