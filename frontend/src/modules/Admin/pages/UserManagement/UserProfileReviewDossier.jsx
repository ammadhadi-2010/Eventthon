import React from 'react';
import { ExternalLink } from 'lucide-react';
import UserBioContent from '../UserDetail/UserBioContent';
import {
  buildPortfolioLinks,
  buildProfileSummaryRows,
  getDisplayName,
  getLanguages,
  getProfileAvatar,
  getSkills,
} from './userProfileReviewUtils';
import { getRankMeta, getStatusMeta } from './userManagementData';

export default function UserProfileReviewDossier({ user, row }) {
  const displayName = getDisplayName(user, row);
  const avatar = getProfileAvatar(user, row);
  const skills = getSkills(user);
  const languages = getLanguages(user);
  const links = buildPortfolioLinks(user);
  const summaryRows = buildProfileSummaryRows(user, row);
  const rank = getRankMeta(row?.rank || 'recruit');
  const status = getStatusMeta(row?.adminStatus || 'unverified');
  const headline = (user?.headline || user?.niche || '').trim();

  return (
    <section className="upr-dossier" aria-label="User dossier summary">
      <div className="upr-dossier__hero">
        <img src={avatar} alt="" className="upr-dossier__avatar" />
        <div>
          <h3 className="upr-dossier__name">{displayName}</h3>
          <p className="upr-dossier__handle">@{row?.handle || user?.user_id || 'user'}</p>
          {headline ? <p className="upr-dossier__headline">{headline}</p> : null}
          <span className={`um-status-chip ${status.chipClass}`}>{status.label}</span>
        </div>
      </div>

      <dl className="upr-dossier__meta">
        {summaryRows.map((item) => (
          <div key={item.id} className="upr-dossier__meta-row">
            <dt>{item.label}</dt>
            <dd className={item.mono ? 'upr-dossier__mono' : undefined}>{item.value}</dd>
          </div>
        ))}
        <div className="upr-dossier__meta-row">
          <dt>Rank tier</dt>
          <dd>{rank.label}</dd>
        </div>
      </dl>

      <div className="upr-dossier__bio">
        <h4 className="upr-dossier__skills-title">Bio</h4>
        <UserBioContent bio={user?.bio} className="upr-dossier__bio-text" emptyText="No bio provided." />
      </div>

      <div className="upr-dossier__skills">
        <h4 className="upr-dossier__skills-title">Skill tags</h4>
        {skills.length ? (
          <ul className="upr-dossier__skill-list">
            {skills.map((skill) => (
              <li key={skill} className="upr-dossier__skill-tag">
                {skill}
              </li>
            ))}
          </ul>
        ) : (
          <p className="upr-dossier__empty">No skills listed on this profile.</p>
        )}
      </div>

      {languages.length ? (
        <div className="upr-dossier__skills">
          <h4 className="upr-dossier__skills-title">Languages</h4>
          <ul className="upr-dossier__skill-list">
            {languages.map((lang) => (
              <li key={lang} className="upr-dossier__skill-tag upr-dossier__skill-tag--muted">
                {lang}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="upr-dossier__links">
        <h4 className="upr-dossier__skills-title">Portfolio &amp; social links</h4>
        {links.length ? (
          <ul className="upr-dossier__link-list">
            {links.map((link) => (
              <li key={link.id}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="upr-dossier__link">
                  <ExternalLink size={13} aria-hidden />
                  <span>{link.label}</span>
                  <span className="upr-dossier__link-url">{link.href}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="upr-dossier__empty">No portfolio links submitted.</p>
        )}
      </div>
    </section>
  );
}
