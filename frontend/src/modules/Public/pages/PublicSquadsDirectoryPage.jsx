import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicSeoHead from '../components/PublicSeoHead';
import { fetchPublicShowroomPanel } from '../services/publicApi';
import '../styles/publicViews.css';
import '../styles/showroom-premium.css';

const FALLBACK_SQUADS = [
  {
    title: 'SEO Masters',
    subtitle: 'Squad · SEO & Marketing Squad',
    publicSlug: 'seo-masters',
    publicPath: '/public/squads/seo-masters',
  },
  {
    title: 'Web Dev Warriors',
    subtitle: 'Squad · Web Development Squad',
    publicSlug: 'web-dev-warriors',
    publicPath: '/public/squads/web-dev-warriors',
  },
];

export default function PublicSquadsDirectoryPage() {
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicShowroomPanel()
      .then((data) => {
        const rows = data?.groups?.squads || [];
        setSquads(rows.length ? rows : FALLBACK_SQUADS);
      })
      .catch(() => setSquads(FALLBACK_SQUADS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="ps-page">
      <PublicSeoHead
        title="Explore Squads | EventThon"
        description="Discover public squads on EventThon Network."
        canonicalPath="/public/squads"
      />
      <header className="ps-directory-head">
        <h1>Explore Squads</h1>
        <p>Open a squad to view the public showroom — same layout as SEO Masters.</p>
      </header>
      {loading ? <p className="ps-directory-muted">Loading squads...</p> : null}
      {!loading && !squads.length ? (
        <p className="ps-directory-muted">No public squads listed yet.</p>
      ) : (
        <div className="ps-directory-grid">
          {squads.map((item) => (
            <Link key={item.publicSlug || item.entityId} to={item.publicPath} className="ps-directory-card">
              <strong>{item.title}</strong>
              <span>{item.subtitle}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
