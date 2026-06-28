import React from 'react';
import { useNavigate } from 'react-router-dom';
import EventThonLogo from './brand/EventThonLogo';
import '../layouts/dashboard-shell.css';

/**
 * Premium glassmorphism prompt for guests browsing the public home feed.
 */
export default function GuestLoginPromptModal({ open, onKeepBrowsing }) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="et-guest-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="guest-login-title">
      <div className="et-guest-popup et-guest-popup--premium">
        <div className="et-guest-popup__glow" aria-hidden />
        <EventThonLogo variant="feed" />
        <div className="et-guest-popup__icon" aria-hidden>
          ✨
        </div>
        <h2 id="guest-login-title">Unlock the Elite Network</h2>
        <p>
          Browse freely — then sign in to post updates, join squads, message pros, and earn on gigs.
        </p>
        <div className="et-guest-popup__actions">
          <button
            type="button"
            className="et-guest-popup__primary hover-scale"
            onClick={() => navigate('/auth/login')}
          >
            Log In
          </button>
          <button
            type="button"
            className="et-guest-popup__register"
            onClick={() => navigate('/auth/signin')}
          >
            Create Account
          </button>
          <button type="button" className="et-guest-popup__secondary" onClick={onKeepBrowsing}>
            Keep Browsing
          </button>
        </div>
      </div>
    </div>
  );
}
