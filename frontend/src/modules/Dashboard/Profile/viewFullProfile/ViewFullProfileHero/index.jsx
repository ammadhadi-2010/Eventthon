import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Quote, Pencil, Share2, MapPin, Globe, BadgeCheck } from 'lucide-react';
import EventThonBadge from '../../../../../components/EventThonBadge';
import { rankCodeToBadgeProps } from '../../../../../components/badgeTierProps';
import { HERO_TAGLINE_QUOTE } from '../viewFullProfileConstants';
import { formatHeroHeadline } from '../viewFullProfileUtils';
import {
  eventthonProfileHref,
  pickWebsiteRow,
  rankCardMeta,
} from './viewFullProfileHeroUtils';
import ViewFullProfileHeroStats from './ViewFullProfileHeroStats';
import ViewFullProfileHeroContactModal from './ViewFullProfileHeroContactModal';

export default function ViewFullProfileHero({
  draft,
  userData,
  verified,
  rankMeta,
  projectCount,
  hideStatStrip = false,
  isProfileOwner = false,
}) {
  const [contactOpen, setContactOpen] = useState(false);
  const displayName = draft.fullName || 'Your profile';
  const initials =
    [draft.firstName, draft.lastName]
      .filter(Boolean)
      .map((s) => s.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';
  const skillTags = (draft.skillEntries || []).map((s) => s.name).filter(Boolean);
  const showTags = skillTags.slice(0, 5);
  const moreCount = Math.max(0, skillTags.length - showTags.length);
  const locationLine = [draft.city, draft.countryCode].filter(Boolean).join(', ') || 'Location not set';
  const websiteRow = pickWebsiteRow(draft.socialLinks);
  const websiteHost = websiteRow?.label || '';
  const eventthonHref = eventthonProfileHref();
  const rankKey = userData?.rank || 'frontline';
  const cardMeta = rankCardMeta(rankKey);
  const badgeProps = rankCodeToBadgeProps(rankMeta?.code || cardMeta.code, {
    label: rankMeta?.label || cardMeta.subtitle,
  });
  const cover = draft.coverImageUrl || '';
  const headlineDisplay = formatHeroHeadline(draft.headline);

  useEffect(() => {
    if (!contactOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setContactOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [contactOpen]);

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({ title: displayName, url });
      } catch {
        /* dismissed */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        window.alert('Could not copy link');
      }
    }
  };

  return (
    <div className="vfph-hero-stack">
      <section className="vfph-hero">
        <div className="vfph-hero__media" aria-hidden>
          {cover ? (
            <>
              <div className="vfph-hero__coverimg" style={{ backgroundImage: `url(${cover})` }} />
              <div className="vfph-hero__cover-scrim" aria-hidden />
              <div className="vfph-hero__fade-bottom" />
            </>
          ) : (
            <>
              <div className="vfph-hero__bg vfph-hero__bg--fallback" />
              <div className="vfph-hero__mountains" />
              <div className="vfph-hero__scrim" />
            </>
          )}
        </div>

        <div className="vfph-hero__top">
          <p className="vfph-hero__quote">
            <Quote size={16} strokeWidth={2} className="vfph-hero__quote-icon" aria-hidden />
            <span className="vfph-hero__quote-text">{HERO_TAGLINE_QUOTE}</span>
          </p>
          <div className="vfph-hero__actions">
            {isProfileOwner ? (
              <Link to="/profile/edit" className="vfph-pill-btn">
                <Pencil size={12} strokeWidth={2} aria-hidden />
                Edit profile
              </Link>
            ) : null}
            <button type="button" className="vfph-pill-btn" onClick={share}>
              <Share2 size={12} strokeWidth={2} aria-hidden />
              Share profile
            </button>
          </div>
        </div>

        <div className="vfph-hero__body">
          <div className="vfph-avatar-block">
            <div className="vfph-avatar-ring">
              <div className="vfph-avatar-ring__inner">
                {draft.profileImageUrl ? (
                  <img className="vfph-avatar-img" src={draft.profileImageUrl} alt="" />
                ) : (
                  <div className="vfph-avatar-fallback" aria-hidden>
                    {initials}
                  </div>
                )}
                <span className="vfph-avatar-online" title="Online" />
                {verified ? (
                  <span className="vfph-avatar-verified-ring" title="Verified">
                    <BadgeCheck size={14} strokeWidth={2.5} />
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="vfph-info">
            <div className="vfph-name-row">
              <h1 className="vfph-name">
                {displayName}
                {verified ? (
                  <BadgeCheck className="vfph-inline-verified" size={22} strokeWidth={2.5} aria-label="Verified" />
                ) : null}
              </h1>
            </div>
            <span className="vfph-rank-chip">{rankMeta.label}</span>
            <p className="vfph-title">{headlineDisplay}</p>
            <div className="vfph-meta-line">
              <span className="vfph-meta-item">
                <MapPin size={15} strokeWidth={2} aria-hidden />
                {locationLine}
              </span>
              {websiteHost ? (
                <span className="vfph-meta-item">
                  <Globe size={15} strokeWidth={2} aria-hidden />
                  {websiteHost}
                </span>
              ) : null}
              <button
                type="button"
                className="vfph-contact-link vfph-contact-btn"
                onClick={() => setContactOpen(true)}
              >
                Contact info
              </button>
            </div>
            <div className="vfph-skill-row">
              {showTags.length ? (
                showTags.map((t, i) => (
                  <span key={`${t}-${i}`} className={`vfph-skill-pill vfph-skill-pill--c${i}`}>
                    {t}
                  </span>
                ))
              ) : (
                <span className="vfph-skill-pill vfph-skill-pill--c0">Add skills in Edit profile</span>
              )}
              {moreCount > 0 ? <span className="vfph-skill-more">+{moreCount} more</span> : null}
            </div>
          </div>

          <div className="vfph-rank-card">
            <p className="vfph-rank-card__eyebrow">Current rank</p>
            <div className="vfph-rank-card__head">
              <div className="vfph-rank-card__titleblock">
                <span className="vfph-rank-card__code">{cardMeta.code}</span>
                <span className="vfph-rank-card__role">{cardMeta.subtitle}</span>
              </div>
              <div className="vfph-rank-card__icon">
                <EventThonBadge
                  tier={badgeProps.tier}
                  label={badgeProps.label}
                  variant="hero"
                  className="mx-auto"
                />
              </div>
            </div>
            <div className="vfph-rank-card__progress-label">Next rank progress</div>
            <div className="vfph-rank-card__bar">
              <span style={{ width: `${cardMeta.pct}%` }} />
            </div>
            <div className="vfph-rank-card__pct">{cardMeta.pct}%</div>
          </div>
        </div>
      </section>

      {!hideStatStrip ? <ViewFullProfileHeroStats projectCount={projectCount} /> : null}

      <ViewFullProfileHeroContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        websiteRow={websiteRow}
        eventthonHref={eventthonHref}
        isProfileOwner={isProfileOwner}
      />
    </div>
  );
}
