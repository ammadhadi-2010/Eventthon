"""Footer resource CMS schemas."""
from __future__ import annotations

import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator

FooterCategory = Literal[
    "Documentation",
    "Guides",
    "Tutorials",
    "Blog",
    "Case Studies",
    "Help Center",
    "Community",
    "About Us",
    "Pricing",
    "Careers",
    "Contact Us",
    "Privacy Policy",
    "Terms of Service",
]

FOOTER_CATEGORIES: tuple[str, ...] = (
    "Documentation",
    "Guides",
    "Tutorials",
    "Blog",
    "Case Studies",
    "Help Center",
    "Community",
    "About Us",
    "Pricing",
    "Careers",
    "Contact Us",
    "Privacy Policy",
    "Terms of Service",
)

FOOTER_RESOURCE_CATEGORIES = FOOTER_CATEGORIES[:7]
FOOTER_COMPANY_CATEGORIES = FOOTER_CATEGORIES[7:]
COMPANY_CATEGORIES = frozenset(FOOTER_COMPANY_CATEGORIES)
SIDEBAR_SORT_CATEGORIES = frozenset({"Documentation", "Guides"})


def slug_from_title(title: str) -> str:
    raw = str(title or "").strip().lower()
    slug = re.sub(r"[^a-z0-9]+", "-", raw).strip("-")
    return slug[:120] or "resource"


def footer_block_for(category: str) -> str:
    return "company" if category in COMPANY_CATEGORIES else "resources"


class FooterResourceBase(BaseModel):
    category: FooterCategory
    title: str = Field(..., min_length=2, max_length=160)
    content: str = Field("", max_length=12000)
    imageurl: str = Field("", max_length=500)
    videourl: str = Field("", max_length=500)
    excerpt: str = Field("", max_length=2000)
    sidebarOrder: int = Field(0, ge=0, le=9999)
    readTime: str = Field("", max_length=40)
    authorName: str = Field("", max_length=120)
    authorAvatarUrl: str = Field("", max_length=500)
    externalUrl: str = Field("", max_length=500)
    pricingLabel: str = Field("", max_length=120)
    pricingPrice: str = Field("", max_length=40)
    pricingFeatures: str = Field("", max_length=4000)
    contactEmail: str = Field("", max_length=200)
    contactPhone: str = Field("", max_length=40)
    jobTitle: str = Field("", max_length=160)
    jobLocation: str = Field("", max_length=120)
    policyVersion: str = Field("", max_length=40)
    slug: str = Field("", max_length=140)

    @field_validator("title")
    @classmethod
    def clean_title(cls, value: str) -> str:
        text = str(value or "").strip()
        if len(text) < 2:
            raise ValueError("Title must be at least 2 characters")
        return text


class FooterResourceCreate(FooterResourceBase):
    pass


class FooterResourceUpdate(BaseModel):
    category: FooterCategory | None = None
    title: str | None = Field(None, min_length=2, max_length=160)
    content: str | None = Field(None, max_length=12000)
    imageurl: str | None = Field(None, max_length=500)
    videourl: str | None = Field(None, max_length=500)
    excerpt: str | None = Field(None, max_length=2000)
    sidebarOrder: int | None = Field(None, ge=0, le=9999)
    readTime: str | None = Field(None, max_length=40)
    authorName: str | None = Field(None, max_length=120)
    authorAvatarUrl: str | None = Field(None, max_length=500)
    externalUrl: str | None = Field(None, max_length=500)
    pricingLabel: str | None = Field(None, max_length=120)
    pricingPrice: str | None = Field(None, max_length=40)
    pricingFeatures: str | None = Field(None, max_length=4000)
    contactEmail: str | None = Field(None, max_length=200)
    contactPhone: str | None = Field(None, max_length=40)
    jobTitle: str | None = Field(None, max_length=160)
    jobLocation: str | None = Field(None, max_length=120)
    policyVersion: str | None = Field(None, max_length=40)
    slug: str | None = Field(None, max_length=140)
