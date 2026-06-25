import React from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

const RepostThoughtModal = ({ isOpen, onClose, value, onChange, onSubmit, previewText, authorName }) => {
  if (!isOpen) return null;

  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.close} onClick={onClose}><FiX size={22} /></button>
        <p style={styles.heading}>What do you want to talk about?</p>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add your thoughts..."
          style={styles.input}
        />
        <div style={styles.preview}>
          <p style={styles.author}>{authorName || 'EventThon Member'}</p>
          <p style={styles.content}>{previewText || 'Original post content preview...'}</p>
        </div>
        <div style={styles.footer}>
          <button style={styles.postBtn} onClick={onSubmit}>Post</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2147483647 },
  modal: { width: '92%', maxWidth: '720px', background: '#fff', borderRadius: '14px', padding: '18px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' },
  close: { position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#374151' },
  heading: { margin: '8px 0 12px', fontSize: '34px', color: '#4b5563' },
  input: { width: '100%', minHeight: '110px', border: 'none', outline: 'none', fontSize: '22px', color: '#111827', resize: 'vertical' },
  preview: { border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px', marginTop: '10px' },
  author: { margin: 0, fontWeight: 700, fontSize: '22px', color: '#111827' },
  content: { margin: '8px 0 0', fontSize: '24px', color: '#374151' },
  footer: { marginTop: '14px', display: 'flex', justifyContent: 'flex-end' },
  postBtn: { border: 'none', borderRadius: '999px', background: '#0a66c2', color: '#fff', fontWeight: 700, fontSize: '28px', padding: '8px 24px', cursor: 'pointer' }
};

export default RepostThoughtModal;
