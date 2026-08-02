import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiClock, FiMoreHorizontal, FiStar } from 'react-icons/fi';
import { resolveMediaUrl } from '../../../../components/shared/utils/resolveMediaUrl';
import { formatClock } from '../utils/messagesFormat';

const MENU_WIDTH = 220;
const MENU_MAX_HEIGHT = 280;

const ADMIN_FALLBACK_AVATAR = '/assets/eventthon-logo.png';

const ConversationListItem = ({ item, active, onSelect, onMenuAction, companyMode = false }) => {
  const userName = String(item.from_user_name || item.from_user_id || 'Unknown');
  const avatarChar = userName.charAt(0).toUpperCase() || 'U';
  const isAdminSupport =
    String(item.channel || '').toLowerCase() === 'admin_support' ||
    String(item.chat_type || '').toLowerCase() === 'admin_support' ||
    String(item.from_user_id || '').includes('admin-support');
  const avatarSrc =
    resolveMediaUrl(
      item.from_user_imageurl || item.avatar || item.imageurl || item.profile_image_url || '',
    ) || (isAdminSupport ? ADMIN_FALLBACK_AVATAR : '');
  const [imgFailed, setImgFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, maxHeight: MENU_MAX_HEIGHT });
  const menuWrapRef = useRef(null);
  const moreBtnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setImgFailed(false);
  }, [avatarSrc]);

  useLayoutEffect(() => {
    if (!menuOpen || !moreBtnRef.current) return undefined;
    const place = () => {
      const rect = moreBtnRef.current.getBoundingClientRect();
      const gap = 4;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const spaceAbove = rect.top - gap;
      const openUp = spaceBelow < Math.min(MENU_MAX_HEIGHT, 200) && spaceAbove > spaceBelow;
      const maxHeight = Math.max(120, Math.min(MENU_MAX_HEIGHT, openUp ? spaceAbove : spaceBelow));
      let left = rect.right - MENU_WIDTH;
      left = Math.max(8, Math.min(left, window.innerWidth - MENU_WIDTH - 8));
      const top = openUp ? Math.max(8, rect.top - gap - maxHeight) : rect.bottom + gap;
      setMenuPos({ top, left, maxHeight });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClickOutside = (event) => {
      const t = event.target;
      if (menuWrapRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setMenuOpen(false);
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

  const menuNode =
    menuOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={menuRef}
            className="msgx-item-menu msgx-item-menu--portal"
            role="menu"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              maxHeight: menuPos.maxHeight,
            }}
          >
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
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`msgx-item${active ? ' is-active' : ''}${menuOpen ? ' is-menu-open' : ''}`}
      onClick={() => onSelect(item._id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSelect(item._id);
      }}
    >
      <div className="msgx-item-row">
        <div className="msgx-item-avatar" aria-hidden="true">
          {avatarSrc && !imgFailed ? (
            <img
              src={avatarSrc}
              alt=""
              className="msgx-item-avatar-img"
              onError={() => setImgFailed(true)}
            />
          ) : (
            avatarChar
          )}
        </div>
        <div className="msgx-item-content">
          <div className="msgx-item-top">
            <h4>{userName}</h4>
            <div className="msgx-item-meta" ref={menuWrapRef}>
              <div className="msgx-item-meta-top">
                <span className="msgx-time"><FiClock size={11} /> {formatClock(item.created_at)}</span>
                <button
                  ref={moreBtnRef}
                  type="button"
                  className="msgx-item-more"
                  aria-label="More options"
                  aria-expanded={menuOpen}
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
            </div>
          </div>
          <small className="msgx-item-sub">{item.chat_tag || 'Message'}{item.hiring_stage ? ` · ${String(item.hiring_stage).replace(/_/g, ' ')}` : ''}</small>
          <p>{item.body || 'No message body.'}</p>
          {companyMode && Array.isArray(item.labels) && item.labels.length ? (
            <div className="msgx-item-labels">
              {item.labels.slice(0, 4).map((lab) => (
                <span key={lab}>{String(lab)}</span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {menuNode}
    </div>
  );
};

export default ConversationListItem;
