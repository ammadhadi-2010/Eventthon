import React, { useState } from 'react';
import { FiArrowUpRight, FiArrowDownRight, FiRepeat, FiShoppingCart, FiSearch, FiDownload } from 'react-icons/fi';
import { styles } from '../styles/WalletOverview.styles';
import { txStyles } from '../styles/RecentTransactions.styles';

const TRANSACTIONS_DATA = [
    { id: 1, type: 'Received THON', desc: 'From: 0xA3F5...7b2C', amount: '+500.00 THON', usd: '$4.93', date: 'May 25, 2025', time: '10:45 AM', icon: FiArrowDownRight, color: '#10b981', status: 'Completed' },
    { id: 2, type: 'Sent THON', desc: 'To: 0x85D2...9e1F', amount: '-150.00 THON', usd: '$1.48', date: 'May 24, 2025', time: '04:20 PM', icon: FiArrowUpRight, color: '#ef4444', status: 'Completed' },
    { id: 3, type: 'Converted', desc: 'THON to PKR', amount: '-200.00 THON', usd: '+PKR 57,100', date: 'May 23, 2025', time: '11:10 AM', icon: FiRepeat, color: '#f59e0b', status: 'Pending' },
    { id: 4, type: 'Buy THON', desc: 'Via JazzCash', amount: '+300.00 THON', usd: '-PKR 85,650', date: 'May 22, 2025', time: '09:30 AM', icon: FiShoppingCart, color: '#3b82f6', status: 'Completed' },
];

const TransactionHistory = ({ transactions = [], loading = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const list = transactions.length
      ? transactions.map((tx, index) => ({
          id: tx.id || index + 1,
          type: tx.type || 'Transaction',
          desc: tx.note || (tx.meta?.to_user_id ? `To: ${tx.meta.to_user_id}` : tx.meta?.from_user_id ? `From: ${tx.meta.from_user_id}` : '-'),
          amount: `${['deposit', 'transfer_in', 'escrow_release_in', 'escrow_refund'].includes(String(tx.type)) ? '+' : '-'}${Number(tx.amount || 0).toLocaleString()} ${tx.currency || 'THON'}`,
          usd: '-',
          date: tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '-',
          time: tx.created_at ? new Date(tx.created_at).toLocaleTimeString() : '-',
          icon: ['deposit', 'transfer_in', 'escrow_release_in', 'escrow_refund'].includes(String(tx.type)) ? FiArrowDownRight : FiArrowUpRight,
          color: ['deposit', 'transfer_in', 'escrow_release_in', 'escrow_refund'].includes(String(tx.type)) ? '#10b981' : '#ef4444',
          status: tx.status ? String(tx.status).charAt(0).toUpperCase() + String(tx.status).slice(1) : 'Completed',
        }))
      : TRANSACTIONS_DATA;
    const filtered = list.filter((tx) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return [tx.type, tx.desc, tx.amount, tx.date].join(' ').toLowerCase().includes(q);
    });

    return (
        <div style={styles.container}>
            {/* Header with Search & Export */}
            <div style={styles.titleRow}>
                <div>
                    <h2 style={styles.title}>Transaction History</h2>
                    <p style={styles.subtitle}>Track and manage all your on-chain activities.</p>
                </div>
                <div style={styles.titleActions}>
                    <div style={searchContainer}>
                        <FiSearch color="#94a3b8" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search hash, address..." 
                            style={searchInput}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button style={styles.outlineBtn}><FiDownload size={14} /> Export CSV</button>
                </div>
            </div>

            {/* Stats Cards (Mini) */}
            <div style={statsGrid}>
                <div style={statCard}>
                    <div style={statLabel}>Total Incoming</div>
                    <div style={{...statValue, color: '#10b981'}}>+1,250.00 THON</div>
                </div>
                <div style={statCard}>
                    <div style={statLabel}>Total Outgoing</div>
                    <div style={{...statValue, color: '#ef4444'}}>-450.00 THON</div>
                </div>
                <div style={statCard}>
                    <div style={statLabel}>Pending Transactions</div>
                    <div style={{...statValue, color: '#f59e0b'}}>1 TX</div>
                </div>
            </div>

            {/* Main Transactions Table */}
            <div style={styles.card}>
                <div style={styles.tableHead}>
                    <span style={styles.th}>Type & Description</span>
                    <span style={styles.th}>Amount (Asset)</span>
                    <span style={styles.th}>USD Value</span>
                    <span style={styles.th}>Status</span>
                    <span style={styles.th}>Date & Time</span>
                </div>

                <div style={{display: 'flex', flexDirection: 'column'}}>
                    {(loading ? [] : filtered).map((tx) => {
                        const Icon = tx.icon;
                        return (
                            <div key={tx.id} style={styles.tableRow}>
                                <div style={styles.assetCol}>
                                    <div style={{ ...txStyles.iconBox, background: `${tx.color}15`, color: tx.color }}>
                                        <Icon size={18} />
                                    </div>
                                    <div>
                                        <div style={txStyles.type}>{tx.type}</div>
                                        <div style={txStyles.desc}>{tx.desc}</div>
                                    </div>
                                </div>
                                <div style={{...styles.td, color: tx.amount.startsWith('+') ? '#10b981' : '#ffffff'}}>
                                    {tx.amount}
                                </div>
                                <div style={styles.td}>{tx.usd}</div>
                                <div style={styles.td}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '6px', fontSize: '10px',
                                        background: tx.status === 'Completed' ? '#10b98115' : '#f59e0b15',
                                        color: tx.status === 'Completed' ? '#10b981' : '#f59e0b'
                                    }}>
                                        {tx.status}
                                    </span>
                                </div>
                                <div style={txStyles.dateCol}>
                                    <div style={txStyles.date}>{tx.date}</div>
                                    <div style={txStyles.time}>{tx.time}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {loading ? <div style={{ color: '#94a3b8', padding: '14px' }}>Loading transactions...</div> : null}
                {!loading && filtered.length === 0 ? <div style={{ color: '#94a3b8', padding: '14px' }}>No transactions found.</div> : null}
            </div>
        </div>
    );
};

// Internal Styles for Transactions
const searchContainer = {
    display: 'flex', alignItems: 'center', gap: '10px', background: '#0f172a',
    border: '1px solid #1e293b', borderRadius: '10px', padding: '0 15px', width: '250px'
};
const searchInput = {
    background: 'none', border: 'none', color: '#fff', fontSize: '13px', 
    padding: '10px 0', outline: 'none', width: '100%'
};
const statsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '25px' };
const statCard = { background: '#0d1425', border: '1px solid #1e2a45', padding: '20px', borderRadius: '18px' };
const statLabel = { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' };
const statValue = { fontSize: '18px', fontWeight: '800' };

export default TransactionHistory;