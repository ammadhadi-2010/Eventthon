import React from 'react';
import { FiCheck, FiUsers } from 'react-icons/fi';

export default function SquadProjectJoinPanel({
  onJoin,
  joining,
  joinError,
  hasJoined,
  contributorCount,
  embedded = false,
}) {
  const rootClass = embedded ? 'ph-rail-package__join' : 'sq-pdv-join';

  return (
    <div className={rootClass}>
      {!embedded ? (
        <h4 className="sq-pdv-join__title">
          <FiUsers size={14} aria-hidden /> Collaboration
        </h4>
      ) : null}
      {joinError ? <p className="sq-pdv-join__error">{joinError}</p> : null}
      {hasJoined ? (
        <p className="sq-pdv-join__status">
          <FiCheck size={14} aria-hidden />
          You are on this project ({contributorCount} contributor
          {contributorCount === 1 ? '' : 's'}).
        </p>
      ) : (
        <>
          {!embedded ? (
            <p className="sq-pdv-join__hint">
              Join to appear on the project card and receive workspace updates.
            </p>
          ) : null}
          <button type="button" className="sq-pdv-join__btn ph-rail-package__btn" disabled={joining} onClick={onJoin}>
            {joining ? 'Joining…' : 'Request to Collaborate'}
          </button>
          <button
            type="button"
            className="sq-pdv-join__btn sq-pdv-join__btn--ghost ph-rail-package__btn ph-rail-package__btn--secondary"
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
