import React from 'react';

export default function SquadShowroomSidebar({ data }) {
  const overview = data.overview || {};
  const xpPct = overview.xpGoal
    ? Math.min(100, Math.round((overview.xpCurrent / overview.xpGoal) * 100))
    : 49;

  return (
    <aside>
      <section className="sq-card">
        <h3>Squad Overview</h3>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>
          Level: <strong>{overview.level || 'Pro'}</strong>
        </p>
        <div className="sq-xp" aria-hidden>
          <span style={{ width: `${xpPct}%` }} />
        </div>
        <p style={{ margin: '0 0 0.65rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          {overview.xpCurrent?.toLocaleString()} / {overview.xpGoal?.toLocaleString()} XP
        </p>
        <ul className="sq-goals">
          {(overview.goals || []).map((goal) => (
            <li key={goal}>{goal}</li>
          ))}
        </ul>
      </section>

      <section className="sq-card">
        <h3>Active Members</h3>
        {(data.members || []).map((member) => (
          <div key={`${member.displayName}-${member.role}`} className="sq-member">
            <img src={member.avatar} alt="" />
            <div>
              <strong style={{ fontSize: '0.82rem' }}>{member.displayName}</strong>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {member.role}
                {member.online ? ' · Online' : ''}
              </div>
            </div>
          </div>
        ))}
      </section>
    </aside>
  );
}
