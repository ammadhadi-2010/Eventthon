import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { submitFeedbackReport } from '../services/feedbackApi';
import { captureClientDevice, capturePageUrl } from '../utils/feedbackTelemetry';
import './feedback-button.css';

const ISSUE_TYPES = ['Bug', 'Feature request', 'Abuse', 'Payment', 'Other'];
const SUCCESS_MESSAGE =
  'Thank you for your valuable feedback! Our engineering team is looking into this to ensure absolute network stability. We appreciate your contribution to EventThon.';

export default function FeedbackButton({ userData, open = false, onClose }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [type, setType] = useState(ISSUE_TYPES[0]);
  const [description, setDescription] = useState('');
  const [imageurl, setImageurl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ tone: '', message: '' });
  const [pageUrl, setPageUrl] = useState('');
  const [clientDevice, setClientDevice] = useState(null);

  useEffect(() => {
    setPageUrl(capturePageUrl());
    setClientDevice(captureClientDevice());
  }, []);

  useEffect(() => {
    if (!imageurl) {
      setPreviewUrl('');
      return undefined;
    }
    const objectUrl = URL.createObjectURL(imageurl);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageurl]);

  const resetForm = useCallback(() => {
    setType(ISSUE_TYPES[0]);
    setDescription('');
    setImageurl(null);
    setStatus({ tone: '', message: '' });
  }, []);

  const closeModal = useCallback(() => {
    resetForm();
    onClose?.();
  }, [onClose, resetForm]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, closeModal]);

  const telemetryReady = useMemo(() => Boolean(pageUrl && clientDevice), [pageUrl, clientDevice]);

  const onScreenshotChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setImageurl(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setStatus({ tone: 'error', message: 'Please upload a valid image screenshot.' });
      return;
    }
    setImageurl(file);
    setStatus({ tone: '', message: '' });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const detail = description.trim();
    if (detail.length < 10) {
      setStatus({ tone: 'error', message: 'Please add at least 10 characters of detail.' });
      return;
    }
    setSubmitting(true);
    setStatus({ tone: '', message: '' });
    try {
      await submitFeedbackReport({
        type,
        description: detail,
        pageUrl: pageUrl || capturePageUrl(),
        clientDevice: clientDevice || captureClientDevice(),
        imageurl,
        userData,
      });
      closeModal();
      setShowSuccess(true);
      window.setTimeout(() => setShowSuccess(false), 5200);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Could not submit report. Please try again.';
      setStatus({
        tone: 'error',
        message: typeof msg === 'string' ? msg : 'Could not submit report. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open && !showSuccess) {
    return null;
  }

  return (
    <>
      {open ? (
        <div className="et-feedback-overlay" role="presentation" onClick={closeModal}>
          <form
            className="et-feedback-modal et-feedback-modal--glass"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
            onClick={(event) => event.stopPropagation()}
            onSubmit={onSubmit}
          >
            <div className="et-feedback-modal__head">
              <h2 id="feedback-modal-title">Report an Issue</h2>
              <button type="button" className="et-feedback-close" onClick={closeModal} aria-label="Close">
                ×
              </button>
            </div>

            <div className="et-feedback-field">
              <label htmlFor="feedback-type">Issue Type</label>
              <select id="feedback-type" value={type} onChange={(event) => setType(event.target.value)}>
                {ISSUE_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="et-feedback-field">
              <label htmlFor="feedback-description">Description</label>
              <textarea
                id="feedback-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Explain what happened, what you expected, and any steps to reproduce..."
                maxLength={5000}
                required
              />
            </div>

            <div className="et-feedback-field">
              <label htmlFor="feedback-screenshot">Screenshot Upload</label>
              <div className="et-feedback-upload">
                <input
                  id="feedback-screenshot"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={onScreenshotChange}
                />
                <span>{imageurl ? imageurl.name : 'Attach a screenshot (optional)'}</span>
              </div>
              {previewUrl ? (
                <img className="et-feedback-upload__preview" src={previewUrl} alt="Screenshot preview" />
              ) : null}
            </div>

            <button
              type="submit"
              className="et-feedback-submit"
              disabled={submitting || !telemetryReady}
            >
              {submitting ? 'Submitting…' : 'Submit Report'}
            </button>

            {status.message ? (
              <p className={`et-feedback-status et-feedback-status--${status.tone}`}>{status.message}</p>
            ) : null}
          </form>
        </div>
      ) : null}

      {showSuccess ? (
        <div className="et-feedback-success" role="alert" aria-live="polite">
          <div className="et-feedback-success__card">
            <h3>Feedback Received</h3>
            <p>{SUCCESS_MESSAGE}</p>
            <button type="button" onClick={() => setShowSuccess(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
