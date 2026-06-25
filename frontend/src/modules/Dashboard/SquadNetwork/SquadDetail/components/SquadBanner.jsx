import React from 'react';
import { FiZap, FiMapPin, FiActivity } from 'react-icons/fi';

const SquadBanner = ({ squad }) => {
    return (
        <div style={styles.card}>

            {/* Live Badge */}
            <div style={styles.liveBadge}>
                <FiActivity size={11} /> LIVE PROJECT
            </div>

            {/* Squad Name */}
            <h1 style={styles.name}>{squad.squad_name}</h1>

            {/* Tags */}
            <div style={styles.tags}>
                <span style={styles.nicheTag}>{squad.niche}</span>
                <span style={styles.trustTag}>
                    <FiZap size={12} /> {squad.leader_info?.trust_score || 98}% Trust
                </span>
                <span style={styles.locationTag}>
                    <FiMapPin size={12} /> {squad.leader_info?.location || 'Pakistan'}
                </span>
            </div>

            {/* Description */}
            <p style={styles.description}>{squad.description}</p>

        </div>
    );
};

const styles = {
    card: {
        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
        padding: '28px',
        borderRadius: '20px',
        border: '1px solid #1e2130',
        position: 'relative',
        overflow: 'hidden'
    },
    liveBadge: {
        position: 'absolute',
        top: 0, right: 0,
        padding: '8px 14px',
        background: 'rgba(59,130,246,0.1)',
        color: '#3b82f6',
        fontSize: '10px',
        fontWeight: '800',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        letterSpacing: '1px'
    },
    name: {
        fontSize: 'clamp(22px, 4vw, 32px)',
        margin: '0 0 14px 0',
        color: '#f0f4ff',
        fontWeight: '800'
    },
    tags: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '16px'
    },
    nicheTag: {
        background: 'rgba(59,130,246,0.1)',
        color: '#3b82f6',
        padding: '5px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '700'
    },
    trustTag: {
        background: 'rgba(16,185,129,0.1)',
        color: '#10b981',
        padding: '5px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },
    locationTag: {
        background: 'rgba(100,116,139,0.1)',
        color: '#94a3b8',
        padding: '5px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },
    description: {
        color: '#94a3b8',
        fontSize: '14px',
        lineHeight: '1.7',
        margin: 0
    }
};

export default SquadBanner;