from typing import Optional

from pydantic import BaseModel


class InvitedMemberPayload(BaseModel):
    name: str
    role: Optional[str] = "Member"


class CreateSquadPayload(BaseModel):
    name: str
    leader_id: str | None = None
    leader_name: str | None = None
    description: str | None = None
    category: str | None = None
    privacy: str | None = "public"
    banner: str | None = None
    imageurl: str | None = None
    settings: dict | None = None
    invited_members: list[InvitedMemberPayload] | None = None
    is_draft: bool = False


class SendMessagePayload(BaseModel):
    text: str
    sender_name: Optional[str] = "Member"
    sender_id: Optional[str] = None


class UpdateMessagePayload(BaseModel):
    text: str
    sender_id: Optional[str] = None


class ReactMessagePayload(BaseModel):
    emoji: str
    sender_id: Optional[str] = None


class InvitePayload(BaseModel):
    name: str
    role: Optional[str] = "Member"
    invited_by: Optional[str] = None
    invitee_user_id: Optional[str] = None


class LeavePayload(BaseModel):
    user_id: Optional[str] = None
    name: Optional[str] = None


class UpdateMemberRolePayload(BaseModel):
    role: str


class CreateProjectPayload(BaseModel):
    title: str
    status: Optional[str] = "Active"
    owner: Optional[str] = "You"
    due_date: Optional[str] = None
    progress: Optional[int] = None
    tags: Optional[list[str]] = None
    description: Optional[str] = None
    tech_stack: Optional[list[str]] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    tasks_total: Optional[int] = None
    tasks_completed: Optional[int] = None
    showroom_views: Optional[int] = None
    public_slug: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    timeline: Optional[str] = None
    detailed_description: Optional[str] = None
    pricing_tiers: Optional[dict] = None
    milestones: Optional[list[str]] = None
    experience_level: Optional[str] = None
    work_mode: Optional[str] = None
    selected_template_id: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    cover_preview: Optional[str] = None
    objectives: Optional[str] = None
    deliverables: Optional[str] = None
    requirements: Optional[list[str]] = None
    roles_needed: Optional[list[str]] = None
    skills: Optional[list[str]] = None
    project_type: Optional[str] = None
    team_size: Optional[str] = None
    start_date: Optional[str] = None
    wizard_snapshot: Optional[dict] = None


class JoinProjectPayload(BaseModel):
    user_id: str
    name: str = ""
    avatar: str = ""
    role: str = "collaborator"


class SelectPackagePayload(BaseModel):
    user_id: str
    name: str = ""
    avatar: str = ""
    package_key: str
    package_label: str = ""
    price: int = 0
    delivery_days: int = 30
    revisions: int = 2


class UpdateProjectPayload(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    owner: Optional[str] = None
    due_date: Optional[str] = None
    progress: Optional[int] = None
    tags: Optional[list[str]] = None
    description: Optional[str] = None
    tech_stack: Optional[list[str]] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    tasks_total: Optional[int] = None
    tasks_completed: Optional[int] = None
    showroom_views: Optional[int] = None
    public_slug: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    timeline: Optional[str] = None
    detailed_description: Optional[str] = None
    pricing_tiers: Optional[dict] = None
    milestones: Optional[list[str]] = None
    experience_level: Optional[str] = None
    work_mode: Optional[str] = None
    selected_template_id: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    cover_preview: Optional[str] = None
    objectives: Optional[str] = None
    deliverables: Optional[str] = None
    requirements: Optional[list[str]] = None
    roles_needed: Optional[list[str]] = None
    skills: Optional[list[str]] = None
    project_type: Optional[str] = None
    team_size: Optional[str] = None
    start_date: Optional[str] = None
    wizard_snapshot: Optional[dict] = None


class UpdateSquadInfoPayload(BaseModel):
    squad_name: Optional[str] = None
    niche: Optional[str] = None
    description: Optional[str] = None


class UpdateSquadSettingsPayload(BaseModel):
    settings: dict


class InviteRespondPayload(BaseModel):
    action: str
    user_id: Optional[str] = None


DEFAULT_SQUAD_SETTINGS = {
    "publicListing": True,
    "inviteOthers": True,
    "adminProjectCreate": False,
    "memberApproval": True,
    "enableProjects": True,
    "enableChat": True,
    "showOnline": True,
    "notifyMentions": True,
    "notifyUploads": False,
    "integrationDrive": True,
    "integrationMail": False,
    "dangerArchive": True,
}
