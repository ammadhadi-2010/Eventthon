import React from 'react';

import { Send } from 'lucide-react';

import LeadCompanyAvatar from './LeadCompanyAvatar';

import OutreachStatusBadge from './OutreachStatusBadge';

import LeadRowActions from './LeadRowActions';



export default function LeadMobileCard({ row, onComposeLead, rowHandlers }) {

  const handlers = rowHandlers ? rowHandlers(row) : {};



  return (

    <article className="eo-mobile-card">

      <div className="eo-mobile-card__head">

        <LeadCompanyAvatar imageurl={row.imageurl} company={row.company} />

        <div className="eo-mobile-card__copy">

          <h3 className="eo-mobile-card__name">{row.company}</h3>

          <a href={`https://${row.website}`} target="_blank" rel="noreferrer" className="eo-company-cell__site">

            {row.website}

          </a>

        </div>

        <OutreachStatusBadge status={row.status} />

      </div>

      <div className="eo-mobile-card__meta">

        <div>

          <p className="eo-mobile-card__label">Contact</p>

          <a href={`mailto:${row.contactEmail}`} className="eo-contact-email">

            {row.contactEmail}

          </a>

        </div>

        <div>

          <p className="eo-mobile-card__label">Last Contact</p>

          <p className="eo-muted">{row.lastContact}</p>

        </div>

      </div>

      <div className="eo-mobile-card__actions eo-mobile-card__actions--stack">

        <button type="button" className="eo-btn eo-btn--primary eo-btn--block" onClick={() => onComposeLead?.(row)}>

          <Send size={14} aria-hidden />

          Send Email

        </button>

        <LeadRowActions {...handlers} showEmail onEmail={() => onComposeLead?.(row)} />

      </div>

    </article>

  );

}


