import React from 'react';
import { NavLink } from 'react-router-dom';
import { FOOTER_NAV } from '../../../components/Footer/footerData';

/** Same routes as footer Resources column — works on every resources page. */
function resourcesLinksFromFooter() {
  const col = FOOTER_NAV.find((c) => c.id === 'resources');
  const links = (col?.links || []).filter((l) => l.to);
  // Ensure Donate is present even if footer data changes order
  if (!links.some((l) => l.to === '/donate')) {
    links.push({ label: 'Donate ❤️', to: '/donate' });
  }
  return links;
}

export default function ResourcesSideNav() {
  const links = resourcesLinksFromFooter();

  return (
    <nav className="fp-card" aria-label="Resources">
      <p className="fp-tag" style={{ marginBottom: 12 }}>Resources</p>
      <ul className="fp-nav-list">
        {links.map((link) => (
          <li key={`${link.to}-${link.label}`}>
            <NavLink to={link.to} className={({ isActive }) => (isActive ? 'is-active' : '')}>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
