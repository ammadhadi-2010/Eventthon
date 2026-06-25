import React, { useState } from 'react';
import { FiSend, FiUser, FiInfo, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const SendAssets = ({ userData, wallet, onTransfer, onWithdraw }) => {
    const [mode, setMode] = useState('withdraw');
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState(null); // 'success' or 'error' or null
    const [statusText, setStatusText] = useState('');

    const availableBalance = Number(wallet?.balances?.THON?.available || 0);
    const pendingBalance = Number(wallet?.balances?.THON?.pending || 0);

    const handleSend = async () => {
        if (!recipient || !amount || amount <= 0) {
            alert("Write the address and the amount!");
            return;
        }

        if (amount > availableBalance) {
            alert("Insufficient balance.");
            return;
        }

        setIsSending(true);
        setStatus(null);
        setStatusText('');

        if (mode === 'send') {
            const res = await onTransfer?.({
                toUserId: recipient.trim(),
                amount: Number(amount),
                currency: 'THON',
                note: 'Wallet send',
            });
            if (res?.status === 'success') {
                setStatus('success');
                setStatusText('Transfer completed successfully');
                setAmount('');
                setRecipient('');
            } else {
                setStatus('error');
                setStatusText(res?.message || 'Transfer failed');
            }
        } else {
            const res = await onWithdraw?.({
                amount: Number(amount),
                currency: 'THON',
                note: recipient?.trim() ? `Withdraw to: ${recipient.trim()}` : 'Wallet withdraw request',
            });
            if (res?.status === 'success') {
                setStatus('success');
                setStatusText('Withdraw request created (pending)');
                setAmount('');
            } else {
                setStatus('error');
                setStatusText(res?.message || 'Withdraw failed');
            }
        }
        setIsSending(false);
        setTimeout(() => setStatus(null), 5000);
    };

    const setMax = () => setAmount(availableBalance.toString());

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Withdrawal</h2>
                <p style={styles.subtitle}>Withdraw THON to your linked JazzCash/Bank account.</p>
            </div>

            <div style={styles.modeTabs}>
                <button style={styles.modeTab(mode === 'withdraw')} onClick={() => setMode('withdraw')}>Withdraw</button>
            </div>

            <div style={styles.sendGrid}>
                {/* Main Send Form */}
                <div style={styles.mainCard}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Withdraw Destination (Optional)</label>
                        <div style={styles.inputWrapper}>
                            <FiUser color="#818cf8" size={20} />
                            <input 
                                type="text" 
                                placeholder={'Bank / JazzCash account reference'} 
                                style={styles.input}
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label style={styles.label}>Amount</label>
                            <span style={styles.balanceHint}>Available: {availableBalance.toLocaleString()} THON</span>
                        </div>
                        <div style={styles.inputWrapper}>
                            <span style={{color: '#818cf8', fontWeight: '900', fontSize: '14px'}}>THON</span>
                            <input 
                                type="number" 
                                placeholder="0.00" 
                                style={styles.input} 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <button onClick={setMax} style={styles.maxBtn}>MAX</button>
                        </div>
                        <div style={styles.pendingText}>Pending Withdraw: {pendingBalance.toLocaleString()} THON</div>
                    </div>

                    <div style={styles.infoBox}>
                        <FiInfo size={16} color="#818cf8" />
                        <span>Withdraw processing status: <strong style={{color: '#fff'}}>Pending until review</strong></span>
                    </div>
                    {status ? (
                        <div style={styles.statusBox(status === 'success')}>
                            {statusText}
                        </div>
                    ) : null}

                    <button 
                        style={{
                            ...styles.mainSendBtn, 
                            opacity: isSending ? 0.7 : 1,
                            background: status === 'success' ? '#10b981' : '#6366f1'
                        }} 
                        onClick={handleSend}
                        disabled={isSending}
                    >
                        {isSending
                            ? "Processing..."
                            : status === 'success'
                                ? <><FiCheckCircle /> Done</>
                                : <><FiSend /> Request Withdraw</>}
                    </button>
                </div>

                {/* Safety Tips Sidebar */}
                <div style={styles.sideCard}>
                    <h4 style={styles.safetyTitle}>
                        <FiAlertCircle /> Safety Protocol
                    </h4>
                    <ul style={styles.safetyList}>
                        <li>Use your own verified JazzCash or bank account only.</li>
                        <li>Double-check account title and account number before submit.</li>
                        <li>Withdrawal requests remain pending until internal review.</li>
                    </ul>
                    <div style={styles.bankTag}>EVENTTHON SECURE NODE</div>
                </div>
            </div>
        </div>
    );
};

// --- Styles (Modern Banking UI) ---
const styles = {
    container: { padding: '10px 0', color: '#FFFFFF' },
    header: { marginBottom: '30px' },
    title: { fontSize: '32px', fontWeight: '900', color: '#FFFFFF', marginBottom: '8px' },
    subtitle: { color: '#94a3b8', fontSize: '15px' },
    modeTabs: { display: 'flex', gap: '10px', marginBottom: '18px' },
    modeTab: (active) => ({
        border: active ? '1px solid rgba(99, 102, 241, 0.65)' : '1px solid #1e293b',
        background: active ? 'rgba(99, 102, 241, 0.18)' : '#020617',
        color: active ? '#c7d2fe' : '#94a3b8',
        borderRadius: '10px',
        padding: '8px 14px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '700',
    }),
    sendGrid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px', alignItems: 'start' },
    mainCard: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '28px',
        padding: '35px',
    },
    sideCard: {
        background: 'rgba(239, 68, 68, 0.03)',
        border: '1px solid rgba(239, 68, 68, 0.1)',
        borderRadius: '28px',
        padding: '30px',
    },
    inputGroup: { marginBottom: '25px' },
    label: { display: 'block', fontSize: '12px', color: '#818cf8', marginBottom: '10px', fontWeight: '700', textTransform: 'uppercase' },
    inputWrapper: { 
        display: 'flex', alignItems: 'center', gap: '15px', background: '#020617', 
        border: '1px solid #1e293b', borderRadius: '16px', padding: '0 20px' 
    },
    input: { background: 'none', border: 'none', color: '#fff', padding: '18px 0', outline: 'none', flex: 1, fontSize: '16px', fontWeight: '600' },
    maxBtn: { background: 'rgba(99, 102, 241, 0.15)', border: 'none', color: '#818cf8', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', cursor: 'pointer' },
    balanceHint: { fontSize: '12px', color: '#94a3b8', fontWeight: '500' },
    pendingText: { fontSize: '11px', color: '#64748b', marginTop: '8px' },
    infoBox: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#94a3b8', marginBottom: '30px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' },
    statusBox: (ok) => ({ marginBottom: '14px', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', color: ok ? '#10b981' : '#ef4444', background: ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${ok ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }),
    mainSendBtn: { width: '100%', color: '#fff', border: 'none', padding: '18px', borderRadius: '18px', fontWeight: '800', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', transition: '0.3s' },
    safetyTitle: { color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '800' },
    safetyList: { paddingLeft: '20px', color: '#94a3b8', fontSize: '13px', lineHeight: '2', marginTop: '15px' },
    bankTag: { marginTop: '20px', fontSize: '10px', color: '#475569', fontWeight: '900', letterSpacing: '2px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }
};

export default SendAssets;