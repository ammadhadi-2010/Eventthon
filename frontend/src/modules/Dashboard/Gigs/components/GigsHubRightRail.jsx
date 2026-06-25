import React from 'react';
import GigsRightSidebar from './GigsRightSidebar';
import GigsRightMyGigsPanel from './rightSidebar/GigsRightMyGigsPanel';
import GigsRightOrdersPanel from './rightSidebar/GigsRightOrdersPanel';
import GigsRightTipsPanel from './rightSidebar/GigsRightTipsPanel';

const HOME_TAB = 'Browse Gigs';

export default function GigsHubRightRail({ activeSection, onGoToMyGigs, onOpenOrders }) {
  if (activeSection === HOME_TAB) {
    return <GigsRightSidebar onGoToMyGigs={onGoToMyGigs} onOpenOrders={onOpenOrders} />;
  }
  if (activeSection === 'My Gigs') {
    return <GigsRightMyGigsPanel onOpenOrders={onOpenOrders} />;
  }
  if (activeSection === 'Orders') {
    return <GigsRightOrdersPanel onOpenOrders={onOpenOrders} />;
  }
  if (activeSection === 'Saved Gigs') {
    return <GigsRightTipsPanel variant="saved" onOpenOrders={onOpenOrders} />;
  }
  if (activeSection === 'Reviews') {
    return <GigsRightTipsPanel variant="reviews" onOpenOrders={onOpenOrders} />;
  }
  return <GigsRightTipsPanel variant="general" onOpenOrders={onOpenOrders} />;
}
