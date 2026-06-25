import React from 'react';
import {
    FiGrid, FiDollarSign, FiActivity, FiArrowUpRight, FiRefreshCw,
    FiCreditCard, FiShield, FiSettings
} from 'react-icons/fi';

const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: FiGrid },
    { id: 'coin', label: 'THON Coin', icon: FiDollarSign, badge: 'HOT' },
    { id: 'transactions', label: 'Transactions', icon: FiActivity },
    { id: 'send', label: 'Withdrawal', icon: FiArrowUpRight },
    { id: 'convert', label: 'Convert THON → PKR', icon: FiRefreshCw },
    { id: 'payment', label: 'Payment Methods', icon: FiCreditCard },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'settings', label: 'Settings', icon: FiSettings },
];

const WalletSidebar = ({ activePage, onNavigate, security }) => {
    const statusRows = [
        { label: 'KYC Verified', enabled: Boolean(security?.kyc_verified) },
        { label: '2FA Enabled', enabled: Boolean(security?.two_factor_enabled) },
        { label: 'Wallet Secure', enabled: Boolean(security?.withdrawal_pin_enabled) },
    ];

    return (
        <div style={styles.container}>
            {/* Wallet Label */}
            <div style={styles.label}>WALLET SYSTEM</div>

            {/* Nav Items */}
            <nav style={styles.nav}>
                {NAV_ITEMS.map(item => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            style={styles.navBtn(isActive)}
                        >
                            <Icon size={18} color={isActive ? '#818cf8' : '#94a3b8'} />
                            <span style={styles.navLabel}>{item.label}</span>
                            {item.badge && (
                                <span style={styles.badge}>{item.badge}</span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Glassmorphism Coin Card */}
            <div style={styles.coinCard}>
                <div style={styles.coinIcon}>ET</div>
                <div style={styles.coinInfo}>
                    <div style={styles.coinName}>EventThon (THON)</div>
                    <p style={styles.coinDesc}>
                        The official utility token of ecosystem.
                    </p>
                    <button style={styles.learnBtn}>Learn More</button>
                </div>
            </div>

            {/* Wallet Status Section */}
            <div style={styles.statusBox}>
                <div style={styles.statusLabel}>SECURITY STATUS</div>
                {statusRows.map((s) => (
                    <div key={s.label} style={styles.statusRow}>
                        <span style={styles.statusText}>{s.label}</span>
                        <span style={styles.statusCheck(s.enabled)}>{s.enabled ? '✓' : '•'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        background: '#080c14',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
        gap: '4px',
        height: '100vh',
        width: '240px',
        overflowY: 'auto',
        position: 'sticky',
        top: 0,
        scrollbarWidth: 'none', // For Firefox
    },
    label: {
        fontSize: '10px',
        fontWeight: '900',
        color: '#475569',
        letterSpacing: '1.5px',
        padding: '0 12px',
        marginBottom: '15px'
    },
    nav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
    },
    navBtn: (active) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        borderRadius: '12px',
        border: 'none',
        background: active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
        color: active ? '#ffffff' : '#94a3b8',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: active ? '700' : '500',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.2s ease',
        borderLeft: active ? '3px solid #818cf8' : '3px solid transparent',
    }),
    navLabel: { flex: 1 },
    badge: {
        background: '#818cf8',
        color: '#ffffff',
        fontSize: '8px',
        fontWeight: '900',
        padding: '2px 5px',
        borderRadius: '4px',
    },
    coinCard: {
        marginTop: '25px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
    },
    coinIcon: {
        width: '36px', height: '36px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '900', fontSize: '12px', color: '#fff',
        marginBottom: '10px'
    },
    coinName: { fontSize: '13px', fontWeight: '800', color: '#ffffff', marginBottom: '4px' },
    coinDesc: { fontSize: '11px', color: '#64748b', lineHeight: '1.4', marginBottom: '12px' },
    learnBtn: {
        background: 'rgba(255, 255, 255, 0.05)',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '8px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: '700',
        cursor: 'pointer',
        width: '100%'
    },
    statusBox: {
        marginTop: 'auto',
        padding: '14px',
        background: 'rgba(16, 185, 129, 0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(16, 185, 129, 0.1)',
        marginBottom: '20px'
    },
    statusLabel: {
        fontSize: '9px',
        fontWeight: '800',
        color: '#10b981',
        marginBottom: '10px'
    },
    statusRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 0',
    },
    statusText: { fontSize: '11px', color: '#94a3b8' },
    statusCheck: (enabled) => ({
        color: enabled ? '#10b981' : '#64748b',
        fontSize: '12px',
        fontWeight: '900',
    })
};

export default WalletSidebar;