import React, { useState } from 'react';
import { FiX, FiLock, FiUser } from 'react-icons/fi';
import PasswordInput from '../../../../../components/PasswordInput';

const AddAccountModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({ type: 'JazzCash', number: '', title: '', password: '' });
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = () => {
        if (formData.number.length < 10) return;
        setIsVerifying(true);
        // Simulation: Asal mein backend se naam fetch hoga
        setTimeout(() => {
            setFormData(prev => ({ ...prev, title: "Ammad S." }));
            setIsVerifying(false);
        }, 1200);
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.glassModal}>
                <div style={styles.header}>
                    <h3 style={styles.title}>Secure Link Account</h3>
                    <button onClick={onClose} style={styles.closeBtn}><FiX /></button>
                </div>

                <div style={styles.body}>
                    <select style={styles.input} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                        <option value="JazzCash">JazzCash</option>
                        <option value="EasyPaisa">EasyPaisa</option>
                        <option value="Bank">Bank Account / IBAN</option>
                    </select>

                    <input 
                        style={styles.input} 
                        placeholder="Account Number / IBAN" 
                        onBlur={handleVerify}
                        onChange={(e) => setFormData({...formData, number: e.target.value})}
                    />

                    <div style={styles.verifyBox}>
                        <FiUser color="#10b981" />
                        <span style={{color: '#10b981'}}>{isVerifying ? "Verifying..." : (formData.title || "Auto-fetching Title...")}</span>
                    </div>

                    <div style={{position: 'relative'}}>
                        <FiLock style={styles.passIcon} />
                        <PasswordInput
                            style={{...styles.input, paddingLeft: '40px'}}
                            placeholder="Wallet Password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <button style={styles.saveBtn} onClick={() => onSave(formData)}>
                        Confirm & Attach Account
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
    glassModal: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px', width: '400px', padding: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
    title: { color: '#fff', fontSize: '18px', fontWeight: '800' },
    closeBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' },
    body: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px', color: '#fff', outline: 'none' },
    verifyBox: { background: 'rgba(16,185,129,0.05)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', border: '1px solid rgba(16,185,129,0.1)' },
    passIcon: { position: 'absolute', left: '15px', top: '18px', color: '#6366f1' },
    saveBtn: { background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }
};

export default AddAccountModal;