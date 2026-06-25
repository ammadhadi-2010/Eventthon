import React from 'react';
import ActivityTimestamp from '../ActivityTimestamp';

export default function SquadUpdate({ actorName, squadName, createdAt }) {
  return (
    <>
      <p className="esh-feed-line">
        <span className="esh-feed-name">{actorName}</span> <span>joined the squad</span>{' '}
        <span className="esh-feed-target">{squadName}</span>
      </p>
      <ActivityTimestamp createdAt={createdAt} compact />
    </>
  );
}
