import React from 'react';
import { FiEdit2, FiRepeat } from 'react-icons/fi';

const RepostMenu = ({ isOpen, onRepostWithThoughts, onQuickRepost }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.menu}>
      <button style={styles.item} onClick={onRepostWithThoughts}>
        <FiEdit2 size={18} />
        <div>
          <p style={styles.title}>Repost with your thoughts</p>
          <p style={styles.sub}>Create a new post with caption</p>
        </div>
      </button>
      <button style={styles.item} onClick={onQuickRepost}>
        <FiRepeat size={18} />
        <div>
          <p style={styles.title}>Repost</p>
          <p style={styles.sub}>Instantly share to feed</p>
        </div>
      </button>
    </div>
  );
};

const styles = {
  menu: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '330px',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)',
    zIndex: 200
  },
  item: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    padding: '12px 14px',
    cursor: 'pointer',
    textAlign: 'left'
  },
  title: { margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' },
  sub: { margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }
};

export default RepostMenu;
