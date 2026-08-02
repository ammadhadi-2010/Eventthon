import React from 'react';
import { FaDiscord } from 'react-icons/fa6';
import {
  FiAward, FiBookOpen, FiCalendar, FiHome, FiMessageSquare,
  FiPlus, FiUsers, FiVolume2, FiZap,
} from 'react-icons/fi';

const NAV_ICONS = {
  home: FiHome,
  chat: FiMessageSquare,
  users: FiUsers,
  calendar: FiCalendar,
  award: FiAward,
  volume: FiVolume2,
  book: FiBookOpen,
  idea: FiZap,
};

export default function CommunityLeftNav({
  nav = [],
  activeId = 'overview',
  stats = [],
  discordUrl = 'https://discord.com',
  onSelect,
  onCreatePost,
}) {
  return (
    <nav className="comm-left" aria-label="Community navigation">
      <div className="comm-left__block">
        <p className="comm-left__label">Community Menu</p>
        <ul className="comm-left__list">
          {nav.map((item) => {
            const Icon = NAV_ICONS[item.icon] || FiHome;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={activeId === item.id ? 'is-active' : ''}
                  onClick={() => onSelect?.(item.id)}
                >
                  <Icon size={14} aria-hidden />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="comm-left__block comm-left__create">
        <p className="comm-left__label">Create Something</p>
        <p className="comm-left__hint">Start a discussion, share a tip, or post an update.</p>
        <button type="button" className="comm-btn-primary" onClick={onCreatePost}>
          <FiPlus size={14} aria-hidden /> Create Post
        </button>
      </div>

      <div className="comm-left__block">
        <p className="comm-left__label">Community Stats</p>
        <ul className="comm-stats">
          {stats.map((row) => (
            <li key={row.id}>
              <span>
                {row.online ? <i className="comm-dot" aria-hidden /> : null}
                {row.label}
              </span>
              <strong>{row.value}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="comm-left__discord">
        <div className="comm-left__discord-row">
          <FaDiscord size={22} aria-hidden />
          <div>
            <strong>Join Our Discord</strong>
            <span>Chat live with the community</span>
          </div>
        </div>
        <a href={discordUrl} target="_blank" rel="noreferrer" className="comm-btn-discord">
          Join Now
        </a>
      </div>
    </nav>
  );
}
