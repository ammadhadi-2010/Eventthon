import React, { useMemo, useState } from 'react';
import { FiArrowLeft, FiMoreHorizontal, FiPhoneCall, FiVideo } from 'react-icons/fi';
import { resolveMediaUrl } from '../../../../../components/shared/utils/resolveMediaUrl';
import { resolveSmartHeaderMeta } from './smartHeader/resolveSmartHeaderMeta';

const ChatHeader = ({
  selectedMessage,
  headerMenuOpen,
  headerMenuRef,
  onOpenAudioCall,
  onOpenVideoCall,
  onToggleHeaderMenu,
  onHeaderMenuAction,
  onBack,
}) => {
  const meta = useMemo(() => resolveSmartHeaderMeta(selectedMessage || {}), [selectedMessage]);
  const [imgFailed, setImgFailed] = useState(false);
  const avatarSrc = resolveMediaUrl(meta.avatarUrl) || '';
  const online = meta.onlineStatus === 'online';
  const away = meta.onlineStatus === 'away';

  return (
    <header className="msgx-chat-head">
      <div className="msgx-chat-head-main">
        {onBack ? (
          <button type="button" className="msgx-chat-back" onClick={onBack} aria-label="Back to conversations">
            <FiArrowLeft size={16} />
          </button>
        ) : null}
        <div className="msgx-chat-head-identity">
          <div className="msgx-chat-head-avatar-wrap">
            {avatarSrc && !imgFailed ? (
              <img
                className="msgx-chat-head-avatar"
                src={avatarSrc}
                alt=""
                onError={() => setImgFailed(true)}
              />
            ) : (
              <span className="msgx-chat-head-avatar is-fallback">
                {(meta.displayName || 'C').charAt(0).toUpperCase()}
              </span>
            )}
            <span
              className={`msgx-chat-head-presence is-${meta.onlineStatus || 'offline'}`}
              title={meta.onlineStatus || 'offline'}
              aria-label={meta.onlineStatus || 'offline'}
            />
          </div>
          <div>
            <h3>{meta.displayName || selectedMessage?.from_user_id || 'Seller'}</h3>
            <small>
              <em className={`msgx-chat-head-online is-${meta.onlineStatus || 'offline'}`}>
                {online ? 'Online' : away ? 'Away' : 'Offline'}
              </em>
              {' · '}
              {selectedMessage?.chat_tag || 'Conversation'}
              {selectedMessage?.status === 'new' ? ' · Unread' : ''}
            </small>
          </div>
        </div>
      </div>
      <div className="msgx-chat-head-actions">
        <button type="button" onClick={onOpenAudioCall}><FiPhoneCall size={13} /></button>
        <button type="button" onClick={onOpenVideoCall}><FiVideo size={13} /></button>
        <div className="msgx-head-menu-wrap" ref={headerMenuRef}>
          <button type="button" onClick={onToggleHeaderMenu}><FiMoreHorizontal size={13} /></button>
          {headerMenuOpen ? (
            <div className="msgx-head-menu" role="menu" aria-label="Chat options">
              <button
                type="button"
                className="msgx-head-menu-item"
                role="menuitem"
                onClick={() => onHeaderMenuAction('manage_conversations')}
              >
                Manage conversations
              </button>
              <button
                type="button"
                className="msgx-head-menu-item"
                role="menuitem"
                onClick={() => onHeaderMenuAction('away_message')}
              >
                Set away message
              </button>
              <button
                type="button"
                className="msgx-head-menu-item"
                role="menuitem"
                onClick={() => onHeaderMenuAction('manage_settings')}
              >
                Manage settings
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
