import React from 'react';
import ActivityTimestamp from '../ActivityTimestamp';
import TechStackIcons from './TechStackIcons';

/**
 * Generic API activity (main column). Thumbnail rail is composed by the parent when `project` is set.
 */
export default function ApiActivityUpdate({
  authorName,
  activityLabel,
  snippet,
  createdAt,
  projectSubtitle = '',
  techStack = [],
}) {
  return (
    <>
      <p className="esh-feed-line">
        <span className="esh-feed-name">{authorName}</span> <span>{activityLabel}</span>
        {snippet ? (
          <>
            : <span className="esh-feed-target esh-feed-target--accent">{snippet}</span>
          </>
        ) : null}
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
