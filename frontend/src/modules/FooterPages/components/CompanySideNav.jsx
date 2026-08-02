import React from 'react';
import { NavLink } from 'react-router-dom';
import { FOOTER_NAV } from '../../../components/Footer/footerData';

/** Same routes as footer Company column — works on every company page. */
function companyLinksFromFooter() {
  const col = FOOTER_NAV.find((c) => c.id === 'company');
  return (col?.links || []).filter((l) => l.to);
}

export default function CompanySideNav() {
  const links = companyLinksFromFooter();

  return (
    <nav className="fp-card" aria-label="Company">
      <p className="fp-tag" style={{ marginBottom: 12 }}>Company</p>
      <ul className="fp-nav-list">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to} className={({ isActive }) => (isActive ? 'is-active' : '')}>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
