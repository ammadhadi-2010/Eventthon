import React from 'react';
import { FiArrowLeft, FiMoreHorizontal, FiPhoneCall, FiVideo } from 'react-icons/fi';

const ChatHeader = ({
  selectedMessage,
  headerMenuOpen,
  headerMenuRef,
  onOpenAudioCall,
  onOpenVideoCall,
  onToggleHeaderMenu,
  onHeaderMenuAction,
  onBack,
}) => (
  <header className="msgx-chat-head">
    <div className="msgx-chat-head-main">
      {onBack ? (
        <button type="button" className="msgx-chat-back" onClick={onBack} aria-label="Back to conversations">
          <FiArrowLeft size={16} />
        </button>
      ) : null}
      <div>
        <h3>{selectedMessage.from_user_name || selectedMessage.from_user_id || 'Seller'}</h3>
        <small>Top Rated Seller • Online</small>
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

export default ChatHeader;
