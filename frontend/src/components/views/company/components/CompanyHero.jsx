import React from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiCalendar, FiGlobe, FiMapPin, FiPlus } from 'react-icons/fi';
import { resolvePortalImageurl } from '../utils/portalImage';

function resolveCoverBanner(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  return resolvePortalImageurl(raw);
}

export default function CompanyHero({ company }) {
  if (!company) return null;
  const coverBanner = resolveCoverBanner(company.coverImageurl);
  const logoUrl = resolvePortalImageurl(company.imageurl, company.name);
  // No uploaded cover → still show a real visual banner (logo wash + brand mesh).
  const fallbackBanner = !coverBanner ? logoUrl : '';

  return (
    <section className="cp-hero cp-glass">
      <div className="cp-hero__shell">
        <div className={`cp-hero__cover${coverBanner ? '' : ' cp-hero__cover--fallback'}`}>
          {coverBanner ? (
            <img src={coverBanner} alt="" className="cp-hero__cover-img" />
          ) : (
            <>
              <img src={fallbackBanner} alt="" className="cp-hero__cover-wash" aria-hidden />
              <div className="cp-hero__cover-mesh" aria-hidden />
            </>
          )}
          <div className="cp-hero__cover-shade" aria-hidden />
          <Link to="/company/dashboard/jobs/new" className="cp-hero__banner-cta">
            <FiPlus size={16} aria-hidden />
            Post a Job
          </Link>
        </div>

        <div className="cp-hero__panel">
          <div className="cp-hero__top">
            <div className="cp-hero__logo-wrap">
              <img className="cp-hero__logo" src={logoUrl} alt="" />
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
                {company.website ? (
                  <span>
                    <FiGlobe size={13} aria-hidden />
                    {company.website}
                  </span>
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
                {company.joinedYear && company.joinedYear !== '—' ? (
                  <span>
                    <FiCalendar size={13} aria-hidden />
                    Est. {company.joinedYear}
                  </span>
                ) : null}
                {company.employees && company.employees !== '—' ? (
                  <span>
                    <FiBriefcase size={13} aria-hidden />
                    {company.employees} employees
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
