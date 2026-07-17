import React from 'react';

import LeadCompanyAvatar from './LeadCompanyAvatar';

import OutreachStatusBadge from './OutreachStatusBadge';

import LeadRowActions from './LeadRowActions';



export default function LeadTableRow({ row, onView, onEdit, onMore, onEmail }) {

  return (

    <tr>

      <td>

        <label className="eo-check">

          <input type="checkbox" aria-label={`Select ${row.company}`} />

        </label>

      </td>

      <td>

        <div className="eo-company-cell">

          <LeadCompanyAvatar imageurl={row.imageurl} company={row.company} />

          <div className="eo-company-cell__copy">

            <p className="eo-company-cell__name">{row.company}</p>

            <a href={`https://${row.website}`} target="_blank" rel="noreferrer" className="eo-company-cell__site">

              {row.website}

            </a>

          </div>

        </div>

      </td>

      <td>

        <a href={`mailto:${row.contactEmail}`} className="eo-contact-email">

          {row.contactEmail}

        </a>

      </td>

      <td>

        <OutreachStatusBadge status={row.status} />

      </td>

      <td className="eo-muted">{row.lastContact}</td>

      <td className="eo-actions-col">

        <LeadRowActions onView={onView} onEdit={onEdit} onMore={onMore} onEmail={onEmail} showEmail />

      </td>

    </tr>

  );

}


