import React from 'react';
import { Link } from 'react-router-dom';

export default function DevProfileOverviewActions({ onFollowHint, onConnectHint }) {
  return (
    <div className="dpo-actions" role="group" aria-label="Profile actions">
      <button type="button" className="dpo-btn dpo-btn--primary" onClick={onFollowHint}>
        Follow
      </button>
      <button type="button" className="dpo-btn dpo-btn--outline" onClick={onConnectHint}>
        Connect
      </button>
      <Link to="/messages" className="dpo-btn dpo-btn--outline">
        Message
      </Link>
      <button type="button" className="dpo-btn dpo-btn--ghost" aria-label="More" onClick={onConnectHint}>
        ···
      </button>
    </div>
  );
}
