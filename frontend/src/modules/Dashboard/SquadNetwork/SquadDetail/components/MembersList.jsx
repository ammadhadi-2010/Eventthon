import React from 'react';

const MembersList = ({ members = [] }) => {
    return (
        <div style={styles.card}>
            <h4 style={styles.label}>ACTIVE SQUAD MEMBERS</h4>

            {members.length === 0 && (
                <p style={styles.empty}>No members yet.</p>
            )}

            {members.map((m, idx) => (
                <div key={idx} style={styles.row}>
                    <img
                        src={m.img || `https://ui-avatars.com/api/?name=${m.name}&background=1e293b&color=fff`}
                        alt={m.name}
                        style={styles.avatar}
                    />
                    <span style={styles.name}>{m.name}</span>
                </div>
            ))}
        </div>
    );
};

const styles = {
    card: {
        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
        padding: '20px',
        borderRadius: '20px',
        border: '1px solid #1e2130'
    },
    label: {
        margin: '0 0 14px',
        fontSize: '10px',
        fontWeight: '800',
        color: '#4a5070',
        letterSpacing: '1.5px',
        textTransform: 'uppercase'
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.03)',
        marginBottom: '8px'
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        objectFit: 'cover'
    },
    name: {
        fontSize: '13px',
        color: '#c0c8e8',
        fontWeight: '600'
    },
    empty: {
        color: '#4a5070',
        fontSize: '13px',
        margin: 0
    }
};

export default MembersList;