import React from 'react';
import { Link } from 'react-router-dom';

export default function DevProfileOverviewFooter({ displayName }) {
  const first = displayName.split(' ')[0] || displayName;
  return (
    <footer className="dpo-footer-cta">
      <p>
        Let&apos;s work together on your next project. {first} is available for new opportunities.
      </p>
      <div className="dpo-footer-btns">
        <button type="button" className="dpo-btn-hire">
          Hire {first}
        </button>
        <Link to="/messages" className="dpo-btn-msg">
          Message
        </Link>
      </div>
    </footer>
  );
}
