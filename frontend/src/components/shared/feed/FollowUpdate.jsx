import React from 'react';
import ActivityTimestamp from '../ActivityTimestamp';

export default function FollowUpdate({ actorName, leadName, trailText = '', createdAt }) {
  return (
    <>
      <p className="esh-feed-line">
        <span className="esh-feed-name">{actorName}</span> <span>followed</span>{' '}
        <span className="esh-feed-target esh-feed-target--accent">{leadName}</span>
        {trailText ? <span>{trailText}</span> : null}
      </p>
      <ActivityTimestamp createdAt={createdAt} compact />
    </>
  );
}
