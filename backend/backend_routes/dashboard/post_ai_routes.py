from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from controllers.post_ai_controller import enhance_social_post

router = APIRouter(tags=["Post AI"])


class EnhancePostRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=8000)
    post_type: str = "POST"


@router.post("/enhance")
async def enhance_post_copy(body: EnhancePostRequest):
    try:
        enhanced = await enhance_social_post(body.text, body.post_type)
        if not enhanced:
            raise HTTPException(status_code=400, detail="Nothing to enhance")
        return {"status": "success", "enhanced_text": enhanced}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Enhance failed: {exc}") from exc
