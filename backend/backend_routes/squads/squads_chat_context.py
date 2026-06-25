"""Messages inbox handoff for squad invitations."""


def build_squad_invite_chat_context(
    *,
    squad_id: str,
    squad_name: str,
    leader_user_id: str,
    invitee_user_id: str,
    invitee_name: str,
    role: str = "Member",
) -> dict:
    title = squad_name.strip() or "Squad"
    return {
        "chat_type": "squad",
        "chat_tag": "Squad Invitation",
        "seller_user_id": leader_user_id.strip(),
        "from_user_id": invitee_user_id.strip(),
        "context_id": squad_id.strip(),
        "context_title": title,
        "body": (
            f'You have a pending invitation to join "{title}" as {role}. '
            "Reply here to coordinate with the squad lead."
        ),
    }
