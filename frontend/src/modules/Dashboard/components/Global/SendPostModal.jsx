import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiSearch, FiX } from 'react-icons/fi';

const SendPostModal = ({
  isOpen,
  onClose,
  users = [],
  selectedIds = [],
  search,
  onSearchChange,
  onToggleUser,
  onSend,
  onCopyLink
}) => {
  const [busy, setBusy] = useState(false);
  const title = useMemo(() => 'Send Post', []);
  if (!isOpen) return null;

  const handleSend = async () => {
    if (!selectedIds.length) return;
    setBusy(true);
    await onSend();
    setBusy(false);
  };

  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button style={styles.closeBtn} onClick={onClose}><FiX size={22} /></button>
        </div>

        <div style={styles.searchWrap}>
          <FiSearch size={16} color="#94a3b8" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            style={styles.searchInput}
          />
        </div>

        <div style={styles.list}>
          {users.map((user) => (
            <label key={user._id} style={styles.userRow}>
              <div style={styles.userInfo}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} style={styles.avatarImg} />
                ) : (
                  <div style={styles.avatarFallback}>{user.name?.charAt(0) || 'U'}</div>
                )}
                <div>
                  <p style={styles.name}>{user.name}</p>
                  <p style={styles.meta}>{user.title}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selectedIds.includes(user._id)}
                onChange={() => onToggleUser(user._id)}
                style={styles.checkbox}
              />
            </label>
          ))}
        </div>

        <div style={styles.footer}>
          <button style={styles.linkBtn} onClick={onCopyLink}>Copy link to post</button>
          <button style={{ ...styles.sendBtn, opacity: selectedIds.length ? 1 : 0.55 }} disabled={!selectedIds.length || busy} onClick={handleSend}>
            {busy ? 'Sending...' : `Send${selectedIds.length ? ` (${selectedIds.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2147483647 },
  modal: { width: '92%', maxWidth: '820px', maxHeight: '88vh', background: '#0f172a', color: '#e2e8f0', borderRadius: '12px', border: '1px solid #1f2937', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #1f2937' },
  title: { margin: 0, fontSize: '32px', color: '#f8fafc' },
  closeBtn: { border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' },
  searchWrap: { margin: '10px 14px', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px', display: 'flex', gap: '8px', alignItems: 'center', background: '#111827' },
  searchInput: { flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#e2e8f0', fontSize: '16px' },
  list: { flex: 1, overflowY: 'auto', borderTop: '1px solid #1f2937', borderBottom: '1px solid #1f2937' },
  userRow: { padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', cursor: 'pointer' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 },
  avatarImg: { width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' },
  avatarFallback: { width: '48px', height: '48px', borderRadius: '50%', background: '#1e293b', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#93c5fd', fontWeight: 700 },
  name: { margin: 0, fontSize: '20px', fontWeight: 700, color: '#f8fafc' },
  meta: { margin: '3px 0 0', color: '#94a3b8', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '540px' },
  checkbox: { width: '28px', height: '28px', accentColor: '#3b82f6' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' },
  linkBtn: { border: 'none', background: 'transparent', color: '#60a5fa', fontWeight: 600, fontSize: '18px', cursor: 'pointer' },
  sendBtn: { border: 'none', background: '#0a66c2', color: '#fff', borderRadius: '999px', padding: '10px 20px', fontWeight: 700, fontSize: '18px', cursor: 'pointer' }
};

export default SendPostModal;
