import React from 'react';
import { FiLayers } from 'react-icons/fi';

const StakingRewards = () => {
    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <h4 style={styles.title}>Staking Rewards</h4>
                <span style={styles.viewAll}>View All</span>
            </div>

            {/* Staked Balance */}
            <div style={styles.card}>
                <div style={styles.cardTop}>
                    <div style={styles.iconBox}>
                        <FiLayers size={16} color="#6366f1" />
                    </div>
                    <div>
                        <div style={styles.cardLabel}>Your Staked Balance</div>
                        <div style={styles.stakedAmount}>25,000.00 THON</div>
                    </div>
                    <button style={styles.stakeBtn}>Stake More</button>
                </div>

                <div style={styles.divider} />

                {/* APY + Earned */}
                <div style={styles.statsRow}>
                    <div style={styles.stat}>
                        <div style={styles.statLabel}>Est. APY</div>
                        <div style={styles.statValue}>15.5%</div>
                    </div>
                    <div style={styles.stat}>
                        <div style={styles.statLabel}>Rewards Earned</div>
                        <div style={styles.statValue}>
                            1,250.75 THON
                            <span style={styles.usdVal}>($12.34)</span>
                        </div>
                    </div>
                </div>

                {/* Claim Button */}
                <button style={styles.claimBtn}>
                    Claim Rewards
                </button>
            </div>

        </div>
    );
};

const styles = {
    container: {},
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px'
    },
    title: {
        margin: 0,
        fontSize: '14px',
        fontWeight: '800',
        color: '#e8eeff'
    },
    viewAll: {
        fontSize: '12px',
        color: '#6366f1',
        fontWeight: '700',
        cursor: 'pointer'
    },
    card: {
        background: 'linear-gradient(135deg, #0f1628, #1a1f35)',
        borderRadius: '14px',
        border: '1px solid #1e2a45',
        padding: '16px'
    },
    cardTop: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '14px'
    },
    iconBox: {
        width: '38px', height: '38px',
        borderRadius: '10px',
        background: 'rgba(99,102,241,0.15)',
        border: '1px solid rgba(99,102,241,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
    },
    cardLabel: {
        fontSize: '10px',
        color: '#3b5070',
        fontWeight: '600',
        marginBottom: '3px'
    },
    stakedAmount: {
        fontSize: '16px',
        fontWeight: '900',
        color: '#e8eeff'
    },
    stakeBtn: {
        marginLeft: 'auto',
        background: 'rgba(99,102,241,0.15)',
        color: '#818cf8',
        border: '1px solid rgba(99,102,241,0.3)',
        padding: '7px 12px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: '700',
        cursor: 'pointer',
        flexShrink: 0
    },
    divider: {
        height: '1px',
        background: '#1e2a45',
        marginBottom: '14px'
    },
    statsRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '14px'
    },
    stat: {},
    statLabel: {
        fontSize: '10px',
        color: '#3b5070',
        fontWeight: '600',
        marginBottom: '4px'
    },
    statValue: {
        fontSize: '14px',
        fontWeight: '800',
        color: '#e8eeff',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
    },
    usdVal: {
        fontSize: '11px',
        color: '#4a5580',
        fontWeight: '500'
    },
    claimBtn: {
        width: '100%',
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        color: '#fff',
        border: 'none',
        padding: '11px',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '800',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(99,102,241,0.3)'
    }
};

export default StakingRewards;