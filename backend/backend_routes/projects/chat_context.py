"""Messages inbox handoff payloads for project bids."""


def build_project_chat_context(
    *,
    owner_user_id: str,
    project_id: str,
    project_title: str,
    bidder_user_id: str,
    proposal_id: str = "",
    package_label: str = "",
    body: str = "",
) -> dict:
    msg = body.strip() or (
        f'Proposal on "{project_title}"'
        + (f" — {package_label} package" if package_label else "")
        + ". Continue in chat to align on scope and timeline."
    )
    return {
        "chat_type": "project",
        "chat_tag": "Project Proposal",
        "seller_user_id": owner_user_id.strip(),
        "from_user_id": bidder_user_id.strip(),
        "context_id": project_id.strip(),
        "context_title": project_title.strip() or "Project conversation",
        "proposal_id": proposal_id.strip(),
        "body": msg,
    }
