import React from 'react';

import LeadMobileCard from './LeadMobileCard';



export default function LeadsMobileList({ rows, loading = false, onComposeLead, rowHandlers }) {

  if (loading) {

    return <p className="eo-empty md:hidden">Loading leads…</p>;

  }



  if (!rows.length) {

    return <p className="eo-empty md:hidden">No leads match your search or filter.</p>;

  }



  return (

    <div className="eo-mobile-list md:hidden">

      {rows.map((row) => (

        <LeadMobileCard key={row.id} row={row} onComposeLead={onComposeLead} rowHandlers={rowHandlers} />

      ))}

    </div>

  );

}


