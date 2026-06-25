import React, { useState } from 'react';
import { FiCpu, FiLock, FiUnlock, FiTrendingUp, FiZap, FiInfo } from 'react-icons/fi';

const Staking = () => {
    const [stakedAmount, setStakedAmount] = useState("");
    
    // Dynamic Stats Data
    const stakingStats = [
        { label: "Your Staked Balance", value: "25,000.00 THON", icon: <FiLock />, color: "#818cf8" },
        { label: "Estimated APY", value: "15.5%", icon: <FiTrendingUp />, color: "#10b981" },
        { label: "Total Rewards Earned", value: "1,250.75 THON", icon: <FiZap />, color: "#f59e0b" }
    ];

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>Staking Rewards</h1>
                <p style={styles.subtitle}>Stake your THON coins to secure the network and earn passive income.</p>
            </div>

            {/* Dynamic Stats Grid */}
            <div style={styles.statsGrid}>
                {stakingStats.map((stat, i) => (
                    <div key={i} style={styles.glassCard}>
                        <div style={{ ...styles.iconCircle, backgroundColor: `${stat.color}20`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={styles.statLabel}>{stat.label}</p>
                            <h3 style={styles.statValue}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div style={styles.mainGrid}>
                {/* Stake Input Area */}
                <div style={styles.actionCard}>
                    <h3 style={styles.cardTitle}>Stake Tokens</h3>
                    <div style={styles.inputGroup}>
                        <label style={styles.inputLabel}>Amount to Stake</label>
                        <div style={styles.inputWrapper}>
                            <input 
                                type="number" 
                                placeholder="0.00" 
                                value={stakedAmount}
                                onChange={(e) => setStakedAmount(e.target.value)}
                                style={styles.input} 
                            />
                            <span style={styles.inputTag}>THON</span>
                        </div>
                    </div>
                    
                    <div style={styles.lockInfo}>
                        <FiInfo size={16} />
                        <span>Tokens will be locked for 30 days minimum.</span>
                    </div>

                    <button style={styles.primaryBtn}>Confirm Staking</button>
                </div>

                {/* Rewards & Unstake Area */}
                <div style={styles.actionCard}>
                    <h3 style={styles.cardTitle}>Manage Rewards</h3>
                    <div style={styles.rewardBox}>
                        <p style={styles.rewardLabel}>Available to Claim</p>
                        <h2 style={styles.rewardAmount}>450.20 <span style={{fontSize: '14px'}}>THON</span></h2>
                        <p style={styles.rewardUsd}>≈ $4.12 USD</p>
                    </div>
                    <div style={styles.btnGroup}>
                        <button style={styles.claimBtn}>Claim Rewards</button>
                        <button style={styles.unstakeBtn}>Unstake All</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { 
        padding: '60px 40px', // Top padding barha di hy taake Navbar se distance rahay
        color: '#FFFFFF',
        maxWidth: '1300px', // Content ko center mein rakhne ke liye
        margin: '0 auto',
        minHeight: '100vh'
    },
    header: { 
        marginBottom: '40px',
        paddingLeft: '10px' 
    },
    title: { 
        fontSize: '32px', // Title thora bara kiya hy
        fontWeight: '900', 
        marginBottom: '10px',
        letterSpacing: '-1px'
    },
    subtitle: { 
        color: '#64748b', 
        fontSize: '15px',
        maxWidth: '600px'
    },
    
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)', // Auto-fit ki jagah 3 columns fix kiye hain for symmetry
        gap: '24px',
        marginBottom: '40px'
    },
    
    glassCard: {
        background: 'rgba(15, 23, 42, 0.4)', // Thora dark glass effect
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        transition: 'transform 0.3s ease'
    },

    iconCircle: {
        width: '56px', height: '56px', 
        borderRadius: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        fontSize: '24px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
    },

    statLabel: { 
        fontSize: '11px', 
        color: '#64748b', 
        marginBottom: '6px', 
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontWeight: '700'
    },
    statValue: { 
        fontSize: '26px', 
        fontWeight: '800',
        color: '#f8fafc' 
    },

    mainGrid: { 
        display: 'grid', 
        gridTemplateColumns: '1.2fr 1fr', 
        gap: '30px',
        alignItems: 'start' 
    },
    
    actionCard: {
        background: 'rgba(15, 23, 42, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '32px',
        padding: '35px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    },

    cardTitle: { 
        fontSize: '20px', 
        fontWeight: '800', 
        marginBottom: '25px',
        color: '#e2e8f0'
    },
    
    inputGroup: { marginBottom: '25px' },
    inputLabel: { 
        display: 'block', 
        fontSize: '13px', 
        color: '#94a3b8', 
        marginBottom: '12px',
        fontWeight: '600'
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    input: {
        width: '100%',
        background: '#020617', // Deep dark input background
        border: '1px solid #1e293b',
        padding: '18px',
        borderRadius: '16px',
        color: '#fff',
        fontSize: '18px',
        fontWeight: '600',
        outline: 'none',
        transition: 'border-color 0.2s',
        ":focus": { borderSecondary: '#6366f1' }
    },
    inputTag: { 
        position: 'absolute', 
        right: '20px', 
        color: '#818cf8', 
        fontWeight: '900',
        fontSize: '14px'
    },

    lockInfo: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        fontSize: '12px', 
        color: '#64748b', 
        margin: '20px 0',
        padding: '12px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '10px'
    },

    primaryBtn: {
        width: '100%', 
        padding: '18px', 
        borderRadius: '16px', 
        border: 'none',
        background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
        color: '#FFFFFF', 
        fontWeight: '800', 
        cursor: 'pointer', 
        fontSize: '16px',
        boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
        transition: 'transform 0.2s'
    },

    rewardBox: {
        background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0) 100%)',
        padding: '35px 25px', 
        borderRadius: '24px', 
        textAlign: 'center', 
        marginBottom: '30px',
        border: '1px solid rgba(99, 102, 241, 0.1)'
    },
    rewardLabel: { fontSize: '14px', color: '#94a3b8', fontWeight: '500' },
    rewardAmount: { 
        fontSize: '40px', 
        fontWeight: '900', 
        color: '#ffffff', 
        margin: '12px 0',
        textShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
    },
    rewardUsd: { 
        fontSize: '13px', 
        color: '#10b981',
        fontWeight: '700',
        background: 'rgba(16, 185, 129, 0.1)',
        padding: '4px 12px',
        borderRadius: '20px',
        display: 'inline-block'
    },

    btnGroup: { display: 'flex', gap: '15px' },
    claimBtn: { 
        flex: 1, padding: '14px', borderRadius: '14px', border: 'none',
        background: '#818cf8', color: '#FFFFFF', fontWeight: '800', cursor: 'pointer',
        fontSize: '14px'
    },
    unstakeBtn: { 
        flex: 1, padding: '14px', borderRadius: '14px', 
        border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)',
        color: '#94a3b8', fontWeight: '700', cursor: 'pointer',
        fontSize: '14px'
    }
};

export default Staking;