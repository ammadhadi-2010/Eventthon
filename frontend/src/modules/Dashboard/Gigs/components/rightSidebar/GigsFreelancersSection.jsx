import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { TOP_FREELANCERS } from '../../data/gigsRightSidebarData';

export default function GigsFreelancersSection() {
  const navigate = useNavigate();

  return (
    <div className="gigs-card gigs-right-list-card">
      <div className="gigs-right-section-head">
        <h3>Top Rated Freelancers</h3>
        <Link to="/gigs/providers">View All</Link>
      </div>
      <div className="gigs-right-list">
        {TOP_FREELANCERS.map((item) => (
          <article
            key={item.id}
            className="gigs-right-list-row simple is-interactive"
            role="button"
            tabIndex={0}
            onClick={() => navigate(item.path)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(item.path);
              }
            }}
          >
            <div className="gigs-right-list-avatar">{item.name.charAt(0)}</div>
            <div>
              <h4>{item.name}</h4>
              <p>{item.skill}</p>
            </div>
            <div className="gigs-right-meta">
              <small>
                <FiStar size={11} /> {item.rating}
              </small>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
