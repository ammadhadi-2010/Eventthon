import React from 'react';

export default function SquadShowroomHeader({ data }) {
  const stats = data.headerStats || {};
  const icon = data.icon || data.displayName?.slice(0, 3)?.toUpperCase() || 'SQ';

  return (
    <header className="sq-hero">
      <div className="sq-hero__logo" aria-hidden>
        {data.avatar ? <img src={data.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: 16, objectFit: 'cover' }} /> : icon}
      </div>
      <div>
        <h1 className="sq-hero__title">{data.displayName} 👑</h1>
        <p className="sq-hero__niche">
          {data.professionalRole}{' '}
          <span className="sq-badge">{data.isPublic === false ? 'Private' : 'Public'}</span>
        </p>
        <p className="sq-hero__bio">{data.dynamicBio}</p>
        <div className="sq-hero__meta">
          <span>Created {data.createdLabel}</span>
          <span>🌐 {data.countryCode || 'PK'}</span>
          <span>{data.language || 'English'}</span>
        </div>
      </div>
      <div className="sq-hero__stats">
        <div className="sq-stat-pill"><strong>{stats.members ?? 0}</strong>Members</div>
        <div className="sq-stat-pill"><strong>{stats.online ?? 0}</strong>Online</div>
        <div className="sq-stat-pill"><strong>{stats.projects ?? 0}</strong>Projects</div>
        <div className="sq-stat-pill"><strong>{stats.activityScore ?? '98%'}</strong>Activity</div>
        <div className="sq-stat-pill"><strong>{stats.rank ?? 'Pro'}</strong>Rank ⭐</div>
      </div>
    </header>
  );
}
