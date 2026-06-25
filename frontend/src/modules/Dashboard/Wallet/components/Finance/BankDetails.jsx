import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiShield, FiSmartphone, FiCreditCard } from 'react-icons/fi';
import AddAccountModal from './AddAccountModal';

const BankDetails = ({ userData, accounts = [], onSaveAccount }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = async (formData) => {
        if (onSaveAccount) {
            await onSaveAccount(formData);
        }
        setIsModalOpen(false);
    };

    return (
        <div style={styles.container}>
            <AddAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
            
            <div style={styles.header}>
                <h3 style={styles.title}><FiShield color="#6366f1" /> Linked Accounts</h3>
                <button style={styles.addSmallBtn} onClick={() => setIsModalOpen(true)}><FiPlus /> Add</button>
            </div>

            <div style={styles.list}>
                {accounts.length > 0 ? accounts.map(acc => (
                    <div key={acc.id} style={styles.card}>
                        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                            <div style={styles.iconBox}>
                                {acc.type === 'Bank' ? <FiCreditCard /> : <FiSmartphone />}
                            </div>
                            <div>
                                <p style={styles.accTitle}>{acc.title}</p>
                                <p style={styles.accNo}>{acc.number}</p>
                            </div>
                        </div>
                        <button style={styles.delBtn}><FiTrash2 /></button>
                    </div>
                )) : (
                    <div style={styles.empty}>No linked account yet.</div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', maxWidth: '450px', margin: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { color: '#fff', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' },
    addSmallBtn: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '6px 15px', cursor: 'pointer', fontSize: '13px' },
    list: { display: 'flex', flexDirection: 'column', gap: '12px' },
    card: { background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' },
    iconBox: { background: 'rgba(255,255,255,0.05)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' },
    accTitle: { color: '#fff', fontSize: '14px', fontWeight: '700', margin: 0 },
    accNo: { color: '#64748b', fontSize: '12px', margin: 0 },
    delBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6 },
    empty: { textAlign: 'center', color: '#475569', padding: '20px', fontSize: '13px' }
};

export default BankDetails;