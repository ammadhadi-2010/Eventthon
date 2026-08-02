import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeadphones, FiMessageSquare, FiHeart, FiHelpCircle } from 'react-icons/fi';

/** Right-rail CTAs — footer / existing app pages (same on every footer page). */
export const CONTACT_SUPPORT_PATH = '/company/contact';

const CTA_LINKS = [
  { to: CONTACT_SUPPORT_PATH, label: 'Contact Support', Icon: FiHeadphones, tone: 'primary' },
  { to: '/messages', label: 'Open Messages', Icon: FiMessageSquare, tone: 'secondary' },
  { to: '/resources/help', label: 'Help Center', Icon: FiHelpCircle, tone: 'secondary' },
  { to: '/donate', label: 'Donate ❤️', Icon: FiHeart, tone: 'secondary' },
];

export default function FooterCtaAside() {
  return (
    <div className="fp-card fp-cta-aside">
      <h3 className="fp-cta-aside__title">Need assistance?</h3>
      <p className="fp-cta-aside__text">
        Our support team responds within one business day for all workspace accounts.
      </p>
      {CTA_LINKS.map(({ to, label, Icon, tone }) => (
        <Link key={to} to={to} className={`fp-cta-btn fp-cta-btn--${tone}`}>
          <Icon size={14} aria-hidden /> {label}
        </Link>
      ))}
    </div>
  );
}
