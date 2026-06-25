import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiShoppingCart, FiRefreshCw, FiArrowUpRight, FiTrendingUp } from 'react-icons/fi';
import { styles } from '../styles/WalletOverview.styles';

const ACTION_BTNS = [
    { label: 'Buy THON', icon: FiShoppingCart, color: '#a855f7', target: 'exchange' },
    { label: 'Convert THON → PKR', icon: FiRefreshCw, color: '#f59e0b', target: 'convert' },
    { label: 'Withdrawal', icon: FiArrowUpRight, color: '#10b981', target: 'send' },
];

const WalletOverview = ({ userData, wallet, loading, onNavigate }) => {
    const [showBalance, setShowBalance] = useState(true);
    const thonBalances = wallet?.balances?.THON || {};
    const pkrBalances = wallet?.balances?.PKR || {};
    const totalTHON = Number(thonBalances.available || 0) + Number(thonBalances.pending || 0) + Number(thonBalances.locked || 0);
    const totalPKR = Number(pkrBalances.available || 0) + Number(pkrBalances.pending || 0) + Number(pkrBalances.locked || 0);
    const balanceText = loading ? 'Loading...' : `PKR ${totalPKR.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    const thonText = loading ? 'Loading...' : `${totalTHON.toLocaleString(undefined, { maximumFractionDigits: 4 })} THON`;

    return (
        <div style={styles.container}>

            {/* Title */}
            <div style={styles.titleRow}>
                <div>
                    <h2 style={styles.title}>Wallet Overview</h2>
                    <p style={styles.subtitle}>Manage THON Coin, convert to PKR, and withdraw securely.</p>
                </div>
                <div style={styles.titleActions}>
                    <button style={styles.outlineBtn}><FiEye size={14} /> Balance Visibility</button>
                    <button style={styles.outlineBtn} onClick={() => onNavigate?.('payment')}>Payment Methods</button>
                </div>
            </div>

            {/* Balance Hero */}
            <div style={styles.heroCard}>
                <div style={styles.heroLeft}>
                    <div style={styles.balanceLabel}>
                        Total Balance (PKR)
                        <button onClick={() => setShowBalance(!showBalance)} style={styles.eyeBtn}>
                            {showBalance ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                        </button>
                    </div>
                    <div style={styles.balanceAmount}>{showBalance ? balanceText : '••••••'}</div>
                    <div style={styles.balanceETC}>THON Balance: {showBalance ? thonText : '••••••'}</div>
                    <div style={styles.balanceChange}><FiTrendingUp size={13} /> THON ecosystem performance updated daily</div>
                </div>
                <div style={styles.heroRight}>
                    {ACTION_BTNS.map(btn => {
                        const Icon = btn.icon;
                        return (
                            <button key={btn.label} style={styles.actionBtn} onClick={() => onNavigate?.(btn.target)}>
                                <div style={styles.actionIcon(btn.color)}><Icon size={18} color={btn.color} /></div>
                                <span style={styles.actionLabel}>{btn.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* THON Coin Ticker */}
            <div style={styles.tickerCard}>
                <div style={styles.tickerLeft}>
                    <div style={styles.coinBadge}>ET</div>
                    <div>
                        <div style={styles.tickerName}>THON Coin (THON) <span style={styles.verified}>✓ Verified</span></div>
                        <div style={styles.tickerPrice}>PKR 285.50 <span style={styles.tickerChange}>+8.32%</span></div>
                    </div>
                </div>
                <div style={styles.tickerStats}>
                    {[
                        { label: 'Available THON', val: `${Number(thonBalances.available || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}` },
                        { label: 'Pending THON', val: `${Number(thonBalances.pending || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}` },
                        { label: 'Locked THON', val: `${Number(thonBalances.locked || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}` },
                    ].map(s => (
                        <div key={s.label} style={styles.tickerStat}>
                            <div style={styles.statLabel}>{s.label}</div>
                            <div style={styles.statVal}>{s.val}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WalletOverview;