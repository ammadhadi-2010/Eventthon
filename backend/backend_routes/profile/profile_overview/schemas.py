from typing import Optional

from pydantic import BaseModel


class SocialActionBody(BaseModel):
    action: str
    target_user_id: Optional[str] = None
