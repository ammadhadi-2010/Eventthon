import React from 'react';
import { FiBookmark, FiMessageSquare, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { REVIEWS_TIPS, SAVED_GIGS_TIPS } from '../../data/gigsHubRightPanels';
import GigsTipsHelpSection from './GigsTipsHelpSection';

function ContextTipsList({ items }) {
  return (
    <div className="gigs-card gigs-right-list-card">
      <div className="gigs-right-section-head">
        <h3>Quick Tips</h3>
      </div>
      <div className="gigs-right-tips-list">
        {items.map((item) => (
          <div key={item.id} className="gigs-right-tip-row">
            <FiStar size={13} aria-hidden />
            <div>
              <h4>{item.title}</h4>
              <p>{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GigsRightTipsPanel({ variant = 'general', onOpenOrders }) {
  const quickTips = variant === 'reviews' ? REVIEWS_TIPS : variant === 'saved' ? SAVED_GIGS_TIPS : [];

  return (
    <aside className="gigs-right-stack" aria-label="Gigs hub resources">
      {quickTips.length > 0 ? <ContextTipsList items={quickTips} /> : null}
      <GigsTipsHelpSection onOpenOrders={onOpenOrders} />
      <div className="gigs-card gigs-right-list-card">
        <div className="gigs-right-section-head">
          <h3>Shortcuts</h3>
        </div>
        <div className="gigs-right-tips-list">
          <Link to="/gigs/categories" className="gigs-right-tip-row is-link">
            <FiBookmark size={13} aria-hidden />
            <div>
              <h4>Browse categories</h4>
              <p>Discover services</p>
            </div>
          </Link>
          <Link to="/messages" className="gigs-right-tip-row is-link">
            <FiMessageSquare size={13} aria-hidden />
            <div>
              <h4>Open Messages</h4>
              <p>Chat with buyers</p>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}
