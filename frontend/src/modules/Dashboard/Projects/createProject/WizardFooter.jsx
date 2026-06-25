import React from 'react';
import { FiArrowRight } from 'react-icons/fi';

export default function WizardFooter({ step, totalSteps, onSaveDraft, onCancel, onBack, onNext }) {
  const isLast = step >= totalSteps;

  return (
    <footer className="cp-footer">
      <button type="button" className="cp-btn cp-btn--ghost cp-footer__draft" onClick={onSaveDraft}>
        Save as Draft
      </button>
      <div className="cp-footer__right">
        <button type="button" className="cp-btn cp-btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        {step > 1 ? (
          <button type="button" className="cp-btn cp-btn--ghost" onClick={onBack}>
            Back
          </button>
        ) : null}
        <button type="button" className="cp-btn cp-btn--primary" onClick={onNext}>
          {isLast ? 'Publish Project' : 'Next Step'}
          {!isLast ? <FiArrowRight size={16} aria-hidden /> : null}
        </button>
      </div>
    </footer>
  );
}
