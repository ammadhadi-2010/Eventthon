import React from 'react';
import Button from './Button';
import TechStackIcons from './feed/TechStackIcons';

export const DEFAULT_PROJECT_HERO_FALLBACK_BG =
  'linear-gradient(125deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 1) 38%, rgba(49, 46, 129, 0.55) 72%, rgba(76, 29, 149, 0.35) 100%), radial-gradient(ellipse 80% 60% at 50% 120%, rgba(99, 102, 241, 0.25), transparent)';

const DEFAULT_LIKED_BG =
  'linear-gradient(125deg, rgba(76, 29, 149, 0.75) 0%, rgba(30, 27, 75, 0.98) 45%, rgba(15, 23, 42, 0.95) 100%), radial-gradient(circle at 30% 20%, rgba(167, 139, 250, 0.2), transparent 55%)';

/**
 * Project hero / liked panel. Default aspect **16 / 9** (override with `aspectRatio`, e.g. `4 / 3`).
 * Without `imageUrl`, shows gradient + title + tech icons (never an empty slab).
 */
export default function ProjectMediaBlock({
  variant = 'hero',
  className = '',
  imageUrl = '',
  fallbackBackground = DEFAULT_PROJECT_HERO_FALLBACK_BG,
  likedBackground = DEFAULT_LIKED_BG,
  /** Shown in placeholder and liked panel */
  title = '',
  techStack = [],
  /** Liked badge / short label */
  label = '',
  ctaLabel = 'View Project',
  onCtaClick,
  aspectRatio = '16 / 9',
}) {
  const stack = Array.isArray(techStack) ? techStack : [];
  const displayTitle = (title || label || 'Project').trim() || 'Project';

  if (variant === 'liked') {
    return (
      <div
        className={['esh-project-liked', className].filter(Boolean).join(' ')}
        style={{ aspectRatio }}
        role="img"
        aria-label={displayTitle}
      >
        <div className="esh-project-liked-bg" style={{ background: likedBackground }} />
        <div className="esh-project-liked-fg">
          {label ? <span className="esh-project-liked-badge">{label}</span> : null}
          <span className="esh-project-media-title esh-project-media-title--liked">{displayTitle}</span>
          <TechStackIcons stack={stack} />
        </div>
      </div>
    );
  }

  const hasImage = Boolean(imageUrl);
  const bgStyle = hasImage ? { backgroundImage: `url(${imageUrl})` } : { backgroundImage: fallbackBackground };

  return (
    <div className={['esh-project-media', className].filter(Boolean).join(' ')} style={{ aspectRatio }}>
      <div
        className={['esh-project-media-bg', hasImage ? 'esh-project-media-bg--cover' : ''].filter(Boolean).join(' ')}
        style={bgStyle}
      />
      {!hasImage ? (
        <div className="esh-project-media-placeholder" aria-hidden="true">
          <div className="esh-project-placeholder-inner">
            <span className="esh-project-media-title">{displayTitle}</span>
            <TechStackIcons stack={stack} />
          </div>
        </div>
      ) : null}
      <Button variant="primary" type="button" className="esh-project-media-cta" onClick={onCtaClick}>
        {ctaLabel}
      </Button>
    </div>
  );
}
