import React, { useState, useEffect, useRef } from 'react';
import { FiMoreVertical, FiTrash2, FiFlag, FiBellOff } from 'react-icons/fi';
import { hardDeleteFeedItem } from '../FeedSystem/feedDeleteApi';

const PostOptions = ({
  postId,
  postType = 'POST',
  onDeleted,
  userData,
  variant = 'default',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    const label = postType === 'ARTICLE' ? 'article' : 'post';
    if (!window.confirm(`Permanently delete this ${label}? This cannot be undone.`)) {
      setIsOpen(false);
      return;
    }

    setDeleting(true);
    try {
      const result = await hardDeleteFeedItem({ _id: postId, post_type: postType }, userData);
      if (result?.status === 'success') {
        if (onDeleted) onDeleted(postId);
      } else {
        alert(result?.message || 'Delete failed.');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err?.response?.data?.detail || err?.message || 'Could not delete item.');
    } finally {
      setDeleting(false);
      setIsOpen(false);
    }
  };

  const deleteLabel = postType === 'ARTICLE' ? 'Delete Article' : 'Delete Post';

  const isFeedVariant = variant === 'feed';

  return (
    <div className={isFeedVariant ? 'relative' : undefined} style={isFeedVariant ? undefined : { position: 'relative' }} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={isFeedVariant ? 'cursor-pointer border-0 bg-transparent p-0 text-sm text-slate-400 hover:text-slate-200' : undefined}
        style={isFeedVariant ? undefined : optionsBtn}
        aria-label="Post options"
      >
        <FiMoreVertical size={isFeedVariant ? 18 : 20} />
      </button>

      {isOpen && (
        <div style={dropdownMenu}>
          <button type="button" style={menuItem} onClick={() => setIsOpen(false)}>
            <FiBellOff size={14} /> Mute Post
          </button>
          <div style={divider} />
          <button
            type="button"
            style={{ ...menuItem, color: '#ef4444' }}
            onClick={handleDelete}
            disabled={deleting}
          >
            <FiTrash2 size={14} /> {deleting ? 'Deleting...' : deleteLabel}
          </button>
          <button type="button" style={menuItem} onClick={() => setIsOpen(false)}>
            <FiFlag size={14} /> Report
          </button>
        </div>
      )}
    </div>
  );
};

const optionsBtn = { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const dropdownMenu = { position: 'absolute', right: 0, top: '100%', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: '180px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', zIndex: 100, padding: '6px', marginTop: '5px' };
const menuItem = { width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'none', border: 'none', color: '#cbd5e1', fontSize: '13px', cursor: 'pointer', borderRadius: '8px', textAlign: 'left' };
const divider = { height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 0' };

export default PostOptions;
