import React from 'react';
import { FiCheckCircle, FiClock, FiMoreVertical, FiUsers } from 'react-icons/fi';
import SquadAvatar from './SquadAvatar';
import SquadActivityDonut from './activity/SquadActivityDonut';
import { memberAvatar } from './workspace/squadWorkspaceData';
import '../styles/squad-avatar.css';

const RoleBadge = ({ role }) => {
  if (!role || role === 'Member') return null;
  const colors = { Admin: '#3b82f6', Moderator: '#8b5cf6', Founder: '#f59e0b' };
  const color = colors[role] || '#3b82f6';
  return (
    <span
      style={{
        background: `${color}22`,
        color,
        fontSize: '11px',
        fontWeight: '700',
        padding: '3px 9px',
        borderRadius: '4px',
        marginLeft: '6px',
      }}
    >
      {role}
    </span>
  );
};

export default function SquadOverview({
  selectedSquad,
  members = [],
  hubMetrics,
  activityOverview = [],
  onQuickAction,
  onTabChange,
}) {
  if (!selectedSquad) return <div className="squad-hub__aside" style={styles.container} />;

  const list = (members || []).filter(Boolean);
  const visible = list.slice(0, 5);
  const moreCount = Math.max(0, list.length - visible.length);
  const successRate = selectedSquad.success_rate ?? 96;
  const onTime = selectedSquad.on_time_delivery ?? 98;
  const repeatClients = selectedSquad.repeat_clients ?? 7;

  return (
    <div className="squad-hub__aside" style={styles.container}>
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h4 style={styles.sectionTitle}>Squad Overview</h4>
          <FiMoreVertical size={14} color="#4a5070" />
        </div>

        <div style={styles.squadRow}>
          <SquadAvatar squad={selectedSquad} size="md" />
          <div>
            <div style={styles.squadName}>{selectedSquad.squad_name} 👑</div>
            <div style={styles.squadNiche}>{selectedSquad.niche}</div>
          </div>
        </div>

        <p style={styles.description}>
          {selectedSquad.description ||
            'A squad to share knowledge, strategies and grow together.'}
        </p>

        <SquadActivityDonut
          activityOverview={activityOverview}
          hubMetrics={hubMetrics}
        />
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h4 style={styles.sectionTitle}>Performance Metrics</h4>
        </div>
        <div className="sq-hub-perf">
          <div className="sq-hub-perf__row">
            <span className="sq-hub-perf__icon sq-hub-perf__icon--ok">
              <FiCheckCircle size={16} aria-hidden />
            </span>
            <div>
              <span className="sq-hub-perf__label">Success Rate</span>
              <strong>{successRate}%</strong>
            </div>
          </div>
          <div className="sq-hub-perf__row">
            <span className="sq-hub-perf__icon sq-hub-perf__icon--time">
              <FiClock size={16} aria-hidden />
            </span>
            <div>
              <span className="sq-hub-perf__label">On-Time Delivery</span>
              <strong>{onTime}%</strong>
            </div>
          </div>
          <div className="sq-hub-perf__row">
            <span className="sq-hub-perf__icon sq-hub-perf__icon--people">
              <FiUsers size={16} aria-hidden />
            </span>
            <div>
              <span className="sq-hub-perf__label">Repeat Clients</span>
              <strong>{repeatClients}</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h4 style={styles.sectionTitle}>Active Members</h4>
          <button
            type="button"
            style={styles.viewAllBtn}
            onClick={() => onTabChange?.('Members')}
          >
            View all
          </button>
        </div>

        {visible.map((m, i) => {
          const avatar =
            m.avatar || m.imageurl || m.profile_image_url || memberAvatar(m.name);
          return (
            <div key={m.id || m.name || i} style={styles.memberRow(i < visible.length - 1)}>
              <div style={styles.avatarWrap}>
                <img src={avatar} alt="" style={styles.avatarImage} />
                {m.online ? <span style={styles.onlineDot} aria-hidden /> : null}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={styles.memberName}>{m.name}</span>
                <RoleBadge role={m.role} />
                <div style={styles.memberRole}>{m.title || m.role || 'Member'}</div>
              </div>
            </div>
          );
        })}

        {moreCount > 0 ? (
          <button
            type="button"
            className="sq-hub-more-members"
            onClick={() => onTabChange?.('Members')}
          >
            +{moreCount} More Members
          </button>
        ) : null}
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <h4 style={{ ...styles.sectionTitle, marginBottom: '14px' }}>Quick Actions</h4>
        <div style={styles.actionsGrid}>
          <button
            type="button"
            style={{ ...styles.actionBtn, color: '#3b82f6', border: '1px solid #3b82f622' }}
            onClick={() => onQuickAction?.('project')}
          >
            <span>🚀</span> Create Project
          </button>
          <button
            type="button"
            style={{ ...styles.actionBtn, color: '#8b5cf6', border: '1px solid #8b5cf622' }}
            onClick={() => onQuickAction?.('poll')}
          >
            <span>📊</span> Create Poll
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: '#13151c',
    borderLeft: '1px solid #1e2130',
    padding: '22px 20px',
    minHeight: 0,
    height: '100%',
    fontSize: '14px',
    lineHeight: 1.45,
  },
  section: { marginBottom: '6px' },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '800',
    color: '#3b82f6',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
  },
  viewAllBtn: {
    fontSize: '12px',
    color: '#3b82f6',
    cursor: 'pointer',
    fontWeight: '600',
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'inherit',
  },
  divider: { height: '1px', background: '#1e2130', margin: '18px 0' },
  squadRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  squadName: { fontSize: '15px', fontWeight: '700', color: '#e8eeff', lineHeight: 1.3 },
  squadNiche: { fontSize: '12px', color: '#94a3b8', marginTop: '2px' },
  description: {
    fontSize: '13px',
    color: '#cbd5e0',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  memberRow: (border) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 0',
    borderBottom: border ? '1px solid #1e2130' : 'none',
  }),
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatarImage: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    objectFit: 'cover',
    border: '1px solid rgba(148,163,184,0.35)',
    display: 'block',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#10b981',
    border: '2px solid #13151c',
  },
  memberName: { fontSize: '14px', fontWeight: '600', color: '#e8eeff' },
  memberRole: { fontSize: '11px', color: '#64748b', marginTop: 2 },
  actionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  actionBtn: {
    background: '#1e2a4a',
    padding: '12px 10px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: '600',
    textAlign: 'left',
    border: 'none',
    fontFamily: 'inherit',
  },
};
