import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

function CommanderBadge({ tier }) {
  if (!tier) return null;
  return (
    <span className={`pnet-user-card__badge pnet-user-card__badge--${tier}`} title="Commander" aria-label="Commander">
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
        <path
          fill="currentColor"
          d="M12 2l2.2 4.5 4.9.7-3.5 3.4.8 4.9L12 16.9 7.6 15.5l.8-4.9L5 7.2l4.9-.7L12 2z"
        />
      </svg>
    </span>
  );
}

/**
 * @param {'commanders'|'social'} listMode
 * @param {'mutual'|undefined} socialVariant — mutual row layout (facepile strip, Message primary).
 */
export default function UserListCard({ user, listMode, socialVariant, onSocialAction }) {
  const {
    name,
    avatarUrl,
    squadLine,
    headline,
    followersLabel,
    connectionsLabel,
    online,
    commanderBadge,
    verified,
    mutualSummary,
    mutualFaceUrls = [],
    mutualExtraCount,
  } = user;
  const isCommanders = listMode === 'commanders';
  const isMutual = listMode === 'social' && socialVariant === 'mutual';

  return (
    <article className={`pnet-user-card${isMutual ? ' pnet-user-card--mutual' : ''}`}>
      <img className="pnet-user-card__av" src={avatarUrl} alt="" />
      <div className="pnet-user-card__mid">
        <div className="pnet-user-card__name-row">
          <span className="pnet-user-card__name">{name}</span>
          {isCommanders ? <CommanderBadge tier={commanderBadge} /> : null}
          {isMutual && verified ? (
            <span className="pnet-user-card__verified" title="Verified">
              <Check size={13} strokeWidth={3} aria-hidden />
            </span>
          ) : null}
        </div>
        {!isMutual && squadLine ? <div className="pnet-user-card__squad">{squadLine}</div> : null}
        <div className="pnet-user-card__title">{headline}</div>
        {isMutual && mutualSummary ? (
          <div className="pnet-user-card__mutual-summary">{mutualSummary}</div>
        ) : !isMutual ? (
          <div className="pnet-user-card__stats">
            {followersLabel}
            {followersLabel && connectionsLabel ? ' · ' : ''}
            {connectionsLabel}
          </div>
        ) : null}
      </div>

      {isMutual ? (
        <div className="pnet-user-card__mutual-strip" aria-hidden="true">
          {mutualFaceUrls.slice(0, 6).map((url, idx) => (
            <img key={idx} src={url} alt="" className="pnet-user-card__mutual-face" />
          ))}
          {mutualExtraCount > 0 ? (
            <span className="pnet-user-card__mutual-extra">+{mutualExtraCount}</span>
          ) : null}
        </div>
      ) : null}

      <div className="pnet-user-card__actions">
        {isCommanders ? (
          <Link to="/profile" className="pnet-btn pnet-btn--primary">
            View Profile
          </Link>
        ) : isMutual ? (
          <div className="pnet-user-card__btn-row pnet-user-card__btn-row--mutual">
            <button type="button" className="pnet-btn pnet-btn--primary" onClick={() => onSocialAction?.(user.id, 'message')}>
              Message
            </button>
            <button type="button" className="pnet-btn pnet-btn--outline" onClick={() => onSocialAction?.(user.id, 'connect')}>
              Connect
            </button>
          </div>
        ) : (
          <div className="pnet-user-card__btn-row">
            <button type="button" className="pnet-btn pnet-btn--ghost" onClick={() => onSocialAction?.(user.id, 'message')}>
              Message
            </button>
            <button type="button" className="pnet-btn pnet-btn--primary" onClick={() => onSocialAction?.(user.id, 'connect')}>
              Connect
            </button>
          </div>
        )}
        {!isMutual ? (
          <div className={`pnet-user-card__status${online ? ' is-online' : ''}`}>
            <span className="pnet-user-card__dot" aria-hidden />
            {online ? 'Online' : 'Offline'}
          </div>
        ) : null}
      </div>
    </article>
  );
}
