import React from 'react';
import { Mail, Trash2, CheckCircle2 } from 'lucide-react';

export default function LeadActionsMenu({ lead, onClose, onCompose, onStatus, onDelete }) {
  if (!lead) return null;

  return (
    <div className="eo-menu" role="menu">
      <button type="button" className="eo-modal__backdrop" aria-label="Close menu" onClick={onClose} />
      <div className="eo-menu__card">
        <p className="eo-menu__title">{lead.company}</p>
        <button type="button" className="eo-menu__item" onClick={() => { onCompose?.(lead); onClose?.(); }}>
          <Mail size={14} aria-hidden />
          Send Email
        </button>
        <button type="button" className="eo-menu__item" onClick={() => { onStatus?.(lead, 'replied'); }}>
          <CheckCircle2 size={14} aria-hidden />
          Mark Replied
        </button>
        <button type="button" className="eo-menu__item" onClick={() => { onStatus?.(lead, 'interested'); }}>
          <CheckCircle2 size={14} aria-hidden />
          Mark Interested
        </button>
        <button type="button" className="eo-menu__item eo-menu__item--danger" onClick={() => { onDelete?.(lead); }}>
          <Trash2 size={14} aria-hidden />
          Delete Lead
        </button>
      </div>
    </div>
  );
}
