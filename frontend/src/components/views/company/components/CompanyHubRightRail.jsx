import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiEdit3,
  FiFacebook,
  FiGlobe,
  FiInstagram,
  FiLinkedin,
  FiMapPin,
  FiPlus,
  FiTwitter,
} from 'react-icons/fi';
import { resolvePortalImageurl } from '../utils/portalImage';
import { COMPANY_HUB_QUICK_ACTIONS, COMPANY_HUB_SETTINGS_LINKS } from '../companyPortalMenu';

function SocialLink({ href, Icon, label }) {
  if (!href) return null;
  const url = href.startsWith('http') ? href : `https://${href}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label}>
      <Icon size={14} />
    </a>
  );
}

export default function CompanyHubRightRail({ company }) {
  const c = company || {};
  const site = c.website || '';
  const href = site && !site.startsWith('http') ? `https://${site}` : site;
  const hasSocial = Boolean(c.linkedin || c.twitter || c.facebook || c.instagram);

  return (
    <aside className="cp-right-rail">
      <Link to="/company/dashboard/jobs/new" className="cp-right-rail__cta">
        <FiPlus size={18} aria-hidden />
        Post a Job
      </Link>

      <section className="cp-right-rail__card cp-glass cp-right-rail__card--about">
        <div className="cp-right-rail__profile">
          <img src={resolvePortalImageurl(c.imageurl, c.name)} alt="" />
          <div>
            <strong>{c.name || 'Company'}</strong>
            {c.isVerified ? <span className="cp-verified">Verified</span> : null}
            <p>{c.tagline || c.industry || 'Company profile'}</p>
          </div>
        </div>
        <div className="cp-right-rail__meta">
          {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              <FiGlobe size={12} aria-hidden />
              {c.website}
            </a>
          ) : null}
          {c.location ? (
            <span>
              <FiMapPin size={12} aria-hidden />
              {c.location}
            </span>
          ) : null}
        </div>
        {hasSocial ? (
          <div className="cp-right-rail__social">
            <SocialLink href={c.linkedin} Icon={FiLinkedin} label="LinkedIn" />
            <SocialLink href={c.twitter} Icon={FiTwitter} label="Twitter" />
            <SocialLink href={c.facebook} Icon={FiFacebook} label="Facebook" />
            <SocialLink href={c.instagram} Icon={FiInstagram} label="Instagram" />
          </div>
        ) : null}
        <Link to="/company/dashboard/settings" className="cp-right-rail__edit">
          <FiEdit3 size={14} aria-hidden />
          Edit Company Profile
        </Link>
      </section>

      <section className="cp-right-rail__card cp-glass">
        <h3>Quick Actions</h3>
        <div className="cp-quick-grid">
          {COMPANY_HUB_QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                to={action.to}
                className={`cp-quick-grid__item cp-quick-grid__item--${action.tone || 'violet'}${
                  action.id === 'post-job' ? ' cp-quick-grid__item--post-job' : ''
                }`}
              >
                <span className="cp-quick-grid__icon" aria-hidden>
                  <Icon size={22} />
                </span>
                <span>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="cp-right-rail__card cp-glass cp-settings-rail">
        <h3>Company Settings</h3>
        <ul className="cp-settings-list">
          {COMPANY_HUB_SETTINGS_LINKS.map((row) => {
            const Icon = row.icon;
            return (
              <li key={row.id}>
                <Link to={row.to} className={`cp-settings-list__link cp-settings-list__link--${row.tone || 'violet'}`}>
                  <span className="cp-settings-list__icon" aria-hidden>
                    {Icon ? <Icon size={16} /> : null}
                  </span>
                  <span className="cp-settings-list__copy">
                    <strong>{row.label}</strong>
                    <em>{row.hint}</em>
                  </span>
                  <span className="cp-settings-list__chev" aria-hidden>›</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}
