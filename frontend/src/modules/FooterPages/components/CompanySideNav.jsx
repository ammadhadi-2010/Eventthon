import React from 'react';
import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/company/about', label: 'About Us' },
  { to: '/company/pricing', label: 'Pricing' },
  { to: '/company/careers', label: 'Careers' },
  { to: '/company/contact', label: 'Contact Us' },
  { to: '/company/privacy', label: 'Privacy Policy' },
  { to: '/company/terms', label: 'Terms of Service' },
];

export default function CompanySideNav() {
  return (
    <nav className="fp-card" aria-label="Company">
      <p className="fp-tag" style={{ marginBottom: 12 }}>Company</p>
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
