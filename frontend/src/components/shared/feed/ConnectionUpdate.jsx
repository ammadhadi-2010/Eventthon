import React from 'react';
import ActivityTimestamp from '../ActivityTimestamp';

export default function ConnectionUpdate({ actorName, peerName, createdAt }) {
  return (
    <>
      <p className="esh-feed-line">
        <span className="esh-feed-name">{actorName}</span> <span>connected with</span>{' '}
        <span className="esh-feed-target esh-feed-target--accent">{peerName}</span>
      </p>
      <ActivityTimestamp createdAt={createdAt} compact />
    </>
  );
}
