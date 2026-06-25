import React from 'react';
import { FiCheck, FiMapPin, FiStar } from 'react-icons/fi';
import EventThonBadge from '../../../../../components/EventThonBadge';
import { getSocialPlatformMeta } from '../../../../../data/globalSocialLinksRegistry';

function hrefFromUrl(url) {
  const t = String(url || '').trim();
  if (!t) return '#';
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export default function EditProfileLivePreviewHero({
  focusStepId,
  coverUrl,
  avatar,
  badgeProps,
  idVerified,
  displayName,
  headline,
  previewSocialLinks,
  locationLabel,
  availDot,
  availabilityLabel,
  projectsStatCount,
}) {
  return (
    <div
      id="ep-preview-section-basic"
      data-ep-preview-step="basic"
      className={`ep-live-preview__sync-target${focusStepId === 'basic' ? ' ep-live-preview__sync-target--active' : ''}`}
    >
      <div className={`ep-live-preview__banner${coverUrl ? ' ep-live-preview__banner--has-cover' : ''}`}>
        <div
          className={`ep-live-preview__banner-bg${coverUrl ? ' ep-live-preview__banner-bg--cover' : ''}`}
          style={
            coverUrl
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.65) 100%), url(${coverUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        />
        <div className="ep-live-preview__hero-row">
          <div className="ep-live-preview__avatar-wrap">
            <img src={avatar} alt="" className="ep-live-preview__avatar" />
            <span className="ep-live-preview__online" title="Online" />
          </div>
          <div className="ep-live-preview__hero-rank-stack">
            <span
              className={`ep-live-preview__rank-badge${idVerified ? ' ep-live-preview__rank-badge--verified' : ''}`}
            >
              <EventThonBadge tier={badgeProps.tier} label={badgeProps.label} variant="preview" />
              {badgeProps.label}
            </span>
            {idVerified ? (
              <span className="ep-live-preview__rank-verified-label">
                <FiCheck className="ep-live-preview__rank-verified-check" aria-hidden strokeWidth={3} />
                Verified
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="ep-live-preview__identity">
        <div className="ep-live-preview__name-row">
          <div className="ep-live-preview__name-with-badge">
            <h3 className="ep-live-preview__name">{displayName}</h3>
            {idVerified ? (
              <span className="ep-live-preview__verified ep-live-preview__verified--blue" title="Verified">
                <FiCheck className="ep-live-preview__verified-check" strokeWidth={3} />
              </span>
            ) : null}
          </div>
        </div>
        <div className="ep-live-preview__headline-links">
          <p className="ep-live-preview__headline">{headline}</p>
          {previewSocialLinks.length > 0 ? (
            <div className="ep-live-preview__socials ep-live-preview__socials--under-headline" aria-label="Social links">
              {previewSocialLinks.map((row) => {
                const meta = getSocialPlatformMeta(row.platform);
                const Icon = meta.Icon;
                return (
                  <a
                    key={row.id}
                    href={hrefFromUrl(row.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ep-live-preview__social-chip ep-live-preview__social-chip--compact"
                  >
                    <Icon className="ep-live-preview__social-icon" aria-hidden />
                    <span>{meta.label}</span>
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
        <div className="ep-live-preview__meta">
          <span className="ep-live-preview__meta-item">
            <FiMapPin className="ep-live-preview__meta-icon" aria-hidden />
            {locationLabel}
          </span>
          <span className="ep-live-preview__meta-dot" />
          <span className={`ep-live-preview__status-dot ${availDot}`} />
          <span className="ep-live-preview__status-text">{availabilityLabel}</span>
        </div>
      </div>

      <div className="ep-live-preview__stats-strip ep-live-preview__stats ep-live-preview__stats--sidebar">
        {[
          ['Projects', projectsStatCount, false],
          ['Completed Orders', '48', false],
          ['Total Earnings', '$12.8K', false],
          ['Rating', '4.9', true],
        ].map(([k, v, star]) => (
          <div key={k} className="ep-live-preview__stat-cell">
            <p className="ep-live-preview__stat-label">{k}</p>
            <p className="ep-live-preview__stat-value">
              {star ? (
                <>
                  {v} <FiStar className="ep-live-preview__star" />
                </>
              ) : (
                v
              )}
            </p>
          </div>
        ))}
      </div>

      {idVerified ? (
        <div className="ep-live-preview__rank-panel">
          <div className="ep-live-preview__rank-panel-head">
            <EventThonBadge tier={badgeProps.tier} label={badgeProps.label} variant="criteria" />
            <div className="ep-live-preview__rank-panel-titles">
              <span className="ep-live-preview__rank-panel-name">{badgeProps.label}</span>
              <span className="ep-live-preview__rank-panel-active">Active</span>
            </div>
          </div>
          <div className="ep-live-preview__rank-panel-xp-row">
            <div className="ep-live-preview__rank-panel-xp-track" aria-hidden>
              <div className="ep-live-preview__rank-panel-xp-fill" style={{ width: '65%' }} />
            </div>
            <span className="ep-live-preview__rank-panel-xp-label">650 / 1000 Rank XP</span>
          </div>
          <p className="ep-live-preview__rank-panel-foot">Global rank · Top 42% in your niche</p>
        </div>
      ) : null}
    </div>
  );
}
