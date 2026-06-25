import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import FeedbackButton from './FeedbackButton';
import AIGrowthInsights from './AIGrowthInsights';
import './floating-action-stack.css';

function isAdminPath(pathname = '') {
  return String(pathname || '').startsWith('/admin');
}

export default function FloatingActionStack({ userData }) {
  const { pathname } = useLocation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  if (isAdminPath(pathname)) {
    return null;
  }

  return (
    <>
      <div className="et-floating-stack" aria-label="Quick action controls">
        <button
          type="button"
          className="et-floating-stack__btn et-floating-stack__btn--bug"
          onClick={() => setFeedbackOpen(true)}
          aria-label="Report issue"
          title="Report Issue"
        >
          🐞
        </button>
        <AIGrowthInsights stackTrigger />
      </div>

      <FeedbackButton userData={userData} open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
