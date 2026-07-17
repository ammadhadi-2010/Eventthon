import React from 'react';

import { Eye, Mail, MoreVertical, Pencil } from 'lucide-react';



export default function LeadRowActions({ onView, onEdit, onMore, onEmail, showEmail = false }) {

  return (

    <div className="eo-row-actions">

      {showEmail ? (

        <button type="button" className="eo-icon-btn eo-icon-btn--mail" aria-label="Send email" onClick={() => onEmail?.()}>

          <Mail size={14} />

        </button>

      ) : null}

      <button type="button" className="eo-icon-btn" aria-label="View lead" onClick={() => onView?.()}>

        <Eye size={14} />

      </button>

      <button type="button" className="eo-icon-btn" aria-label="Edit lead" onClick={() => onEdit?.()}>

        <Pencil size={14} />

      </button>

      <button type="button" className="eo-icon-btn" aria-label="More options" onClick={() => onMore?.()}>

        <MoreVertical size={14} />

      </button>

    </div>

  );

}


