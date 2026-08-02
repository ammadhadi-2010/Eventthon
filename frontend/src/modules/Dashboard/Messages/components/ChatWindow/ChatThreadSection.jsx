import React from 'react';
import ChatMessageBubble from './ChatMessageBubble';
import { formatDaySeparator } from '../../utils/messagesFormat';

const ChatThreadSection = ({
  orderInfo,
  selectedMessage,
  thread,
  toAbsoluteUrl,
  onOpenOrderModal,
  onShowNotice,
  onOpenMessageMenu,
  onToggleLike,
  richStatus = false,
  peerTyping = false,
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
    {(() => {
      let lastDay = '';
      return thread.map((msg) => {
        const dayLabel = formatDaySeparator(msg.time);
        const showDay = dayLabel && dayLabel !== lastDay;
        if (showDay) lastDay = dayLabel;
        return (
          <React.Fragment key={msg.id}>
            {showDay ? (
              <div className="msgx-day-separator" role="separator">
                <span>{dayLabel}</span>
              </div>
            ) : null}
            <ChatMessageBubble
              msg={msg}
              toAbsoluteUrl={toAbsoluteUrl}
              onOpenMessageMenu={onOpenMessageMenu}
              onToggleLike={onToggleLike}
              richStatus={richStatus}
            />
          </React.Fragment>
        );
      });
    })()}
    {peerTyping ? <div className="msgx-typing-row">Typing…</div> : null}
  </div>
);

export default ChatThreadSection;
