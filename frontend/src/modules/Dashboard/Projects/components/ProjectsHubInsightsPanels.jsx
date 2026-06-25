import React from 'react';
import { Link } from 'react-router-dom';
import { StarRating } from '../../../../components/reviews';
import { TOP_COLLABORATORS } from '../data/projectsHubData';

function collaboratorAvatar(person) {
  const seed = person.imageurl || person.imageUrl || person.name;
  if (typeof seed === 'string' && seed.startsWith('http')) return seed;
  return `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(person.name)}`;
}

export default function ProjectsHubInsightsPanels({ activity = [], activityLimit = null }) {
  const activityItems = activityLimit ? activity.slice(0, activityLimit) : activity;

  return (
    <>
      <section className="ph-card ph-activity">
        <header className="ph-section-head">
          <h2 className="ph-section-title">Project Activity</h2>
          <Link to="/projects/activity" className="ph-link-btn">
            View All
          </Link>
        </header>
        <ul className="ph-activity-list">
          {activityItems.map((item) => (
            <li key={item.id} className="ph-activity-item">
              <span className="ph-activity-dot" style={{ background: item.tone }} aria-hidden />
              <div>
                <strong>{item.project}</strong>
                <p>{item.action}</p>
                <time>{item.time}</time>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="ph-card ph-collab">
        <header className="ph-section-head">
          <h2 className="ph-section-title">Top Collaborators</h2>
          <Link to="/projects/top-collaborators" className="ph-link-btn">
            View All
          </Link>
        </header>
        <ul className="ph-collab-list">
          {TOP_COLLABORATORS.map((person) => (
            <li key={person.id} className="ph-collab-row">
              <img src={collaboratorAvatar(person)} alt="" className="ph-collab-av" />
              <div className="ph-collab-mid">
                <strong>{person.name}</strong>
                <span>{person.projects} Projects</span>
              </div>
              <div className="ph-collab-rating">
                <StarRating rating={person.rating} iconSize={11} />
                <span>{person.rating.toFixed(1)}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
