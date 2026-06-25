import React from 'react';
import { ExternalLink } from 'lucide-react';
import { buildPortfolioLinks } from '../UserManagement/userProfileReviewUtils';

export default function UserDetailPortfolioLinks({ user }) {
  const links = buildPortfolioLinks(user);
  if (!links.length) return null;

  return (
    <section className="ud-card ud-section">
      <h3 className="ud-section-title">Portfolio &amp; social links</h3>
      <ul className="ud-link-list">
        {links.map((link) => (
          <li key={link.id}>
            <a href={link.href} target="_blank" rel="noopener noreferrer" className="ud-link-item">
              <ExternalLink size={14} aria-hidden />
              <span>{link.label}</span>
              <span className="ud-link-url">{link.href}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
