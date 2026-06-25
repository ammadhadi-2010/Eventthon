import React from 'react';
import ActivityTimestamp from '../ActivityTimestamp';
import TechStackIcons from './TechStackIcons';

export default function LikedProjectUpdate({
  actorName,
  projectTitle,
  createdAt,
  projectSubtitle = '',
  techStack = [],
}) {
  return (
    <>
      <p className="esh-feed-line">
        <span className="esh-feed-name">{actorName}</span> <span>liked the project</span>{' '}
        <span className="esh-feed-target esh-feed-target--accent">{projectTitle}</span>
      </p>
      <ActivityTimestamp createdAt={createdAt} compact />
      {projectSubtitle ? (
        <div className="esh-feed-subtitle">
          <span className="esh-feed-subtitle-text">{projectSubtitle}</span>
          <TechStackIcons stack={techStack} size="sm" className="esh-feed-subtitle-tech" max={5} />
        </div>
      ) : techStack.length ? (
        <div className="esh-feed-subtitle">
          <TechStackIcons stack={techStack} size="sm" className="esh-feed-subtitle-tech" max={5} />
        </div>
      ) : null}
    </>
  );
}
