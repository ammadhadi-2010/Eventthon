import React from 'react';
import { FiCheck } from 'react-icons/fi';

export default function ProjectJoinActions({
  onJoin,
  joining,
  joinError,
  hasJoined,
  embedded = false,
}) {
  const rootClass = embedded ? 'ph-rail-package__join' : 'gigx-mini-card sq-pdv-join';

  return (
    <div className={rootClass}>
      {joinError ? <p className="sq-pdv-join__error">{joinError}</p> : null}
      {hasJoined ? (
        <p className="sq-pdv-join__status">
          <FiCheck size={12} aria-hidden /> You are collaborating on this project.
        </p>
      ) : (
        <>
          <button type="button" className="gigx-contact-btn ph-rail-package__btn" disabled={joining} onClick={onJoin}>
            {joining ? 'Joining…' : 'Request to Collaborate'}
          </button>
          <button
            type="button"
            className="gigx-continue-btn ph-rail-package__btn ph-rail-package__btn--secondary"
            disabled={joining}
            onClick={onJoin}
          >
            Join Project
          </button>
        </>
      )}
    </div>
  );
}
