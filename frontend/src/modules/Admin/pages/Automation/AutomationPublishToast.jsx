import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

export default function AutomationPublishToast({ open, message, onClose }) {
  if (!open) return null;

  return (
    <div className="auto-publish-toast" role="alert" aria-live="polite">
      <div className="auto-publish-toast__card">
        <CheckCircle2 size={20} className="auto-publish-toast__icon" aria-hidden />
        <div className="auto-publish-toast__copy">
          <strong>Published successfully</strong>
          <p>{message || 'Your post was sent to Make.com for distribution.'}</p>
        </div>
        <button type="button" className="auto-publish-toast__close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
