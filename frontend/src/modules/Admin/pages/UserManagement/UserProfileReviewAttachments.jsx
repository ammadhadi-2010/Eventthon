import React from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { buildVerificationAttachments } from './userProfileReviewUtils';

function isImageUrl(url) {
  return /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url) || url.startsWith('data:image');
}

export default function UserProfileReviewAttachments({ user, loading }) {
  const attachments = buildVerificationAttachments(user);
  const identityStatus = user?.identity_status || 'Unknown';

  if (!attachments.length) {
    return (
      <section className="upr-attachments upr-attachments--empty" aria-label="Verification attachments">
        <h3 className="upr-attachments__title">Verification attachments</h3>
        <p className="upr-attachments__hint">Identity status: {identityStatus}</p>
        <div className="upr-attachments__placeholder">
          <FileText size={32} strokeWidth={1.5} aria-hidden />
          <p>No qualification or identity files were submitted yet.</p>
          {loading ? <p className="upr-attachments__loading">Checking for uploaded files…</p> : null}
        </div>
      </section>
    );
  }

  return (
    <section className="upr-attachments" aria-label="Verification attachments">
      <h3 className="upr-attachments__title">Verification attachments</h3>
      <p className="upr-attachments__hint">
        {attachments.length} file(s) · Identity status: {identityStatus}
      </p>
      <div className="upr-attachments__grid">
        {attachments.map((item) => {
          const showImage = item.kind === 'image' || isImageUrl(item.url);
          return (
            <article key={item.id} className="upr-attachment-card">
              <div className="upr-attachment-card__preview">
                {showImage ? (
                  <img src={item.url} alt={item.label} loading="lazy" />
                ) : (
                  <div className="upr-attachment-card__doc">
                    <FileText size={28} strokeWidth={1.5} aria-hidden />
                    <span>Document preview</span>
                  </div>
                )}
                <span className="upr-attachment-card__label">{item.label}</span>
              </div>
              <div className="upr-attachment-card__actions">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="upr-attachment-card__btn"
                >
                  <ExternalLink size={14} aria-hidden />
                  Open full size
                </a>
                <a href={item.url} download className="upr-attachment-card__btn upr-attachment-card__btn--ghost">
                  <Download size={14} aria-hidden />
                  Download
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
