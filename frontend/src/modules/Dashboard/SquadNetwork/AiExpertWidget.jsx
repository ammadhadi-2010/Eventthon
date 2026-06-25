// ============================================
// AiExpertWidget.jsx — AI Matched Experts Widget
// SquadCommandCenter sidebar mein use hoti hai
// ============================================

import React from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { aiWidgetStyle, matchBadgeStyle, inviteBtnStyle } from './SquadStyles';

const AiExpertWidget = ({ experts = [] }) => {
    const defaultExperts = [
        { name: 'Alex Johnson', skill: 'Full Stack Engineer', match: '98%' },
        { name: 'Sarah Williams', skill: 'Cloud Architect', match: '95%' }
    ];

    const list = experts.length > 0 ? experts : defaultExperts;

    return (
        <div style={aiWidgetStyle}>
            <h5 style={{
                color: '#3b82f6', fontSize: '10px',
                margin: '0 0 15px 0', letterSpacing: '1.5px', fontWeight: 'bold'
            }}>
                AI MATCHED EXPERTS
            </h5>

            {list.map((ex) => (
                <div key={ex.name} style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: '12px', alignItems: 'center'
                }}>
                    <div>
                        <div style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 'bold' }}>{ex.name}</div>
                        <div style={{ color: '#64748b', fontSize: '10px' }}>{ex.skill}</div>
                    </div>
                    <span style={matchBadgeStyle}>{ex.match}</span>
                </div>
            ))}

            <button style={inviteBtnStyle}>
                <FiUserPlus /> Invite Professionals
            </button>
        </div>
    );
};

export default AiExpertWidget;
