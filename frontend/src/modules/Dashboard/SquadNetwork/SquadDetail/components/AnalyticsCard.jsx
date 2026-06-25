import React from 'react';
import { FiActivity } from 'react-icons/fi';

const STATS = [
    { label: 'Efficiency', value: 94 },
    { label: 'Activity',   value: 78 },
    { label: 'Retention',  value: 88 },
];

const AnalyticsCard = () => {
    return (
        <div style={styles.card}>
            <h4 style={styles.title}>
                <FiActivity color="#3b82f6" /> ANALYTICS
            </h4>

            {STATS.map(s => (
                <div key={s.label} style={styles.statRow}>
                    <div style={styles.statHeader}>
                        <span style={styles.statLabel}>{s.label}</span>
                        <span style={styles.statValue}>{s.value}%</span>
                    </div>
                    <div style={styles.barBg}>
                        <div style={{ ...styles.barFill, width: `${s.value}%` }} />
                    </div>
                </div>
            ))}
        </div>
    );
};

const styles = {
    card: {
        background: 'linear-gradient(to bottom right, #1e293b, #0f1117)',
        padding: '20px',
        borderRadius: '20px',
        border: '1px solid #1e2130'
    },
    title: {
        margin: '0 0 16px',
        fontSize: '11px',
        fontWeight: '800',
        color: '#f0f4ff',
        letterSpacing: '1px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        textTransform: 'uppercase'
    },
    statRow: { marginBottom: '14px' },
    statHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '6px'
    },
    statLabel: { fontSize: '12px', color: '#94a3b8' },
    statValue: { fontSize: '12px', color: '#fff', fontWeight: '700' },
    barBg: {
        height: '4px',
        background: '#1e293b',
        borderRadius: '10px'
    },
    barFill: {
        height: '100%',
        background: 'linear-gradient(to right, #3b82f6, #10b981)',
        borderRadius: '10px'
    }
};

export default AnalyticsCard;