import React from 'react';
import { 
  FiUserPlus, FiCrosshair, FiShield, FiTrendingUp, 
  FiZap, FiTarget, FiCommand, FiAward, FiCpu 
} from 'react-icons/fi';

const Badges = ({ userRank = "Frontline Recruit" }) => {
  // Military Hierarchy Data
  const badgeList = [
    { 
      id: 1, 
      title: 'Frontline Recruit', 
      level: 'E-1', 
      icon: <FiUserPlus />, 
      color: '#94a3b8', 
      desc: 'Base level entry. Just joined the battlefield.' 
    },
    { 
      id: 2, 
      title: 'Tactical Operator', 
      level: 'E-3', 
      icon: <FiCrosshair />, 
      color: '#10b981', 
      desc: 'Proven skills in basic operations and tasks.' 
    },
    { 
      id: 3, 
      title: 'Squad Sergeant', 
      level: 'E-5', 
      icon: <FiShield />, 
      color: '#3b82f6', 
      desc: 'Leading small teams and verified projects.' 
    },
    { 
      id: 4, 
      title: 'Strategic Major', 
      level: 'O-4', 
      icon: <FiTarget />, 
      color: '#f59e0b', 
      desc: 'Master of coordination and high-value networking.' 
    },
    { 
      id: 5, 
      title: 'Commander', 
      level: 'O-10', 
      icon: <FiCommand />, 
      color: '#ef4444', 
      desc: 'Supreme authority. Directs the EventThon ecosystem.' 
    },
    { 
      id: 6, 
      title: 'Architect of War', 
      level: 'Legendary', 
      icon: <FiCpu />, 
      color: '#a855f7', 
      desc: 'The ultimate rank. For those who build the system itself.' 
    }
  ];

  return (
    <div style={container}>
      <div style={headerSection}>
        <h2 style={header}><FiAward /> OPERATIONAL RANK STRUCTURE</h2>
        <p style={subHeader}>Complete missions to ascend the EventThon hierarchy</p>
      </div>
      
      <div style={grid}>
        {badgeList.map((badge) => (
          <div key={badge.id} style={{
            ...badgeCard,
            border: userRank === badge.title ? `2px solid ${badge.color}` : '1px solid rgba(255,255,255,0.05)',
            boxShadow: userRank === badge.title ? `0 0 20px ${badge.color}30` : 'none',
            transform: userRank === badge.title ? 'scale(1.02)' : 'scale(1)'
          }}>
            <div style={{...iconBox, background: `${badge.color}15`, color: badge.color}}>
              {badge.icon}
            </div>
            
            <div style={content}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{...levelTag, background: `${badge.color}20`, color: badge.color}}>{badge.level}</span>
                {userRank === badge.title && <span style={activePulse}>● ACTIVE</span>}
              </div>
              <h4 style={badgeTitle}>{badge.title}</h4>
              <p style={badgeDesc}>{badge.desc}</p>
            </div>

            {/* Progress Bar (Visual Only) */}
            <div style={progressBarBg}>
                <div style={{
                    ...progressBarFill, 
                    width: userRank === badge.title ? '70%' : '0%',
                    background: badge.color
                }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- STYLES ---
const container = { padding: '40px', background: '#020617', minHeight: '100vh', color: '#fff', fontFamily: "'Inter', sans-serif" };
const headerSection = { marginBottom: '40px', borderLeft: '4px solid #ef4444', paddingLeft: '20px' };
const header = { fontSize: '28px', fontWeight: '900', margin: 0, letterSpacing: '2px' };
const subHeader = { color: '#64748b', margin: '5px 0 0 0', fontSize: '14px' };

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' };
const badgeCard = { 
  background: '#0f172a', borderRadius: '16px', padding: '25px', position: 'relative', 
  display: 'flex', flexDirection: 'column', gap: '20px', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
};

const iconBox = { width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' };
const levelTag = { fontSize: '10px', fontWeight: '900', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' };
const badgeTitle = { fontSize: '20px', fontWeight: '800', margin: '10px 0 5px 0', letterSpacing: '0.5px' };
const badgeDesc = { fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', minHeight: '40px' };

const progressBarBg = { width: '100%', height: '4px', background: '#1e293b', borderRadius: '2px', marginTop: '10px' };
const progressBarFill = { height: '100%', borderRadius: '2px', transition: 'width 1s ease-in-out' };

const activePulse = { fontSize: '10px', fontWeight: 'bold', color: '#10b981', letterSpacing: '1px' };

export default Badges;