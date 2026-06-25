import React from 'react';
import { contributorAvatarUrl } from '../utils/projectContributors';
import '../../SquadNetwork/styles/squad-project-card.css';

export default function ProjectContributorAvatars({ contributors = [], max = 4, className = '' }) {
  if (!contributors.length) return null;
  const visible = contributors.slice(0, max);
  const overflow = contributors.length - visible.length;

  return (
    <div className={`sq-proj-contrib-row ${className}`.trim()} aria-label="Project contributors">
      {visible.map((person) => (
        <img
          key={person.user_id}
          src={contributorAvatarUrl(person)}
          alt={person.name}
          title={person.name}
          className="sq-proj-contrib-avatar"
        />
      ))}
      {overflow > 0 ? <span className="sq-proj-contrib-more">+{overflow}</span> : null}
    </div>
  );
}
