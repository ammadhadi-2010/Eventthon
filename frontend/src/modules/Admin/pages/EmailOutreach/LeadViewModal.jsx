import React from 'react';
import LeadCompanyAvatar from './LeadCompanyAvatar';
import OutreachStatusBadge from './OutreachStatusBadge';

export default function LeadViewModal({ lead, onClose, onEdit, onCompose, onDelete }) {
  if (!lead) return null;

  return (
    <div className="eo-modal" role="dialog" aria-modal="true" aria-labelledby="eo-view-title">
      <button type="button" className="eo-modal__backdrop" aria-label="Close" onClick={onClose} />
      <div className="eo-modal__card">
        <header className="eo-modal__head">
          <div className="eo-modal__lead-head">
            <LeadCompanyAvatar imageurl={lead.imageurl} company={lead.company} />
            <div>
              <h3 id="eo-view-title" className="eo-modal__title">{lead.company}</h3>
              <a href={`https://${lead.website}`} target="_blank" rel="noreferrer" className="eo-company-cell__site">
                {lead.website}
              </a>
            </div>
          </div>
          <OutreachStatusBadge status={lead.status} />
        </header>
        <dl className="eo-detail-grid">
          <div><dt>Contact</dt><dd><a href={`mailto:${lead.contactEmail}`} className="eo-contact-email">{lead.contactEmail}</a></dd></div>
          <div><dt>Last Contact</dt><dd>{lead.lastContact}</dd></div>
          <div><dt>Category</dt><dd>{lead.category || '—'}</dd></div>
          <div><dt>Location</dt><dd>{[lead.city, lead.country].filter(Boolean).join(', ') || '—'}</dd></div>
        </dl>
        <footer className="eo-modal__actions">
          <button type="button" className="eo-btn eo-btn--primary" onClick={() => onCompose?.(lead)}>Send Email</button>
          <button type="button" className="eo-btn eo-btn--ghost" onClick={() => onEdit?.(lead)}>Edit</button>
          <button type="button" className="eo-btn eo-btn--ghost" onClick={() => onDelete?.(lead)}>Delete</button>
        </footer>
      </div>
    </div>
  );
}
