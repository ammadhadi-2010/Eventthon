import React from 'react';
import ActivityTimestamp from '../ActivityTimestamp';
import TechStackIcons from './TechStackIcons';

/** New project posted — main column only (thumbnail lives in `FeedProjectThumbRail`). */
export default function ProjectUpdate({
  actorName,
  projectTitle,
  createdAt,
  projectSubtitle = '',
  techStack = [],
}) {
  return (
    <>
      <p className="esh-feed-line">
        <span className="esh-feed-name">{actorName}</span> <span>posted a new project</span>{' '}
        <span className="esh-feed-target">{projectTitle}</span>
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
