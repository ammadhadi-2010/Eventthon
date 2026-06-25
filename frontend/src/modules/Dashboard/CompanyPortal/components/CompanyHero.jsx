import React from 'react';
import { FiGlobe, FiMapPin, FiBriefcase } from 'react-icons/fi';
import { resolvePortalImageurl } from '../utils/portalImage';
import CompanyHeroStatsStrip from './CompanyHeroStatsStrip';

function resolveCoverBanner(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  return resolvePortalImageurl(raw);
}

export default function CompanyHero({ company }) {
  if (!company) return null;
  const coverBanner = resolveCoverBanner(company.coverImageurl);
  const site = company.website || '';
  const href = site && !site.startsWith('http') ? `https://${site}` : site;

  return (
    <section className="cp-hero cp-glass">
      <div className="cp-hero__shell">
        <div className="cp-hero__cover">
          {coverBanner ? (
            <img src={coverBanner} alt="Company Cover" className="cp-hero__cover-img" />
          ) : (
            <div className="cp-hero__cover-fallback" aria-hidden="true" />
          )}
          <div className="cp-hero__cover-shade" aria-hidden="true" />
        </div>

        <div className="cp-hero__panel">
          <div className="cp-hero__top">
            <div className="cp-hero__logo-wrap">
              <img
                className="cp-hero__logo"
                src={resolvePortalImageurl(company.imageurl, company.name)}
                alt=""
              />
            </div>
            <div className="cp-hero__copy">
              <div className="cp-hero__title-row">
                <h1>{company.name}</h1>
                {company.isVerified ? <span className="cp-verified">Verified</span> : null}
              </div>
              <p className="cp-hero__desc">
                {company.tagline || company.description || 'Building teams on EventThon.'}
              </p>
              <div className="cp-hero__meta">
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    <FiGlobe size={13} aria-hidden />
                    {company.website}
                  </a>
                ) : null}
                {company.location ? (
                  <span>
                    <FiMapPin size={13} aria-hidden />
                    {company.location}
                  </span>
                ) : null}
                {company.industry ? (
                  <span>
                    <FiBriefcase size={13} aria-hidden />
                    {company.industry}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <CompanyHeroStatsStrip company={company} />
        </div>
      </div>
    </section>
  );
}
