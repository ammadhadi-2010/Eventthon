import React from 'react';

const ActionLinks = ({ onLike, onReply, likesCount = 0 }) => {
  return (
    <div style={container}>
      <span style={linkStyle} onClick={onLike}>Like {likesCount > 0 && `(${likesCount})`}</span>
      <span style={separator}>|</span>
      <span style={linkStyle} onClick={onReply}>Reply</span>
    </div>
  );
};

const container = { display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' };
const linkStyle = { fontSize: '12px', color: '#94a3b8', cursor: 'pointer', fontWeight: '600' };
const separator = { color: '#475569', fontSize: '12px' };

export default ActionLinks;