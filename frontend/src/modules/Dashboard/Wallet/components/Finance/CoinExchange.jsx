import React, { useState } from 'react';
import { FiArrowUpRight, FiArrowDownLeft, FiRefreshCw, FiCreditCard, FiSmartphone } from 'react-icons/fi';

const CoinExchange = () => {
    const [mode, setMode] = useState('buy'); // buy ya sell
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('jazzcash');
    
    // THON Rate (Bad mein backend se aye ga)
    const THON_RATE = 285.50; 

    const handleAction = () => {
        if(!amount) return alert("Lala, rakam likhna bhool gaye!");
        alert(`${mode === 'buy' ? 'Kharidari' : 'Farokht'} ki request bhej di gayi hy.`);
    };

    return (
        <div style={styles.exchangeCard}>
            {/* Mode Switcher */}
            <div style={styles.tabGroup}>
                <button 
                    style={{...styles.tab, borderBottom: mode === 'buy' ? '3px solid #6366f1' : 'none', color: mode === 'buy' ? '#fff' : '#64748b'}}
                    onClick={() => setMode('buy')}
                >
                    <FiArrowDownLeft /> Buy THON
                </button>
                <button 
                    style={{...styles.tab, borderBottom: mode === 'sell' ? '3px solid #f43f5e' : 'none', color: mode === 'sell' ? '#fff' : '#64748b'}}
                    onClick={() => setMode('sell')}
                >
                    <FiArrowUpRight /> Sell THON
                </button>
            </div>

            {/* Live Rate Info */}
            <div style={styles.rateInfo}>
                <FiRefreshCw size={14} color="#818cf8" />
                <span>Live Exchange Rate: <strong>1 THON = {THON_RATE} PKR</strong></span>
            </div>

            {/* Main Input Area */}
            <div style={styles.form}>
                <div style={styles.inputBox}>
                    <label style={styles.label}>{mode === 'buy' ? 'Amount to Pay (PKR)' : 'Amount to Sell (THON)'}</label>
                    <div style={styles.inputWrapper}>
                        <input 
                            type="number" 
                            placeholder="0.00" 
                            style={styles.input}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <span style={styles.unit}>{mode === 'buy' ? 'PKR' : 'THON'}</span>
                    </div>
                </div>

                <div style={styles.inputBox}>
                    <label style={styles.label}>You will {mode === 'buy' ? 'Receive' : 'Get Cash'}</label>
                    <div style={{...styles.inputWrapper, background: 'rgba(255,255,255,0.02)'}}>
                        <input 
                            type="text" 
                            readOnly 
                            style={styles.input}
                            value={mode === 'buy' ? (amount / THON_RATE).toFixed(4) : (amount * THON_RATE).toFixed(2)}
                        />
                        <span style={styles.unit}>{mode === 'buy' ? 'THON' : 'PKR'}</span>
                    </div>
                </div>

                {/* Payment Methods Selection */}
                <div style={styles.methodSection}>
                    <label style={styles.label}>Select {mode === 'buy' ? 'Payment' : 'Payout'} Method</label>
                    <div style={styles.methodGrid}>
                        <div 
                            style={{...styles.methodItem, borderColor: selectedMethod === 'jazzcash' ? '#f59e0b' : 'rgba(255,255,255,0.1)'}}
                            onClick={() => setSelectedMethod('jazzcash')}
                        >
                            <FiSmartphone color="#f59e0b" /> JazzCash
                        </div>
                        <div 
                            style={{...styles.methodItem, borderColor: selectedMethod === 'easypaisa' ? '#10b981' : 'rgba(255,255,255,0.1)'}}
                            onClick={() => setSelectedMethod('easypaisa')}
                        >
                            <FiSmartphone color="#10b981" /> EasyPaisa
                        </div>
                        <div 
                            style={{...styles.methodItem, borderColor: selectedMethod === 'bank' ? '#6366f1' : 'rgba(255,255,255,0.1)'}}
                            onClick={() => setSelectedMethod('bank')}
                        >
                            <FiCreditCard color="#6366f1" /> Bank
                        </div>
                    </div>
                </div>

                <button 
                    style={{...styles.submitBtn, background: mode === 'buy' ? '#6366f1' : '#f43f5e'}}
                    onClick={handleAction}
                >
                    {mode === 'buy' ? 'Buy THON Now' : 'Withdraw to Cash'}
                </button>
            </div>
        </div>
    );
};

const styles = {
    exchangeCard: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '32px',
        padding: '35px',
        maxWidth: '480px',
        margin: '0 auto'
    },
    tabGroup: { display: 'flex', gap: '20px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    tab: { background: 'none', border: 'none', padding: '12px 10px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' },
    rateInfo: { background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '14px', fontSize: '13px', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' },
    form: { display: 'flex', flexDirection: 'column', gap: '22px' },
    inputBox: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' },
    inputWrapper: { display: 'flex', alignItems: 'center', background: '#020617', border: '1px solid #1e293b', borderRadius: '18px', padding: '0 20px' },
    input: { background: 'none', border: 'none', color: '#fff', padding: '20px 0', flex: 1, fontSize: '18px', fontWeight: '700', outline: 'none' },
    unit: { color: '#818cf8', fontWeight: '900', fontSize: '14px' },
    methodSection: { marginTop: '10px' },
    methodGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '12px' },
    methodItem: { 
        background: 'rgba(255,255,255,0.03)', border: '2px solid transparent', padding: '15px 5px', 
        borderRadius: '16px', fontSize: '11px', textAlign: 'center', cursor: 'pointer', 
        fontWeight: '700', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: '0.3s' 
    },
    submitBtn: { width: '100%', padding: '20px', borderRadius: '20px', border: 'none', color: '#fff', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }
};

export default CoinExchange;