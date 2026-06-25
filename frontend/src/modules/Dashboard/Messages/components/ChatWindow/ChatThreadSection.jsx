import React from 'react';
import ChatMessageBubble from './ChatMessageBubble';

const ChatThreadSection = ({
  orderInfo,
  selectedMessage,
  thread,
  toAbsoluteUrl,
  onOpenOrderModal,
  onShowNotice,
  onOpenMessageMenu,
  onToggleLike,
}) => (
  <div className="msgx-chat-thread">
    <div className="msgx-chat-banner">
      <div className="msgx-chat-banner-grid">
        <div className="msgx-chat-banner-col">
          <small className="msgx-chat-banner-label">Gig</small>
          <div className="msgx-chat-banner-body">
            This is the beginning of your conversation.{' '}
            <span>{selectedMessage.chat_tag || 'Message'}</span>
          </div>
        </div>
        <div className="msgx-chat-banner-col is-order">
          <small className="msgx-chat-banner-label">Order</small>
          <div className="msgx-chat-banner-order-body">
            <small>
              {orderInfo.orderId || 'Not linked yet'} • {orderInfo.title}
            </small>
            <button
              type="button"
              onClick={() => {
                if (!orderInfo.hasOrder) {
                  onShowNotice('Order details are not linked yet.');
                  return;
                }
                onOpenOrderModal();
              }}
            >
              View Order
            </button>
          </div>
        </div>
      </div>
    </div>
    {thread.map((msg) => (
      <ChatMessageBubble
        key={msg.id}
        msg={msg}
        toAbsoluteUrl={toAbsoluteUrl}
        onOpenMessageMenu={onOpenMessageMenu}
        onToggleLike={onToggleLike}
      />
    ))}
  </div>
);

export default ChatThreadSection;
