import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import useUserProfileReview from './useUserProfileReview';
import UserProfileReviewDossier from './UserProfileReviewDossier';
import UserProfileReviewExperience from './UserProfileReviewExperience';
import UserProfileReviewAttachments from './UserProfileReviewAttachments';
import UserProfileReviewActions from './UserProfileReviewActions';
import { getDisplayName, isReviewableStatus, resolveUserLookup } from './userProfileReviewUtils';
import './userProfileReview.css';

export default function UserProfileReviewModal({ reviewTarget, onClose, onComplete }) {
  const lookup = reviewTarget?.lookup || resolveUserLookup(reviewTarget?.row);
  const hasTarget = Boolean(lookup);
  const { user, row, loading, error, submitting, actionError, approve, reject } = useUserProfileReview(
    reviewTarget,
    {
      onComplete: (result) => {
        onComplete?.(result);
        onClose?.();
      },
    },
  );

  useEffect(() => {
    if (!hasTarget) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !submitting) onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [hasTarget, onClose, submitting]);

  if (!hasTarget) return null;

  const canReview = isReviewableStatus(row?.adminStatus);
  const titleName = user || row ? getDisplayName(user, row) : 'User profile review';

  return createPortal(
    <div className="upr-overlay" role="presentation" onClick={() => !submitting && onClose?.()}>
      <div
        className="upr-shell upr-shell--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upr-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="upr-header">
          <div>
            <p className="upr-header__eyebrow">Profile verification review</p>
            <h2 id="upr-title" className="upr-header__title">
              {loading && !user ? 'Loading profile…' : titleName}
            </h2>
            {row?.email ? <p className="upr-header__sub">{row.email}</p> : null}
          </div>
          <button
            type="button"
            className="upr-header__close"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close review window"
          >
            <X size={20} />
          </button>
        </header>

        <div className="upr-body">
          {loading ? (
            <div className="upr-state">Loading full profile, bio, portfolio links, and verification files…</div>
          ) : (
            <>
              {error ? (
                <div className="upr-state upr-state--warn" role="status">
                  {error} Showing available row data.
                </div>
              ) : null}
              <div className="upr-split">
                <div className="upr-split__left">
                  <UserProfileReviewDossier user={user} row={row} />
                  <UserProfileReviewExperience user={user} />
                </div>
                <UserProfileReviewAttachments user={user} loading={loading} />
              </div>
            </>
          )}
        </div>

        {!loading && user ? (
          <UserProfileReviewActions
            canReview={canReview}
            submitting={submitting}
            actionError={actionError}
            onApprove={approve}
            onReject={reject}
          />
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
