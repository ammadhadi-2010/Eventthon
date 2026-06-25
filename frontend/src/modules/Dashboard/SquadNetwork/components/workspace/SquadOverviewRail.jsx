import React from 'react';
import { ChevronRight, UserPlus } from 'lucide-react';
import { SQUAD_GOALS, QUICK_ACTIONS, memberAvatar } from './squadWorkspaceData';

export default function SquadOverviewRail({ members = [], onTabChange, onInvite, onQuickAction }) {
  const onlineCount = members.filter((m) => m.online).length;
  const xpCurrent = 2450;
  const xpGoal = 5000;
  const xpPct = Math.round((xpCurrent / xpGoal) * 100);

  return (
    <div className="sq-ws-stack sq-ws-dashboard-rail-inner">
      <section className="sq-ws-glass sq-ws-glass--glow sq-ws-pad">
        <h3 className="sq-ws-card-title">Squad Overview</h3>
        <p className="sq-ws-level-line">
          Level: <strong>Pro</strong> ⭐
        </p>
        <div className="sq-ws-xp" aria-hidden>
          <span style={{ width: `${xpPct}%` }} />
        </div>
        <p className="sq-ws-text-caption" style={{ margin: '0 0 8px' }}>
          {xpCurrent.toLocaleString()} / {xpGoal.toLocaleString()} XP
        </p>
        <ul className="sq-ws-goals">
          {SQUAD_GOALS.map((goal) => (
            <li key={goal}>✓ {goal}</li>
          ))}
        </ul>
        <button type="button" className="sq-ws-btn sq-ws-btn--primary" style={{ width: '100%', marginTop: 10 }}>
          View Squad Analytics
        </button>
      </section>

      <section className="sq-ws-glass sq-ws-pad">
        <h3 className="sq-ws-card-title">Active Members ({onlineCount} online)</h3>
        {members.slice(0, 6).map((member) => (
          <div key={member.id || member.name} className="sq-ws-member">
            <img src={member.avatar || memberAvatar(member.name)} alt="" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong className="sq-ws-member-name">{member.name}</strong>
              <span className="sq-ws-member-role">{member.role || 'Member'}</span>
            </div>
            <span className={`sq-ws-dot ${member.online ? 'sq-ws-dot--on' : 'sq-ws-dot--off'}`} />
          </div>
        ))}
        <button type="button" className="sq-ws-btn" style={{ width: '100%', marginTop: 8 }} onClick={onInvite}>
          <UserPlus size={14} /> Invite Members
        </button>
      </section>

      <section className="sq-ws-glass sq-ws-pad">
        <h3 className="sq-ws-card-title">Quick Actions</h3>
        <div className="sq-ws-quick">
          {QUICK_ACTIONS.map((item) => (
            <button
              key={item.label}
              type="button"
              className="sq-ws-quick-item"
              onClick={() => {
                if (item.action === 'invite') onInvite?.();
                else if (item.tab) onTabChange?.(item.tab);
                onQuickAction?.(item.action);
              }}
            >
              <span className="sq-ws-quick-icon">◆</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              <ChevronRight size={14} color="#64748b" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
