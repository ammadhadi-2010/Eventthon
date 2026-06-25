"""Elite rank CMS schemas."""
from __future__ import annotations

import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator

RankCode = Literal["E-1", "E-2", "E-3", "E-4", "E-5", "E-6"]
RankStatus = Literal["active", "inactive"]


def rank_id_from_code(rank_code: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", str(rank_code or "").strip().lower()).strip("-") or "rank"


class RankBase(BaseModel):
    rankCode: RankCode
    rankName: str = Field(..., min_length=2, max_length=80)
    minPoints: int = Field(..., ge=0)
    minDealsRequired: int = Field(0, ge=0)
    minStarRating: float = Field(0.0, ge=0.0, le=5.0)
    iconUrl: str = Field("", max_length=500)
    featureOnFrontlineDashboard: bool = False
    benefits: str = Field("", max_length=500)
    status: RankStatus = "active"

    @field_validator("rankName")
    @classmethod
    def clean_name(cls, value: str) -> str:
        text = str(value or "").strip()
        if len(text) < 2:
            raise ValueError("Rank name must be at least 2 characters")
        return text


class RankCreateBody(RankBase):
    pass


class RankUpdateBody(RankBase):
    pass
