import React, { useState } from 'react';
import { FiCopy, FiCheck, FiInfo, FiExternalLink } from 'react-icons/fi';

const ReceiveAssets = () => {
    const [copied, setCopied] = useState(false);
    
    // Static address for UI - Aap ise dynamic kar sakte hain
    const walletAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

    const copyToClipboard = () => {
        navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openExplorer = () => {
        // Ye EventThon ke testnet explorer par le jaye ga
        const url = `https://explorer.eventthon.com/address/${walletAddress}`;
        window.open(url, '_blank');
    };

    const shareAddress = () => {
        if (navigator.share) {
            navigator.share({
                title: 'My ET Wallet Address',
                text: walletAddress,
            });
        } else {
            alert("Sharing not supported on this browser, use Copy instead!");
        }
    };
    
    return (
        <div style={styles.container}>
            {/* Header Section */}
            <div style={styles.header}>
                <h2 style={styles.title}>Receive Assets</h2>
                <p style={styles.subtitle}>Scan QR or copy address to receive tokens.</p>
            </div>

            {/* Stats Cards Section */}
            <div style={styles.statsGrid}>
                <div style={styles.glassCard}>
                    <span style={styles.statLabel}>Total Received</span>
                    <div style={{ ...styles.statValue, color: "#10b981" }}>1,240.50 THON</div>
                </div>
                <div style={styles.glassCard}>
                    <span style={styles.statLabel}>Last Deposit</span>
                    <div style={{ ...styles.statValue, color: "#6366f1" }}>50.00 THON</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={styles.mainGrid}>
                {/* QR Code Section */}
                <div style={styles.qrSection}>
                    <div style={styles.qrWrapper}>
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${walletAddress}`} 
                            alt="Wallet QR" 
                            style={{ borderRadius: '12px' }}
                        />
                    </div>
                    <p style={styles.qrHint}>Scan this code to pay</p>
                </div>

                {/* Address Copy Section */}
                <div style={styles.addressSection}>
                    <div style={styles.glassCard}>
                        <label style={styles.label}>Your Wallet Address</label>
                        <div style={styles.addressBox}>
                            <code style={styles.addressText}>{walletAddress}</code>
                            <button onClick={copyToClipboard} style={styles.copyBtn}>
                                {copied ? <FiCheck color="#10b981" size={20} /> : <FiCopy size={20} />}
                            </button>
                        </div>
                    </div>

                    <div style={styles.warningBox}>
                        <FiInfo size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
                        <p style={styles.warningText}>
                           Only send **EventThon Network** tokens to this address. Assets sent from another network may be subject to charges.
                        </p>
                    </div>

                    <button style={styles.explorerBtn} onClick={openExplorer}>
                      View on Explorer <FiExternalLink />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- EK HI JAGA SAARAY STYLES (PURE WHITE & GLASS) ---
const styles = {
    container: { 
        padding: '10px 0', 
        color: '#FFFFFF' 
    },
    header: { 
        marginBottom: '30px' 
    },
    title: { 
        fontSize: '32px', 
        fontWeight: '900', 
        color: '#FFFFFF', 
        marginBottom: '8px',
        letterSpacing: '-1px'
    },
    subtitle: { 
        color: '#94a3b8', 
        fontSize: '15px' 
    },
    statsGrid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '20px', 
        marginBottom: '25px' 
    },
    mainGrid: { 
        display: 'grid', 
        gridTemplateColumns: '1fr 1.5fr', 
        gap: '25px',
        alignItems: 'start'
    },
    glassCard: {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    statLabel: { 
        fontSize: '12px', 
        color: '#94a3b8', 
        fontWeight: '700',
        textTransform: 'uppercase'
    },
    statValue: { 
        fontSize: '24px', 
        fontWeight: '800' 
    },
    qrSection: {
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrWrapper: {
        background: '#FFFFFF',
        padding: '12px',
        borderRadius: '20px',
        marginBottom: '20px'
    },
    qrHint: { 
        color: '#94a3b8', 
        fontSize: '14px',
        fontWeight: '500'
    },
    addressSection: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px' 
    },
    label: { 
        fontSize: '11px', 
        color: '#818cf8', 
        textTransform: 'uppercase', 
        fontWeight: '800' 
    },
    addressBox: {
        display: 'flex',
        alignItems: 'center',
        background: '#020617',
        padding: '15px 20px',
        borderRadius: '16px',
        border: '1px solid #1e293b'
    },
    addressText: { 
        flex: 1,
        color: '#FFFFFF', 
        fontSize: '14px', 
        fontFamily: 'monospace',
        wordBreak: 'break-all'
    },
    copyBtn: {
        background: 'rgba(99, 102, 241, 0.1)',
        border: 'none',
        color: '#818cf8',
        padding: '10px',
        borderRadius: '10px',
        cursor: 'pointer',
        marginLeft: '15px',
        display: 'flex',
        alignItems: 'center'
    },
    warningBox: { 
        display: 'flex', 
        gap: '15px', 
        padding: '20px', 
        background: 'rgba(245, 158, 11, 0.05)', 
        borderRadius: '16px',
        border: '1px solid rgba(245, 158, 11, 0.1)'
    },
    warningText: { 
        fontSize: '13px', 
        color: '#f59e0b', 
        lineHeight: '1.6', 
        margin: 0 
    },
    explorerBtn: {
        background: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#94a3b8',
        padding: '15px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: '0.3s'
    }
};

export default ReceiveAssets;