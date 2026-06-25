import React from 'react';
import FollowButton from './FollowButton';
import PostOptions from './PostOptions'; // Purana wala 3-dot

const UserMiniHeader = ({ name, title, time, avatar, showFollow = true, showOptions = true }) => {
  return (
    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
      <div style={avatarStyle}>{name.charAt(0)}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h4 style={nameStyle}>{name}</h4>
          {showFollow && <span style={{color: '#475569'}}>•</span>}
          {showFollow && <FollowButton />}
        </div>
        <p style={subStyle}>{title}</p>
        <p style={timeStyle}>{time}</p>
      </div>
      {showOptions && <PostOptions />}
    </div>
  );
};

const avatarStyle = { width: '35px', height: '35px', borderRadius: '8px', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px' };
const nameStyle = { fontSize: '14px', fontWeight: '700', color: 'white', margin: 0 };
const subStyle = { fontSize: '11px', color: '#94a3b8', margin: 0 };
const timeStyle = { fontSize: '10px', color: '#64748b', marginTop: '2px' };

export default UserMiniHeader;