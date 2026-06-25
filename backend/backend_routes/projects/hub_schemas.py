from typing import Optional

from pydantic import BaseModel, Field


class CreateProjectPayload(BaseModel):
    owner_user_id: str = Field(..., min_length=2, max_length=120)
    title: str = Field(..., min_length=2, max_length=200)
    short_description: str = Field("", max_length=2000)
    detailed_description: str = Field("", max_length=12000)
    category: str = Field("", max_length=120)
    sub_category: str = Field("", max_length=120)
    tags: list[str] = Field(default_factory=list)
    status: str = Field("Planning", max_length=40)
    project_type: str = Field("", max_length=80)
    budget_min: str = Field("", max_length=40)
    budget_max: str = Field("", max_length=40)
    timeline: str = Field("", max_length=80)
    objectives: str = Field("", max_length=4000)
    deliverables: str = Field("", max_length=4000)
    requirements: list[str] = Field(default_factory=list)
    roles_needed: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    tech_stack: list[str] = Field(default_factory=list)
    experience_level: str = Field("", max_length=80)
    work_mode: str = Field("", max_length=80)
    team_size: str = Field("", max_length=80)
    milestones: list[str] = Field(default_factory=list)
    selected_template_id: str = Field("", max_length=120)
    cover_preview: str = Field("", max_length=2000)
    visibility: str = Field("private", max_length=20)
    pricing_tiers: Optional[dict] = None


class UpdateProjectPayload(BaseModel):
    owner_user_id: str = Field(..., min_length=2, max_length=120)
    title: Optional[str] = Field(None, max_length=200)
    status: Optional[str] = Field(None, max_length=40)
    progress: Optional[int] = Field(None, ge=0, le=100)
    category: Optional[str] = Field(None, max_length=120)


class ProjectActionPayload(BaseModel):
    owner_user_id: str = Field(..., min_length=2, max_length=120)
    action: str = Field(..., min_length=2, max_length=40)


class JoinProjectCollaboratorPayload(BaseModel):
    user_id: str = Field(..., min_length=2, max_length=120)
    name: str = Field("", max_length=120)
    avatar: str = Field("", max_length=2000)
    role: str = Field("collaborator", max_length=40)


class SelectHubPackagePayload(BaseModel):
    user_id: str = Field(..., min_length=2, max_length=120)
    name: str = Field("", max_length=120)
    avatar: str = Field("", max_length=2000)
    package_key: str = Field(..., max_length=20)
    package_label: str = Field("", max_length=80)
    price: int = Field(0, ge=0)
    delivery_days: int = Field(30, ge=1)
    revisions: int = Field(2, ge=0)


class SaveProjectPayload(BaseModel):
    user_id: str = Field(..., min_length=2, max_length=120)
    project_id: str = Field(..., min_length=2, max_length=120)
    title: str = Field(..., min_length=2, max_length=240)
    category: str = Field("", max_length=120)
    owner_name: str = Field("Owner", max_length=120)
    owner_initials: str = Field("OW", max_length=8)
    icon_tone: str = Field("web", max_length=40)
    icon_glyph: str = Field("", max_length=8)
