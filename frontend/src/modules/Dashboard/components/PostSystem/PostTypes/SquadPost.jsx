import React from 'react';
import { FiUsers, FiHelpCircle } from 'react-icons/fi';

const SquadPost = ({ userData }) => {
  return (
    <div>
      <div style={infoAlert}>
        <FiHelpCircle /> Your question will be broadcasted to your primary squad.
      </div>
      <textarea 
        placeholder="What do you want to ask your expert network?" 
        style={textArea}
      />
      <div style={optionsRow}>
        <select style={selectInput}>
          <option>Select Squad...</option>
          <option>SEO Masters</option>
          <option>React Developers</option>
        </select>
      </div>
      <button style={postBtn}>Ask Squad</button>
    </div>
  );
};

const textArea = { width: '100%', height: '120px', background: 'transparent', border: 'none', color: '#fff', fontSize: '16px', outline: 'none', resize: 'none' };
const infoAlert = { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '12px', borderRadius: '12px', fontSize: '13px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' };
const selectInput = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '10px', width: '100%', marginBottom: '15px' };
const optionsRow = { marginTop: '10px' };
const postBtn = { width: '100%', padding: '14px', background: '#4c1d95', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '700', cursor: 'pointer' };

export default SquadPost;