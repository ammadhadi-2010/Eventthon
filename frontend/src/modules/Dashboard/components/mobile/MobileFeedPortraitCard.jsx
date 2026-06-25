import React from 'react';

export default function MobileFeedPortraitCard({
  accentColor = '#06b6d4',
  avatarLabel = '?',
  avatarImage = '',
  name,
  subtext,
  actionLabel,
  onAction,
  disabled = false,
}) {
  return (
    <article className="dash-portrait-card">
      <div className="dash-portrait-card__accent" style={{ backgroundColor: accentColor }} aria-hidden />
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
