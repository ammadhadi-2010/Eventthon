import React from 'react';
import { FiX } from 'react-icons/fi';

/** Report modal only — gig inquire routes straight to Messages (beta). */
const GigExplorerModals = ({
  reportModalOpen,
  setReportModalOpen,
  reportDraft,
  setReportDraft,
  reportSending,
  submitReportFromModal,
}) => {
  if (!reportModalOpen) return null;

  return (
    <div className="gigx-modal-overlay" role="presentation" onClick={() => !reportSending && setReportModalOpen(false)}>
      <div
        className="gigx-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gigx-report-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="gigx-modal-head">
          <h3 id="gigx-report-title">Report this gig</h3>
          <button
            type="button"
            className="gigx-modal-close"
            aria-label="Close"
            disabled={reportSending}
            onClick={() => setReportModalOpen(false)}
          >
            <FiX size={18} />
          </button>
        </div>
        <p className="gigx-modal-lead">Tell us what is wrong. Our team reviews reports.</p>
        <label className="gigx-modal-label" htmlFor="gigx-report-body">Details</label>
        <textarea
          id="gigx-report-body"
          className="gigx-modal-textarea"
          rows={5}
          value={reportDraft}
          placeholder="e.g. misleading description, spam, policy violation…"
          onChange={(event) => setReportDraft(event.target.value)}
          maxLength={2000}
          disabled={reportSending}
        />
        <div className="gigx-modal-actions">
          <button type="button" className="gigx-modal-btn ghost" disabled={reportSending} onClick={() => setReportModalOpen(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="gigx-modal-btn primary"
            disabled={reportSending || reportDraft.trim().length < 10}
            onClick={submitReportFromModal}
          >
            {reportSending ? 'Submitting…' : 'Submit report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GigExplorerModals;
