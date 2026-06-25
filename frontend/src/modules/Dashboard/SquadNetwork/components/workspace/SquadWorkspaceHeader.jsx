import React from 'react';
import { Calendar, Globe, UserPlus } from 'lucide-react';
import SquadAvatar from '../SquadAvatar';
import { formatSquadDate } from './squadWorkspaceData';
import '../../styles/squad-avatar.css';

export default function SquadWorkspaceHeader({ squad, stats, onInvite, onManage }) {
  const isPublic = squad?.settings?.publicListing !== false;
  const online = stats?.online ?? 0;
  const members = stats?.members ?? 0;
  const projects = stats?.projects ?? 0;
  const activity = squad?.efficiency || '98%';

  return (
    <header className="sq-ws-header">
      <SquadAvatar squad={squad} size="lg" className="sq-ws-avatar-slot" />

      <div>
        <h1 className="sq-ws-title">
          {squad?.squad_name || 'Squad'}
          <span aria-hidden> 👑</span>
          <span className="sq-ws-badge">{isPublic ? 'Public' : 'Private'}</span>
        </h1>
        <p className="sq-ws-sub">{squad?.niche || 'Collaboration Squad'}</p>
        <p className="sq-ws-desc">
          {squad?.description || 'A squad to share knowledge, strategies and grow together.'}
        </p>
        <div className="sq-ws-meta">
          <span><Calendar size={12} style={{ verticalAlign: -2, marginRight: 4 }} />Created {formatSquadDate(squad?.created_at)}</span>
          <span><Globe size={12} style={{ verticalAlign: -2, marginRight: 4 }} />Pakistan</span>
          <span>English</span>
        </div>
      </div>

      <div>
        <div className="sq-ws-actions" style={{ marginBottom: 10 }}>
          <button type="button" className="sq-ws-btn" onClick={onInvite}>
            <UserPlus size={14} /> Invite
          </button>
          <button type="button" className="sq-ws-btn sq-ws-btn--primary" onClick={onManage}>
            Manage Squad
          </button>
        </div>
        <div className="sq-ws-header-stats">
          <div className="sq-ws-stat-pill"><strong>{members}</strong>Members</div>
          <div className="sq-ws-stat-pill"><strong>{online}</strong>Online</div>
          <div className="sq-ws-stat-pill"><strong>{projects}</strong>Projects</div>
          <div className="sq-ws-stat-pill"><strong>{activity}</strong>Activity</div>
          <div className="sq-ws-stat-pill sq-ws-glass--glow"><strong>Pro</strong>Rank ⭐</div>
        </div>
      </div>
    </header>
  );
}
