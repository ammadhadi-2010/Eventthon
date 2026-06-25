import React from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';

export default function PublicProjectPortfolio({ data }) {
  return (
    <article className="public-portfolio" itemScope itemType="https://schema.org/CreativeWork">
      <header>
        <p className="public-gig-category">{data.category}</p>
        <h1 itemProp="name">{data.projectName}</h1>
        <p className="public-bio" itemProp="description">
          {data.summary}
        </p>
      </header>

      {data.techStackTags?.length > 0 && (
        <section aria-label="Tech stack">
          <h2>Tech Stack</h2>
          <ul className="public-skills">
            {data.techStackTags.map((tag) => (
              <li key={tag} className="public-skill-pill">
                {tag}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.livePreviewUrl ? (
        <section aria-label="Live preview">
          <h2>Live Preview</h2>
          <a
            href={data.livePreviewUrl}
            className="public-preview-link"
            target="_blank"
            rel="noopener noreferrer"
            itemProp="url"
          >
            <FiExternalLink size={14} aria-hidden />
            Open live preview
          </a>
        </section>
      ) : null}

      {data.teamMembers?.length > 0 && (
        <section aria-label="Team members">
          <h2>Team</h2>
          <div className="public-members-grid">
            {data.teamMembers.map((member) => (
              <div key={`${member.displayName}-${member.role}`} className="public-member-chip">
                <div className="public-member-initials">{member.initials || member.displayName?.charAt(0)}</div>
                <div>
                  <strong>{member.displayName}</strong>
                  <span>{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="public-marketplace__cta">
        <p>Collaboration and edits require an EventThon account.</p>
        <Link to="/auth/login" className="public-cta">
          Sign in to Collaborate
        </Link>
      </footer>
    </article>
  );
}
