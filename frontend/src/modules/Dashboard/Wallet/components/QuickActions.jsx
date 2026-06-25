import React from 'react';
import { FiSend, FiDownload, FiShoppingCart, FiRefreshCw, FiLayers, FiChevronRight } from 'react-icons/fi';
import MarketSummary from './MarketSummary';
import StakingRewards from './StakingRewards';

const QUICK_ACTIONS = [
    { label: 'Send THON',     desc: 'Transfer tokens to any wallet',            icon: FiSend,         color: '#6366f1', target: 'send' },
    { label: 'Receive THON',  desc: 'Receive tokens via wallet address or QR',  icon: FiDownload,     color: '#10b981', target: 'receive' },
    { label: 'Buy THON',      desc: 'Purchase THON Coin with card or crypto',   icon: FiShoppingCart, color: '#a855f7', target: 'exchange' },
    { label: 'THON to USDT',  desc: 'Convert your THON to USDT',                icon: FiRefreshCw,    color: '#f59e0b', target: 'convert' },
    { label: 'Staking',       desc: 'Stake THON and earn rewards',              icon: FiLayers,       color: '#3b82f6', badge: 'New', target: 'staking' },
];

const QuickActions = ({ onNavigate }) => {
    return (
        <div style={styles.container}>

            {/* Quick Actions */}
            <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Quick Actions</h4>
                <div style={styles.actionsList}>
                    {QUICK_ACTIONS.map((a, i) => {
                        const Icon = a.icon;
                        return (
                            <button
                                key={i}
                                style={styles.actionRow}
                                onClick={() => onNavigate?.(a.target)}
                            >
                                <div style={styles.actionIcon(a.color)}>
                                    <Icon size={15} color={a.color} />
                                </div>
                                <div style={styles.actionInfo}>
                                    <div style={styles.actionLabel}>
                                        {a.label}
                                        {a.badge && <span style={styles.badge}>{a.badge}</span>}
                                    </div>
                                    <div style={styles.actionDesc}>{a.desc}</div>
                                </div>
                                <FiChevronRight size={14} color="#3b5070" />
                            </button>
                        );
                    })}
                </div>
            </div>

            <div style={styles.divider} />

            {/* Market Summary */}
            <MarketSummary />

            <div style={styles.divider} />

            {/* Staking Rewards */}
            <StakingRewards />

        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0px'
    },
    section: { marginBottom: '4px' },
    sectionTitle: {
        margin: '0 0 14px',
        fontSize: '14px',
        fontWeight: '800',
        color: '#e8eeff'
    },
    actionsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    actionRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: '12px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        transition: 'background 0.15s'
    },
    actionIcon: (color) => ({
        width: '36px', height: '36px',
        borderRadius: '10px',
        background: `${color}18`,
        border: `1px solid ${color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
    }),
    actionInfo: { flex: 1 },
    actionLabel: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#c0cce8',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '2px'
    },
    actionDesc: {
        fontSize: '11px',
        color: '#3b5070',
        lineHeight: '1.4'
    },
    badge: {
        background: 'rgba(99,102,241,0.2)',
        color: '#818cf8',
        fontSize: '9px',
        fontWeight: '800',
        padding: '2px 6px',
        borderRadius: '6px'
    },
    divider: {
        height: '1px',
        background: '#1a2235',
        margin: '16px 0'
    }
};

export default QuickActions;