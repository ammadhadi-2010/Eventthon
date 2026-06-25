import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Globe, ExternalLink, X } from 'lucide-react';

export default function ViewFullProfileHeroContactModal({
  open,
  onClose,
  websiteRow,
  eventthonHref,
  isProfileOwner,
}) {
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="vfph-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="vfph-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vfph-contact-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="vfph-modal__head">
          <h2 id="vfph-contact-title" className="vfph-modal__title">
            Contact info
          </h2>
          <button type="button" className="vfph-modal__close" onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <p className="vfph-modal__lead">Links from your profile and Eventthon.</p>
        <ul className="vfph-modal__links">
          <li>
            <span className="vfph-modal__link-label">Website</span>
            {websiteRow ? (
              <a
                href={websiteRow.url}
                target="_blank"
                rel="noopener noreferrer"
                className="vfph-modal__link"
              >
                <Globe size={16} strokeWidth={2} aria-hidden />
                <span className="vfph-modal__link-text">{websiteRow.label}</span>
                <ExternalLink size={14} strokeWidth={2} aria-hidden />
              </a>
            ) : (
              <span className="vfph-modal__empty">
                No website yet — add it under Social links (Website) in{' '}
                {isProfileOwner ? (
                  <Link to="/profile/edit" className="vfph-modal__inline-link">
                    Edit profile
                  </Link>
                ) : (
                  'your profile settings'
                )}
                .
              </span>
            )}
          </li>
          <li>
            <span className="vfph-modal__link-label">Eventthon profile</span>
            <a
              href={eventthonHref}
              className="vfph-modal__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="vfph-modal__link-text">Open on Eventthon</span>
              <ExternalLink size={14} strokeWidth={2} aria-hidden />
            </a>
          </li>
        </ul>
      </div>
    </div>,
    document.body,
  );
}
