import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  FiGift,
  FiHeart,
  FiBookOpen,
  FiUser,
  FiCreditCard,
  FiSettings,
  FiHome,
} from 'react-icons/fi';
import { FOOTER_NAV } from '../../../components/Footer/footerData';

/** Donation hub shortcuts */
const HUB_LINKS = [
  { to: '/', label: 'Home', Icon: FiHome, end: true },
  { to: '/donate', label: 'Donation', Icon: FiHeart, match: 'donate', end: true },
  { to: '/donate/learn-more', label: 'Learn More', Icon: FiBookOpen, match: 'learn-more' },
  { to: '/wallet', label: 'My Wallet', Icon: FiCreditCard },
  { to: '/profile', label: 'My Profile', Icon: FiUser },
  { to: '/dashboard/settings', label: 'Settings', Icon: FiSettings },
];

/** Every footer Resources + Company page link (same routes as home footer). */
function footerPageLinks() {
  const links = [];
  for (const col of FOOTER_NAV) {
    for (const link of col.links || []) {
      if (!link.to) continue;
      links.push({ to: link.to, label: link.label, group: col.title });
    }
  }
  return links;
}

export default function DonationHubSidebar({ active = 'donate', profitPercent = 12 }) {
  const footerLinks = footerPageLinks();

  return (
    <aside className="donation-sidebar" aria-label="Donation navigation">
      <nav className="donation-sidebar__nav" aria-label="Donation hub">
        {HUB_LINKS.map(({ to, label, Icon, match, end }) => (
          <NavLink
            key={to}
            to={to}
            end={Boolean(end)}
            className={({ isActive }) =>
              `donation-sidebar__link${isActive || active === match ? ' is-active' : ''}`
            }
          >
            {Icon ? <Icon size={16} aria-hidden /> : null}
            {label}
          </NavLink>
        ))}
      </nav>

      {FOOTER_NAV.map((col) => {
        const colLinks = footerLinks.filter((l) => l.group === col.title);
        if (!colLinks.length) return null;
        return (
          <nav
            key={col.id}
            className="donation-sidebar__nav donation-sidebar__nav--footer"
            aria-label={col.title}
          >
            <p className="donation-sidebar__nav-label">{col.title}</p>
            {colLinks.map(({ to, label }) => (
              <NavLink
                key={`${col.id}-${to}`}
                to={to}
                className={({ isActive }) =>
                  `donation-sidebar__link${isActive ? ' is-active' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        );
      })}

      <div className="donation-sidebar__impact">
        <FiGift size={22} aria-hidden className="donation-sidebar__impact-icon" />
        <p>
          <strong>{profitPercent}%</strong> of EventThon&apos;s net profits are committed to verified
          charitable &amp; community initiatives.
        </p>
        <Link to="/donate/learn-more" className="donation-sidebar__learn">
          Learn More
        </Link>
      </div>
    </aside>
  );
}
