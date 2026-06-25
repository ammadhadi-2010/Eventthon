import React, { useEffect, useRef, useState } from 'react';
import { FiClock, FiMoreHorizontal, FiStar } from 'react-icons/fi';
import { formatClock } from '../utils/messagesFormat';

const ConversationListItem = ({ item, active, onSelect, onMenuAction }) => {
  const userName = String(item.from_user_name || item.from_user_id || 'Unknown');
  const avatarChar = userName.charAt(0).toUpperCase() || 'U';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClickOutside = (event) => {
      if (!menuWrapRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const onEsc = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('mousedown', onClickOutside);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('keydown', onEsc);
    };
  }, [menuOpen]);

  const menuItems = [
    { key: 'move_other', label: 'Move to Other' },
    { key: 'label_jobs', label: 'Label as Jobs' },
    { key: 'mark_unread', label: 'Mark as unread' },
    { key: 'star', label: item.starred ? 'Unstar' : 'Star' },
    { key: 'archive', label: 'Archive' },
    { key: 'hide_report', label: 'Hide or report this ad' },
    { key: 'delete', label: 'Delete conversation' },
    { key: 'why_ad', label: 'Why am I seeing this ad?' },
  ];

  return (
    <div
      role="button"
      tabIndex={0}
      className={`msgx-item${active ? ' is-active' : ''}`}
      onClick={() => onSelect(item._id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSelect(item._id);
      }}
    >
      <div className="msgx-item-row">
        <div className="msgx-item-avatar">{avatarChar}</div>
        <div className="msgx-item-content">
          <div className="msgx-item-top">
            <h4>{userName}</h4>
            <div className="msgx-item-meta" ref={menuWrapRef}>
              <div className="msgx-item-meta-top">
                <span className="msgx-time"><FiClock size={11} /> {formatClock(item.created_at)}</span>
                <button
                  type="button"
                  className="msgx-item-more"
                  aria-label="More options"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuOpen((prev) => !prev);
                  }}
                >
                  <FiMoreHorizontal size={13} />
                </button>
              </div>
              {item.starred ? (
                <div className="msgx-item-star-under" title="Starred">
                  <FiStar size={12} className="msgx-star-icon" />
                </div>
              ) : null}
              {menuOpen ? (
                <div className="msgx-item-menu" role="menu">
                  {menuItems.map((menuItem) => (
                    <button
                      key={menuItem.key}
                      type="button"
                      className="msgx-item-menu-row"
                      onClick={(event) => {
                        event.stopPropagation();
                        setMenuOpen(false);
                        onMenuAction?.(item._id, menuItem.key);
                      }}
                    >
                      {menuItem.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <small className="msgx-item-sub">{item.chat_tag || 'Message'}</small>
          <p>{item.body || 'No message body.'}</p>
        </div>
      </div>
    </div>
  );
};

export default ConversationListItem;
