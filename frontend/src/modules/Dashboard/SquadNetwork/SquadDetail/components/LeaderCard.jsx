import React from 'react';

const LeaderCard = ({ leader = {} }) => {
    return (
        <div style={styles.card}>
            <h4 style={styles.label}>SQUAD LEADER</h4>

            <div style={styles.center}>
                <div style={styles.avatarWrapper}>
                    <img
                        src={leader.imageurl || `https://ui-avatars.com/api/?name=${leader.name || 'L'}&background=3b82f6&color=fff`}
                        alt="Leader"
                        style={styles.avatar}
                    />
                    <div style={styles.onlineDot} />
                </div>

                <h3 style={styles.name}>{leader.name || 'Unknown'}</h3>
                <div style={styles.rating}>★ {leader.rating || '5.0'} Global Rating</div>

                <div style={styles.statsRow}>
                    <div style={styles.stat}>
                        <div style={styles.statValue}>{leader.trust_score || 98}%</div>
                        <div style={styles.statLabel}>Trust</div>
                    </div>
                    <div style={styles.statDivider} />
                    <div style={styles.stat}>
                        <div style={styles.statValue}>{leader.location || 'PK'}</div>
                        <div style={styles.statLabel}>Location</div>
                    </div>
                </div>
            </div>
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
        margin: '0 0 16px',
        fontSize: '10px',
        fontWeight: '800',
        color: '#4a5070',
        letterSpacing: '1.5px',
        textTransform: 'uppercase'
    },
    center: { textAlign: 'center' },
    avatarWrapper: {
        position: 'relative',
        display: 'inline-block',
        marginBottom: '10px'
    },
    avatar: {
        width: '72px',
        height: '72px',
        borderRadius: '20px',
        border: '3px solid #3b82f6',
        objectFit: 'cover'
    },
    onlineDot: {
        position: 'absolute',
        bottom: '4px',
        right: '0px',
        width: '13px',
        height: '13px',
        borderRadius: '50%',
        background: '#10b981',
        border: '2px solid #0f172a'
    },
    name: {
        margin: '0 0 4px',
        fontSize: '15px',
        fontWeight: '800',
        color: '#f0f4ff'
    },
    rating: {
        fontSize: '12px',
        color: '#3b82f6',
        fontWeight: '700',
        marginBottom: '16px'
    },
    statsRow: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        background: '#0f1117',
        padding: '12px',
        borderRadius: '12px'
    },
    stat: { textAlign: 'center' },
    statValue: { fontSize: '14px', fontWeight: '800', color: '#e8eeff' },
    statLabel: { fontSize: '10px', color: '#4a5070', marginTop: '2px' },
    statDivider: { width: '1px', height: '28px', background: '#1e2130' }
};

export default LeaderCard;