import React from 'react';
import { FiStar } from 'react-icons/fi';

export default function ProjectShowroomTeam({ members = [] }) {
  const online = members.filter((m) => m.online).length;

  return (
    <section className="ps-team" aria-label="Team and collaboration">
      <header className="ps-section-head">
        <h2>Team &amp; Collaboration</h2>
        <span>
          {members.length} Members · {online} Online
        </span>
      </header>
      <div className="ps-team-grid">
        {members.map((member) => (
          <article key={`${member.displayName}-${member.role}`} className="ps-team-card">
            <div className="ps-team-avatar">{member.initials || member.displayName?.charAt(0)}</div>
            <div>
              <strong>
                {member.displayName}
                {member.online ? <span className="ps-online-dot" aria-label="Online" /> : null}
              </strong>
              <p>{member.role}</p>
              <p className="ps-team-meta">
                <FiStar size={11} aria-hidden /> {Number(member.rating || 4.8).toFixed(1)} ·{' '}
                {member.projectCount || 0} projects
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
