import React from 'react';
import SquadCard from '../../Dashboard/SquadNetwork/components/SquadCard';

export default function PublicSquadShowcase({ data }) {
  const squad = {
    squad_name: data.displayName,
    niche: data.professionalRole,
    icon: data.icon || data.displayName?.charAt(0),
    members: Array.from({ length: data.memberCount || 0 }),
    online: 0,
  };

  return (
    <div className="public-showroom-card public-squad-showcase">
      <SquadCard squad={squad} isSelected={false} onSelect={() => {}} userData={null} />
      <p className="public-bio">{data.dynamicBio}</p>
      {data.membersPreview?.length > 0 && (
        <div className="public-members-grid">
          {data.membersPreview.map((member) => (
            <div key={`${member.displayName}-${member.role}`} className="public-member-chip">
              <img src={member.avatar} alt="" />
              <div>
                <strong>{member.displayName}</strong>
                <span>{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
