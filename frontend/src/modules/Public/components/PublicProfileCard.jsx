import React from 'react';
import { FiCheckCircle, FiExternalLink } from 'react-icons/fi';
import ProfileCard from '../../Dashboard/components/ProfileCard';

const BASE_URL = 'http://127.0.0.1:8000';

function resolveAvatar(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

/** Reuses dashboard ProfileCard layout with public-safe field mapping. */
export default function PublicProfileCard({ data }) {
  const cardUser = {
    name: data.displayName,
    niche: data.professionalRole,
    headline: data.professionalRole,
    designation: data.professionalRole,
    bio: data.dynamicBio,
    avatar: resolveAvatar(data.avatar),
    banner: null,
    verified: data.verified,
    identity_status: data.verified ? 'Active' : '',
  };

  return (
    <div className="public-showroom-card">
      <ProfileCard userData={cardUser} />
      {data.skillsArray?.length > 0 && (
        <div className="public-skills">
          {data.skillsArray.map((skill) => (
            <span key={skill} className="public-skill-pill">
              {skill}
            </span>
          ))}
        </div>
      )}
      {data.publicPortfolioLinks?.length > 0 && (
        <ul className="public-links">
          {data.publicPortfolioLinks.map((link) => (
            <li key={`${link.label}-${link.url}`}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <FiExternalLink size={12} />
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      {data.verified && (
        <p className="public-verified">
          <FiCheckCircle size={14} /> Verified on EventThon Network
        </p>
      )}
    </div>
  );
}
