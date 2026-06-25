import React from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import SquadAvatar from './SquadAvatar';
import SquadActivityDonut from './activity/SquadActivityDonut';
import '../styles/squad-avatar.css';

const QUICK_ACTIONS = [
    { label: 'Start a Project', icon: '🚀', color: '#3b82f6' },
    { label: 'Create Poll',     icon: '📊', color: '#8b5cf6' },
    { label: 'Upload File',     icon: '📁', color: '#10b981' },
    { label: 'Schedule Meeting',icon: '📅', color: '#f59e0b' },
];

const ACTIVITY_BARS = [30, 50, 35, 70, 45, 85, 90];

const defaultActivityStats = (messageCount) => [
    { label: 'Messages', value: String(messageCount ?? 256), change: '+24%' },
    { label: 'New Members', value: '32', change: '+12%' },
    { label: 'Active Users', value: '89', change: '+18%' },
];

const RoleBadge = ({ role }) => {
    if (!role) return null;
    const colors = { Admin: '#3b82f6', Moderator: '#8b5cf6' };
    return (
        <span style={{
            background: `${colors[role]}22`, color: colors[role],
            fontSize: '11px', fontWeight: '700',
            padding: '3px 9px', borderRadius: '4px', marginLeft: '6px'
        }}>{role}</span>
    );
};

const SquadOverview = ({ selectedSquad, members = [], hubMetrics, activityOverview = [], onQuickAction }) => {
    if (!selectedSquad) return <div className="squad-hub__aside" style={styles.container} />;

    return (
        <div className="squad-hub__aside" style={styles.container}>

            {/* Squad Overview */}
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
                    {selectedSquad.description || 'A squad to share knowledge, strategies and grow together.'}
                </p>

                <SquadActivityDonut
                    activityOverview={activityOverview}
                    hubMetrics={hubMetrics}
                />
            </div>

            <div style={styles.divider} />

            {/* Active Members */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h4 style={styles.sectionTitle}>Active Members</h4>
                    <span style={styles.viewAll}>View all</span>
                </div>

                {(members || []).filter(Boolean).map((m, i) => (
                    <div key={i} style={styles.memberRow(i < members.length - 1)}>
                        {m.avatar ? (
                            <img src={m.avatar} alt={m.name} style={styles.avatarImage} />
                        ) : (
                            <div style={{ ...styles.avatar, background: '#1e2a4a', border: '2px solid #2a3a6a', color: '#60a5fa' }}>
                                {m.name?.charAt(0)}
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <span style={styles.memberName}>{m.name}</span>
                            <RoleBadge role={m.role === 'Member' ? null : m.role} />
                        </div>
                        <FiMoreVertical size={15} color="#2a3050" style={{ cursor: 'pointer' }} />
                    </div>
                ))}
            </div>

            <div style={styles.divider} />

            {/* Quick Actions */}
            <div style={styles.section}>
                <h4 style={{ ...styles.sectionTitle, marginBottom: '14px' }}>Quick Actions</h4>
                <div style={styles.actionsGrid}>
                    {QUICK_ACTIONS.map(a => (
                        <button
                            key={a.label}
                            style={{ ...styles.actionBtn, color: a.color, border: `1px solid ${a.color}22` }}
                            onClick={() => {
                                if (a.label.includes('Project')) onQuickAction?.('project');
                                if (a.label.includes('Poll')) onQuickAction?.('poll');
                                if (a.label.includes('Upload')) onQuickAction?.('upload');
                                if (a.label.includes('Meeting')) onQuickAction?.('meeting');
                            }}
                        >
                            <span>{a.icon}</span> {a.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={styles.divider} />

            {/* Squad Activity */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h4 style={styles.sectionTitle}>Squad Activity (7 Days)</h4>
                    <span style={styles.viewAll}>View all</span>
                </div>

                <div style={styles.chartBox}>
                    <div style={styles.chart}>
                        {(selectedSquad?.trend_7d || ACTIVITY_BARS).map((h, i) => (
                            <div key={i} style={{ ...styles.bar, height: `${h}%` }} />
                        ))}
                    </div>
                    <div style={styles.chartStats}>
                        {(selectedSquad?.activity || defaultActivityStats(hubMetrics?.messages)).map((s) => (
                            <div key={s.label} style={{ textAlign: 'center' }}>
                                <div style={styles.chartValue}>{s.value || s.value === 0 ? s.value : '-'}</div>
                                <div style={styles.chartLabel}>{s.label}</div>
                                <div style={styles.chartChange}>{s.change}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

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
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '14px'
    },
    sectionTitle: {
        margin: 0, fontSize: '13px', fontWeight: '800',
        color: '#3b82f6', letterSpacing: '0.8px', textTransform: 'uppercase'
    },
    viewAll: { fontSize: '12px', color: '#3b82f6', cursor: 'pointer', fontWeight: '600' },
    divider: { height: '1px', background: '#1e2130', margin: '18px 0' },
    squadRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
    squadName: { fontSize: '15px', fontWeight: '700', color: '#e8eeff', lineHeight: 1.3 },
    squadNiche: { fontSize: '12px', color: '#94a3b8', marginTop: '2px' },
    description: { fontSize: '13px', color: '#cbd5e0', lineHeight: '1.6', marginBottom: '16px' },
    memberRow: (border) => ({
        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0',
        borderBottom: border ? '1px solid #1e2130' : 'none'
    }),
    avatar: {
        width: '38px', height: '38px', borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: '700', flexShrink: 0
    },
    avatarImage: {
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        objectFit: 'cover',
        border: '1px solid rgba(148,163,184,0.35)',
        flexShrink: 0
    },
    memberName: { fontSize: '14px', fontWeight: '600', color: '#e8eeff' },
    actionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    actionBtn: {
        background: '#1e2a4a', padding: '12px 10px', borderRadius: '10px',
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        gap: '8px', fontSize: '12px', fontWeight: '600', textAlign: 'left',
        border: 'none',
    },
    chartBox: {
        background: '#0f1117', borderRadius: '12px',
        padding: '16px', border: '1px solid #1e2130'
    },
    chart: {
        display: 'flex', alignItems: 'flex-end',
        gap: '5px', height: '58px', marginBottom: '14px'
    },
    bar: {
        flex: 1,
        background: 'linear-gradient(to top, #3b82f6, #3b82f644)',
        borderRadius: '4px 4px 0 0'
    },
    chartStats: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' },
    chartValue: { fontSize: '18px', fontWeight: '800', color: '#e8eeff' },
    chartLabel: { fontSize: '10px', color: '#94a3b8', marginTop: '2px' },
    chartChange: { fontSize: '10px', color: '#10b981', marginTop: '2px', fontWeight: '600' }
};

export default SquadOverview;
