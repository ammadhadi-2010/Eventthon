import React, { useRef, useState } from 'react';
import { FiFileText, FiUpload, FiX } from 'react-icons/fi';

export default function JobApplyModal({ job, open, onClose, onSubmit }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!open || !job) return null;

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload your resume (PDF or Word).');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const created = await onSubmit?.(job, file);
      if (created) {
        setFile(null);
        onClose?.();
      } else {
        setError('Application failed. Sign in and try again.');
      }
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not submit application.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="jh-apply-overlay" role="dialog" aria-modal="true" aria-label="Apply for job">
      <button type="button" className="jh-apply-overlay__backdrop" onClick={onClose} aria-label="Close" />
      <div className="jh-apply-modal gigs-card">
        <header className="jh-apply-modal__head">
          <div>
            <h3>Apply for {job.role}</h3>
            <p>{job.company}</p>
          </div>
          <button type="button" className="jh-apply-modal__close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </header>
        <p className="jh-apply-modal__hint">Upload your resume to complete this application.</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="jh-apply-modal__file"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setError('');
          }}
        />
        <button type="button" className="jh-apply-modal__pick" onClick={() => inputRef.current?.click()}>
          <FiUpload size={16} aria-hidden />
          {file ? file.name : 'Choose resume file'}
        </button>
        {file ? (
          <p className="jh-apply-modal__file-meta">
            <FiFileText size={14} aria-hidden /> Ready to submit
          </p>
        ) : null}
        {error ? <p className="jh-apply-modal__error">{error}</p> : null}
        <footer className="jh-apply-modal__foot">
          <button type="button" className="ja-footer-cancel" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="jobs-alert-btn" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Submitting…' : 'Submit Application'}
          </button>
        </footer>
      </div>
    </div>
  );
}
