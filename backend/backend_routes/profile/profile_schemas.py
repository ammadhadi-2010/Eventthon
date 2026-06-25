"""User profile update schemas for the edit-profile wizard."""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class ExperienceItem(BaseModel):
    id: str
    role: str
    company: str
    period: str
    desc: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    logo_url: Optional[str] = None
    duration_label: Optional[str] = None
    current: Optional[bool] = None


class SocialLinkItem(BaseModel):
    id: str
    platform: str
    url: str


class EducationItem(BaseModel):
    id: str
    degree: str
    institution: str
    start_year: Optional[str] = None
    end_year: Optional[str] = None


class SkillTopItem(BaseModel):
    id: str
    name: str = ""
    proficiency: int = 80


class CareerInterests(BaseModel):
    remote_opportunities: Optional[bool] = None
    full_time_jobs: Optional[bool] = None
    freelance_projects: Optional[bool] = None
    internships: Optional[bool] = None


class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    niche: Optional[str] = None
    headline: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    mobile: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    imageurl: Optional[str] = None
    experiences: Optional[List[ExperienceItem]] = None
    projects: Optional[List[dict]] = None
    skills: Optional[List[str]] = None
    top_skills: Optional[List[SkillTopItem]] = None
    skill_subcategories: Optional[List[str]] = None
    career_interests: Optional[CareerInterests] = None
    languages: Optional[List[str]] = None
    availability: Optional[str] = None
    link_website: Optional[str] = None
    link_linkedin: Optional[str] = None
    link_github: Optional[str] = None
    social_links: Optional[List[SocialLinkItem]] = None
    educations: Optional[List[EducationItem]] = None
    pref_public_profile: Optional[bool] = None
    pref_notify_messages: Optional[bool] = None
    pref_notify_gigs: Optional[bool] = None


def profile_update_payload(data: ProfileUpdate) -> dict:
    if hasattr(data, "model_dump"):
        raw = data.model_dump(exclude_none=True)
    else:
        raw = data.dict(exclude_none=True)
    out = {k: v for k, v in raw.items() if v is not None}
    if "imageurl" in out:
        url = str(out.pop("imageurl") or "").strip()
        if url:
            out.update({"imageurl": url, "profile_image_url": url, "avatar": url})
    return out
