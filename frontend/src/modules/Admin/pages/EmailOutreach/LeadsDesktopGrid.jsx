import React from 'react';

import LeadTableRow from './LeadTableRow';



export default function LeadsDesktopGrid({ rows, loading = false, rowHandlers }) {

  if (loading) {

    return <p className="eo-empty">Loading leads…</p>;

  }



  if (!rows.length) {

    return <p className="eo-empty">No leads match your search or filter.</p>;

  }



  return (

    <div className="eo-table-wrap hidden md:block">

      <div className="eo-table-scroll scrollbar-thin">

        <table className="eo-table">

          <thead>

            <tr>

              <th aria-label="Select all">

                <label className="eo-check">

                  <input type="checkbox" aria-label="Select all leads" />

                </label>

              </th>

              <th>Company / Website</th>

              <th>Contact</th>

              <th>Status</th>

              <th>Last Contact</th>

              <th className="eo-actions-col">Actions</th>

            </tr>

          </thead>

          <tbody>

            {rows.map((row) => (

              <LeadTableRow key={row.id} row={row} {...(rowHandlers ? rowHandlers(row) : {})} />

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}


