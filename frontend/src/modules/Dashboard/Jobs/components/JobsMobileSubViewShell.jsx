import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function JobsMobileSubViewShell({ title, children }) {
  const navigate = useNavigate();

  return (
    <div className="jh-subview-shell">
      <header className="jh-mobile-subview-bar" aria-label={`${title} page`}>
        <button
          type="button"
          className="jh-mobile-subview-bar__back"
          onClick={() => navigate('/jobs', { replace: true })}
          aria-label="Back to Jobs Hub"
        >
          <FiArrowLeft size={18} aria-hidden />
        </button>
        <h1 className="jh-mobile-subview-bar__title">{title}</h1>
      </header>
      <div className="jh-mobile-subview-body">{children}</div>
    </div>
  );
}
