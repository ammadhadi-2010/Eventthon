import React from 'react';
import { FileText, Eye } from 'lucide-react';
import UserBioContent from './UserBioContent';

export default function UserDetailCenterPanel({ user, row }) {
  const skills = Array.isArray(user?.skills) ? user.skills.filter(Boolean) : [];
  const langs =
    Array.isArray(user?.languages) && user.languages.length > 0
      ? user.languages.filter(Boolean)
      : user?.language_preference
        ? [user.language_preference]
        : ['English'];
  const projects = Array.isArray(user?.projects) ? user.projects : [];
  const projCount = projects.length;
  const niche = user?.niche || user?.headline || '—';
  const avail = user?.availability === 'available' ? 'Available for Work' : '—';

  const docs = [
    { key: 'cnic', label: 'CNIC / ID', href: user?.id_front, side: 'Front' },
    { key: 'cnic2', label: 'CNIC / ID', href: user?.id_back, side: 'Back' },
  ].filter((d) => d.href);

  const idPending = row?.adminStatus === 'pending';

  return (
    <div className="ud-center">
      <section className="ud-card ud-section">
        <h3 className="ud-section-title">About</h3>
        <UserBioContent bio={user?.bio} />
        <div className="ud-tags-row">
          <span className="ud-tag">{niche}</span>
          {avail !== '—' ? <span className="ud-tag ud-tag--green">{avail}</span> : null}
          {langs.map((l) => (
            <span key={l} className="ud-tag">
              {l}
            </span>
          ))}
        </div>
        {skills.length > 0 ? (
          <div className="ud-skills">
            {skills.slice(0, 12).map((s) => (
              <span key={s} className="ud-skill-pill">
                {s}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <section className="ud-card ud-section">
        <h3 className="ud-section-title">Stats</h3>
        <div className="ud-stat-grid">
          {[
            ['Projects', String(projCount)],
            ['Completed orders', '48'],
            ['Total earnings', `$${Number(user?.wallet_balance || 0).toFixed(2)}`],
            ['Rating', '4.9'],
          ].map(([k, v]) => (
            <div key={k} className="ud-stat-cell">
              <p className="ud-stat-label">{k}</p>
              <p className="ud-stat-value">{v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ud-card ud-section">
        <h3 className="ud-section-title">Documents & verification</h3>
        {docs.length === 0 ? (
          <p className="ud-muted">No ID documents on file.</p>
        ) : (
          <ul className="ud-doc-list">
            {docs.map((d) => (
              <li key={d.key} className="ud-doc-row">
                <FileText size={18} className="ud-doc-icon" aria-hidden />
                <div className="ud-doc-meta">
                  <span className="ud-doc-name">
                    {d.label} ({d.side})
                  </span>
                  <span className={`ud-doc-badge ${idPending ? 'ud-doc-badge--pending' : 'ud-doc-badge--ok'}`}>
                    {idPending ? 'Pending' : 'Approved'}
                  </span>
                </div>
                <a href={d.href} target="_blank" rel="noopener noreferrer" className="ud-doc-view" title="View">
                  <Eye size={18} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="ud-card ud-section">
        <h3 className="ud-section-title">Activity</h3>
        <ul className="ud-timeline">
          <li className="ud-tl-item">
            <span className="ud-tl-dot ud-tl-dot--violet" />
            <div>
              <p className="ud-tl-title">Profile updated</p>
              <p className="ud-tl-time">Recently</p>
            </div>
          </li>
          <li className="ud-tl-item">
            <span className="ud-tl-dot ud-tl-dot--emerald" />
            <div>
              <p className="ud-tl-title">Registration</p>
              <p className="ud-tl-time">{row?.joined || '—'}</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
