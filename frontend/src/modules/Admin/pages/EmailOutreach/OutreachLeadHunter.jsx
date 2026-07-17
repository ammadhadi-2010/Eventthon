import React from 'react';
import LeadHunter from '../Automation/LeadHunter/LeadHunter';

/** Lead Hunter operator embedded inside Email Outreach workflow. */
export default function OutreachLeadHunter({ onLeadsUpdated, onComposeLead }) {
  return (
    <div className="eo-lead-hunter">
      <LeadHunter onLeadsUpdated={onLeadsUpdated} onComposeLead={onComposeLead} />
    </div>
  );
}
