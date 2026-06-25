import React from 'react';
import { teamAvatarUrl } from './projectData';

export default function ProjectTeamAvatars({ team = [], extraTeam = 0 }) {
  return (
    <div className="flex -space-x-2">
      {team.slice(0, 4).map((member, index) => (
        <img
          key={`${member.name}-${index}`}
          src={teamAvatarUrl(member)}
          alt={member.name || 'Team member'}
          title={member.name}
          className="inline-flex h-7 w-7 shrink-0 rounded-full border-2 border-[#121418] object-cover bg-[#1e293b]"
        />
      ))}
      {extraTeam > 0 ? (
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#121418] bg-[#252a35] text-[9px] font-bold text-slate-300">
          +{extraTeam}
        </span>
      ) : null}
    </div>
  );
}
