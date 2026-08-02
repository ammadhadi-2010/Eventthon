"""Company team RBAC — roles and permission matrix."""
from __future__ import annotations

from typing import FrozenSet, Iterable

# Invite-only roles (Owner is never invited)
TEAM_ROLES = (
    "admin",
    "hr_manager",
    "recruiter",
    "hiring_manager",
    "project_manager",
    "finance",
    "content_manager",
    "viewer",
)

ALL_ROLES = ("owner",) + TEAM_ROLES

ROLE_LABELS = {
    "owner": "Owner",
    "admin": "Admin",
    "hr_manager": "HR Manager",
    "recruiter": "Recruiter",
    "hiring_manager": "Hiring Manager",
    "project_manager": "Project Manager",
    "finance": "Finance",
    "content_manager": "Content Manager",
    "viewer": "Viewer",
}

# Permission keys
P_VIEW_TEAM = "view_team"
P_INVITE = "invite_members"  # Owner only per product rule
P_MANAGE_ROLES = "manage_roles"
P_REMOVE_MEMBERS = "remove_members"
P_SUSPEND_MEMBERS = "suspend_members"
P_VIEW_AUDIT = "view_audit"
P_TRANSFER_OWNERSHIP = "transfer_ownership"
P_MANAGE_JOBS = "manage_jobs"
P_MANAGE_APPLICATIONS = "manage_applications"
P_MANAGE_FINANCE = "manage_finance"
P_MANAGE_CONTENT = "manage_content"
P_MANAGE_PROJECTS = "manage_projects"
P_VIEW_ANALYTICS = "view_analytics"
P_COMPANY_SETTINGS = "company_settings"

ROLE_PERMISSIONS: dict[str, FrozenSet[str]] = {
    "owner": frozenset(
        {
            P_VIEW_TEAM,
            P_INVITE,
            P_MANAGE_ROLES,
            P_REMOVE_MEMBERS,
            P_SUSPEND_MEMBERS,
            P_VIEW_AUDIT,
            P_TRANSFER_OWNERSHIP,
            P_MANAGE_JOBS,
            P_MANAGE_APPLICATIONS,
            P_MANAGE_FINANCE,
            P_MANAGE_CONTENT,
            P_MANAGE_PROJECTS,
            P_VIEW_ANALYTICS,
            P_COMPANY_SETTINGS,
        }
    ),
    "admin": frozenset(
        {
            P_VIEW_TEAM,
            P_MANAGE_ROLES,
            P_REMOVE_MEMBERS,
            P_SUSPEND_MEMBERS,
            P_VIEW_AUDIT,
            P_MANAGE_JOBS,
            P_MANAGE_APPLICATIONS,
            P_MANAGE_FINANCE,
            P_MANAGE_CONTENT,
            P_MANAGE_PROJECTS,
            P_VIEW_ANALYTICS,
            P_COMPANY_SETTINGS,
        }
    ),
    "hr_manager": frozenset(
        {P_VIEW_TEAM, P_MANAGE_JOBS, P_MANAGE_APPLICATIONS, P_VIEW_ANALYTICS}
    ),
    "recruiter": frozenset({P_VIEW_TEAM, P_MANAGE_JOBS, P_MANAGE_APPLICATIONS}),
    "hiring_manager": frozenset({P_VIEW_TEAM, P_MANAGE_APPLICATIONS, P_VIEW_ANALYTICS}),
    "project_manager": frozenset({P_VIEW_TEAM, P_MANAGE_PROJECTS, P_VIEW_ANALYTICS}),
    "finance": frozenset({P_VIEW_TEAM, P_MANAGE_FINANCE, P_VIEW_ANALYTICS}),
    "content_manager": frozenset({P_VIEW_TEAM, P_MANAGE_CONTENT}),
    "viewer": frozenset({P_VIEW_TEAM, P_VIEW_ANALYTICS}),
}


def normalize_role(raw: str) -> str:
    key = str(raw or "").strip().lower().replace(" ", "_").replace("-", "_")
    aliases = {
        "hr": "hr_manager",
        "hrmanager": "hr_manager",
        "hiringmanager": "hiring_manager",
        "projectmanager": "project_manager",
        "contentmanager": "content_manager",
        "content": "content_manager",
    }
    key = aliases.get(key, key)
    return key if key in ALL_ROLES else ""


def role_label(role: str) -> str:
    return ROLE_LABELS.get(normalize_role(role) or role, role or "Member")


def permissions_for(role: str) -> FrozenSet[str]:
    return ROLE_PERMISSIONS.get(normalize_role(role), frozenset())


def has_permission(role: str, permission: str) -> bool:
    return permission in permissions_for(role)


def can_invite_role(actor_role: str, target_role: str) -> bool:
    """Only Owner may invite; cannot invite Owner."""
    if normalize_role(actor_role) != "owner":
        return False
    tr = normalize_role(target_role)
    return tr in TEAM_ROLES


def roles_catalog() -> list[dict]:
    return [
        {
            "id": key,
            "label": ROLE_LABELS[key],
            "permissions": sorted(ROLE_PERMISSIONS.get(key, frozenset())),
            "invitable": key in TEAM_ROLES,
        }
        for key in ALL_ROLES
    ]


def assert_invitable_role(role: str) -> str:
    key = normalize_role(role)
    if key not in TEAM_ROLES:
        raise ValueError("Invalid invite role. Owner cannot be invited.")
    return key
