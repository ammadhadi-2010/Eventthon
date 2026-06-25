"""Seller notifications for gig commerce events."""
from __future__ import annotations

from backend_routes.alerts.alert_factory import push_alert


async def notify_seller_new_order(
    seller_user_id: str,
    *,
    buyer_label: str,
    gig_title: str,
    order_id: str,
) -> None:
    seller = str(seller_user_id or "").strip()
    if not seller:
        return
    title = str(gig_title or "your gig").strip() or "your gig"
    buyer = str(buyer_label or "A buyer").strip() or "A buyer"
    await push_alert(
        recipient_identifier=seller,
        category="jobs",
        audience="member",
        title="New gig order received",
        message=f'{buyer} placed an order for "{title}".',
        actor_name=buyer,
        action_label="View orders",
        action_url="/gigs?section=orders",
        priority="medium",
    )
