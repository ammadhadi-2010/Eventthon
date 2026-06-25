import React, { useState } from 'react';
import { CheckCircle2, MessageSquareWarning } from 'lucide-react';

export default function UserProfileReviewActions({
  canReview,
  submitting,
  actionError,
  onApprove,
  onReject,
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const resetReject = () => {
    setRejectOpen(false);
    setFeedback('');
  };

  const handleRejectSubmit = async () => {
    try {
      await onReject(feedback);
      resetReject();
    } catch {
      /* error surfaced via actionError */
    }
  };

  if (!canReview) {
    return (
      <footer className="upr-actions">
        <p className="upr-actions__readonly">This account is not pending verification review.</p>
      </footer>
    );
  }

  return (
    <footer className="upr-actions">
      {actionError ? (
        <p className="upr-actions__error" role="alert">
          {actionError}
        </p>
      ) : null}

      {!rejectOpen ? (
        <div className="upr-actions__row">
          <button
            type="button"
            className="upr-actions__btn upr-actions__btn--approve"
            disabled={submitting}
            onClick={onApprove}
          >
            <CheckCircle2 size={16} aria-hidden />
            Approve Account
          </button>
          <button
            type="button"
            className="upr-actions__btn upr-actions__btn--reject"
            disabled={submitting}
            onClick={() => setRejectOpen(true)}
          >
            <MessageSquareWarning size={16} aria-hidden />
            Reject / Request Info
          </button>
        </div>
      ) : (
        <div className="upr-actions__reject-panel">
          <label className="upr-actions__label" htmlFor="upr-feedback">
            Feedback for the user
          </label>
          <textarea
            id="upr-feedback"
            className="upr-actions__textarea"
            rows={4}
            placeholder="Describe missing documentation, unclear images, or required corrections…"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={submitting}
          />
          <div className="upr-actions__reject-row">
            <button
              type="button"
              className="upr-actions__btn upr-actions__btn--ghost"
              disabled={submitting}
              onClick={resetReject}
            >
              Cancel
            </button>
            <button
              type="button"
              className="upr-actions__btn upr-actions__btn--reject-solid"
              disabled={submitting || !feedback.trim()}
              onClick={handleRejectSubmit}
            >
              Send rejection &amp; request info
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
