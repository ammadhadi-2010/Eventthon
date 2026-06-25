import React, { useState } from 'react';
import { useParams } from 'react-router-dom'; // URL se ID pakadne ke liye
import { FiSearch, FiMessageSquare, FiVideo, FiCpu, FiHash, FiMoreVertical } from 'react-icons/fi';
import {
    theme, cmdContainerStyle, cmdSidebarStyle,
    cmdTabStyle, cmdMainStyle, cmdScrollArea
} from './SquadStyles';

// Components
import SquadChatArea from './SquadChatArea';
import SquadVideoArea from './SquadVideoArea';
import SquadInputBar from './SquadInputBar';
import AiExpertWidget from './AiExpertWidget';
import SquadStatsSidebar from './components/SquadStatsSidebar'; // Sahi path

const SquadCommandCenter = ({ userData }) => {
    const { id } = useParams(); // URL se :id lega (e.g. /command-center/123)
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('chat');
    const [searchQuery, setSearchQuery] = useState('');

    // Testing ke liye dummy squad data (Baad mein API se ayega)
    const currentSquad = {
        name: id === 'seo-masters' ? 'SEO Masters' : 'PRO_DEVELOPMENT_SQUAD',
        activeMembers: 12
    };

    // Container style ko 3-column banane ke liye override (agar SquadStyles mein flex na ho)
    const mainContainerLayout = {
        ...cmdContainerStyle,
        display: 'flex',
        flexDirection: 'row',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#020617'
    };

    return (
        <div style={mainContainerLayout}>

            {/* ---- 1. LEFT SIDEBAR (Navigation) ---- */}
            <div style={{ ...cmdSidebarStyle, width: '260px', flexShrink: 0 }}>
                <div style={{ padding: '20px' }}>
                    <h3 style={{
                        color: '#475569', fontSize: '11px',
                        letterSpacing: '2px', fontWeight: '800', marginBottom: '20px'
                    }}>
                        COMMAND CENTER
                    </h3>

                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', top: '12px', left: '12px', color: '#64748b' }} />
                        <input
                            placeholder="Search in Squad..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                background: '#0f172a', border: '1px solid #1e293b',
                                padding: '10px 10px 10px 40px', borderRadius: '12px',
                                color: '#fff', fontSize: '13px', outline: 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Nav Tabs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 10px' }}>
                    <button onClick={() => setActiveTab('chat')} style={cmdTabStyle(activeTab === 'chat')}>
                        <FiMessageSquare size={18} /> Squad Chat
                    </button>
                    <button onClick={() => setActiveTab('video')} style={cmdTabStyle(activeTab === 'video')}>
                        <FiVideo size={18} /> Secure Conference
                    </button>
                    <button onClick={() => setActiveTab('ai-finder')} style={cmdTabStyle(activeTab === 'ai-finder')}>
                        <FiCpu size={18} /> AI Talent Matcher
                    </button>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <AiExpertWidget />
                </div>
            </div>

            {/* ---- 2. MAIN CONTENT (Center Chat Area) ---- */}
            <div style={{ ...cmdMainStyle, flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                
                {/* Header */}
                <div style={{
                    padding: '20px 30px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(15, 23, 42, 0.5)'
                }}>
                    <div>
                        <h4 style={{
                            color: '#fff', margin: 0, fontSize: '18px',
                            display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700'
                        }}>
                            <FiHash color={theme.accent} />
                            {currentSquad.name}
                        </h4>
                        <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '600', marginLeft: '28px' }}>
                            ● {currentSquad.activeMembers} Active Members
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', color: '#64748b' }}>
                        <FiVideo size={20} style={{ cursor: 'pointer' }} onClick={() => setActiveTab('video')} />
                        <FiMoreVertical size={20} style={{ cursor: 'pointer' }} />
                    </div>
                </div>

                {/* Scrollable Content */}
                <div style={{ ...cmdScrollArea, flex: 1 }}>
                    {activeTab === 'chat' && <SquadChatArea squadId={id} />}
                    {activeTab === 'video' && <SquadVideoArea squadId={id} />}
                    {activeTab === 'ai-finder' && (
                        <div style={{ color: '#64748b', textAlign: 'center', paddingTop: '80px' }}>
                            AI Talent Matcher — Coming Soon
                        </div>
                    )}
                </div>

                {/* Input Bar */}
                {activeTab === 'chat' && (
                    <SquadInputBar
                        message={message}
                        setMessage={setMessage}
                        squadName={currentSquad.name}
                    />
                )}
            </div>

            {/* ---- 3. RIGHT SIDEBAR (Squad Insights & Stats) ---- */}
            <SquadStatsSidebar squadId={id} />

        </div>
    );
};

export default SquadCommandCenter;