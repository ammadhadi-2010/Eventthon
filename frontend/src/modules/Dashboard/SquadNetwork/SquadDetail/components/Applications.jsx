import React from 'react';
import { approveSquadApplication } from '../../api/squadWorkspaceApi';

const Applications = ({ squadId, squad, onRefresh }) => {
    const handleAction = async (memberMobile, action) => {
        try {
            await approveSquadApplication(squadId, memberMobile, action);
            onRefresh();
        } catch { alert('Action failed'); }
    };

    const pending = (squad?.members || []).filter((m) => m.invite_status === 'pending');

    return (
        <div style={styles.card}>
            <h3 style={styles.title}>Pending Invitations</h3>
            {pending.length > 0 ? pending.map((req) => (
                <div key={req.id || req.mobile} style={styles.row}>
                    <div style={styles.avatar}>{req.name?.charAt(0).toUpperCase()}</div>
                    <span style={styles.name}>{req.name}</span>
                    <div style={styles.actions}>
                        <button onClick={() => handleAction(req.mobile || req.id, 'approve')} style={styles.acceptBtn}>Accept</button>
                        <button onClick={() => handleAction(req.mobile || req.id, 'reject')} style={styles.declineBtn}>Decline</button>
                    </div>
                </div>
            )) : <p style={styles.empty}>No pending invitations.</p>}
        </div>
    );
};

const styles = {
    card: { background: '#13151c', padding: '20px', borderRadius: '20px', border: '1px solid #1e2130' },
    title: { margin: '0 0 16px', fontSize: '15px', fontWeight: '800', color: '#f0f4ff' },
    row: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#0f1117', borderRadius: '10px', marginBottom: '8px' },
    avatar: { width: '34px', height: '34px', borderRadius: '10px', background: '#1e2a4a', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flexShrink: 0 },
    name: { flex: 1, fontSize: '13px', fontWeight: '700', color: '#e8eeff' },
    actions: { display: 'flex', gap: '8px' },
    acceptBtn: { background: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
    declineBtn: { background: '#ef444422', color: '#ef4444', border: '1px solid #ef444433', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
    empty: { color: '#4a5070', fontSize: '13px', margin: 0 },
};

export default Applications;
