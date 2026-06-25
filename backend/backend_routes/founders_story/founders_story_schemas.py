"""Pydantic schemas for Founder's Story CMS and engagement."""
from __future__ import annotations

from pydantic import BaseModel, Field


class FoundersStoryContentBody(BaseModel):
    content: str = Field(..., min_length=1, max_length=50000)


class FoundersStoryCommentBody(BaseModel):
    author_name: str = Field(..., min_length=1, max_length=120)
    text: str = Field(..., min_length=1, max_length=2000)
    visitor_id: str = Field(..., min_length=8, max_length=80)


class FoundersStoryLikeBody(BaseModel):
    visitor_id: str = Field(..., min_length=8, max_length=80)
