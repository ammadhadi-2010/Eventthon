import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';

const CHANNELS = [
  { id: 'all', label: 'All threads' },
  { id: 'candidate', label: 'Candidates' },
  { id: 'admin_support', label: 'Admin support' },
];

export default function CompanyMessagesPageHead({
  channel,
  onChannelChange,
  counts = {},
  inChat = false,
  onBack,
}) {
  return (
    <header
      className={`cp-messages-page__head cp-messages-page__head--compact${
        inChat ? ' cp-messages-page__head--in-chat' : ''
      }`}
    >
      <button
        type="button"
        className="cp-messages-page__back"
        onClick={onBack}
        aria-label={inChat ? 'Back to conversations' : 'Back to company dashboard'}
      >
        <FiArrowLeft size={16} aria-hidden />
      </button>
      <div className="cp-messages-page__channels" role="tablist" aria-label="Message channels">
        {CHANNELS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={channel === tab.id}
            className={`cp-messages-page__tab${channel === tab.id ? ' cp-messages-page__tab--active' : ''}`}
            onClick={() => onChannelChange(tab.id)}
          >
            {tab.label}
            <span className="cp-messages-page__count">
              {tab.id === 'all'
                ? (counts.candidate || 0) + (counts.admin_support || 0)
                : counts[tab.id] || 0}
            </span>
          </button>
        ))}
      </div>
    </header>
  );
}
