import React from 'react';
import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/resources/documentation', label: 'Documentation' },
  { to: '/resources/guides', label: 'Guides' },
  { to: '/resources/tutorials', label: 'Tutorials' },
  { to: '/resources/blog', label: 'Blog' },
  { to: '/resources/case-studies', label: 'Case Studies' },
  { to: '/resources/help', label: 'Help Center' },
  { to: '/resources/community', label: 'Community' },
];

export default function ResourcesSideNav() {
  return (
    <nav className="fp-card" aria-label="Resources">
      <p className="fp-tag" style={{ marginBottom: 12 }}>Resources</p>
      <ul className="fp-nav-list">
        {LINKS.map((link) => (
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
