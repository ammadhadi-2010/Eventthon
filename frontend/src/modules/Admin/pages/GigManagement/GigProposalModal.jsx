import React from 'react';
import { X } from 'lucide-react';
import { gigAvatar } from './gigData';

export default function GigProposalModal({ open, proposal, onClose, onAccept, onReject, submitting = false }) {
  if (!open || !proposal) return null;

  const avatar = proposal.avatarUrl || gigAvatar(proposal.freelancerName);

  return (
    <div className="gp-modal-root" role="dialog" aria-modal="true" aria-label="Proposal details">
      <button type="button" className="gp-modal-backdrop" onClick={onClose} aria-label="Close" />
      <div className="gp-modal">
        <header className="gp-modal__head">
          <h3>Proposal Details</h3>
          <button type="button" className="gp-modal__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <div className="gp-modal__top">
          <div className="gp-modal__user">
            <img src={avatar} alt={proposal.freelancerName} className="gp-modal__avatar" />
            <div>
              <strong>{proposal.freelancerName}</strong>
              <span>{proposal.handle}</span>
              <p className={proposal.online ? 'gp-online' : 'gp-offline'}>{proposal.online ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <div className="gp-modal__stats">
            <div><span>Proposal Amount</span><strong>{proposal.amount}</strong></div>
            <div><span>Delivery Time</span><strong>{proposal.deliveryTime}</strong></div>
            <div><span>Status</span><strong>{proposal.status}</strong></div>
          </div>
        </div>

        <section className="gp-modal__section">
          <h4>Cover Letter</h4>
          <p>{proposal.coverLetter || 'No cover letter provided.'}</p>
        </section>

        <section className="gp-modal__section">
          <h4>Skills Demonstrated</h4>
          <div className="gd-skills">
            {(proposal.skills || []).map((skill) => (
              <span key={skill} className="um-role-pill">{skill}</span>
            ))}
          </div>
        </section>

        <section className="gp-modal__section">
          <h4>Attachments</h4>
          {(proposal.attachments || []).length === 0 ? (
            <p className="gp-empty">No attachments.</p>
          ) : (
            (proposal.attachments || []).map((file) => (
              <div key={file.id} className="gp-attach-row">
                <div>
                  <strong>{file.name}</strong>
                  <span>{file.meta}</span>
                </div>
                <a href={file.url || '#'} target="_blank" rel="noreferrer" className="gs-edit-btn">View</a>
              </div>
            ))
          )}
        </section>

        <footer className="gp-modal__actions">
          <button type="button" className="um-btn um-btn--primary gp-btn-accept" onClick={() => onAccept?.(proposal)} disabled={submitting}>
            {submitting ? 'Saving…' : 'Accept Proposal'}
          </button>
          <button type="button" className="um-btn gp-btn-reject" onClick={() => onReject?.(proposal)} disabled={submitting}>Reject Proposal</button>
          <button type="button" className="um-btn um-btn--ghost" onClick={onClose}>Close</button>
        </footer>
      </div>
    </div>
  );
}
