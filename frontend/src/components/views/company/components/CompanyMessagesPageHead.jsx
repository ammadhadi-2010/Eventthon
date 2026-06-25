import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const CHANNELS = [
  { id: 'all', label: 'All threads' },
  { id: 'candidate', label: 'Candidates' },
  { id: 'admin_support', label: 'Admin support' },
];

export default function CompanyMessagesPageHead({
  channel,
  onChannelChange,
  channelBanner,
  counts = {},
}) {
  const navigate = useNavigate();

  return (
    <header className="cp-messages-page__head">
      <div className="cp-messages-page__title-row">
        <button
          type="button"
          className="cp-messages-page__back"
          onClick={() => navigate('/company/dashboard')}
          aria-label="Back to company dashboard"
        >
          <FiArrowLeft size={18} aria-hidden />
        </button>
        <div className="cp-messages-page__title-copy">
          <h1>Company messages</h1>
          <p>{channelBanner}</p>
        </div>
      </div>
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
