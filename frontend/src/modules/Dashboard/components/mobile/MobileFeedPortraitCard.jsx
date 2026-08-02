import React from 'react';

export default function MobileFeedPortraitCard({
  accentColor = '#06b6d4',
  avatarLabel = '?',
  avatarImage = '',
  bannerImage = '',
  name,
  subtext,
  actionLabel,
  onAction,
  disabled = false,
}) {
  const bannerStyle = bannerImage
    ? { backgroundImage: `linear-gradient(180deg, rgba(2,6,23,0.15), rgba(2,6,23,0.55)), url(${bannerImage})` }
    : {
        background: `linear-gradient(135deg, ${accentColor}, rgba(15, 23, 42, 0.95))`,
      };

  return (
    <article className="dash-portrait-card">
      <div className="dash-portrait-card__banner" style={bannerStyle} aria-hidden />
      <div
        className={`dash-portrait-card__avatar${avatarImage ? ' dash-portrait-card__avatar--image' : ''}`}
        style={avatarImage ? { backgroundImage: `url(${avatarImage})` } : { backgroundColor: accentColor }}
      >
        {avatarImage ? null : avatarLabel}
      </div>
      <h4 className="dash-portrait-card__name">{name}</h4>
      <p className="dash-portrait-card__subtext">{subtext}</p>
      <button
        type="button"
        className="dash-portrait-card__action"
        onClick={onAction}
        disabled={disabled}
      >
        {actionLabel}
      </button>
    </article>
  );
}
