// ============================================
// SquadVideoArea.jsx — Sirf Video Conference Tab
// SquadCommandCenter mein use hoti hai
// ============================================

import React from 'react';
import { FiVideo } from 'react-icons/fi';

const SquadVideoArea = () => {
    return (
        <div style={{
            height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: '30px'
        }}>
            <div style={{
                width: '100%', maxWidth: '700px', height: '400px',
                background: '#000', borderRadius: '30px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: '20px',
                border: '1px solid #1e293b',
                boxShadow: 'inset 0 0 100px rgba(59, 130, 246, 0.1)'
            }}>
                <FiVideo size={60} color="#334155" />
                <p style={{ color: '#64748b' }}>Secure Video Gateway is Ready</p>
            </div>

            <button style={{
                background: '#3b82f6', color: '#fff',
                padding: '18px 50px', borderRadius: '16px', border: 'none',
                fontWeight: '800', cursor: 'pointer', fontSize: '16px',
                letterSpacing: '1px', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)'
            }}>
                Initiate Global Meeting
            </button>
        </div>
    );
};

export default SquadVideoArea;
