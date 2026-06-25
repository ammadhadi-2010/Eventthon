import React from 'react';

const SquadStatsSidebar = ({ members = [], stats = {} }) => {
    const sidebarStyle = {
        width: '300px',
        background: '#0f172a',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        color: '#fff'
    };

    const cardStyle = {
        background: '#1e293b',
        padding: '15px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.05)'
    };

    return (
        <div style={sidebarStyle}>
            {/* Squad Overview */}
            <div style={cardStyle}>
                <h4 style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px' }}>SQUAD OVERVIEW</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>124</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Members</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>94%</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Efficiency</div>
                    </div>
                </div>
            </div>

            {/* Active Members */}
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <h4 style={{ fontSize: '12px', color: '#64748b' }}>ACTIVE MEMBERS</h4>
                    <span style={{ fontSize: '11px', color: '#3b82f6' }}>View all</span>
                </div>
                {['Ammad S.', 'Sarah Khan', 'Usman Ali', 'Hira Saeed'].map((member, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155' }} />
                        <div style={{ fontSize: '13px' }}>{member}</div>
                        <div style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                    </div>
                ))}
            </div>

            {/* Squad Activity Mini-Graph Placeholder */}
            <div style={cardStyle}>
                <h4 style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>SQUAD ACTIVITY</h4>
                <div style={{ height: '60px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                    {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                        <div key={i} style={{ flex: 1, background: '#3b82f6', height: `${h}%`, borderRadius: '2px', opacity: 0.7 }} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SquadStatsSidebar;