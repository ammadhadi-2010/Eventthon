import React, { memo } from 'react';
import LeadHunterDiscoveryGrid from './LeadHunterDiscoveryGrid';
import LeadHunterPitchPanel from './LeadHunterPitchPanel';
import LeadHunterQuickForm from './LeadHunterQuickForm';
import useLeadHunter from './useLeadHunter';
import './lead-hunter.css';
import './lead-hunter-discovery.css';

function LeadHunterResults({ leads, selectedId, onSelect }) {
  if (!leads.length) return null;
  return (
    <section className="um-card lh-card lh-results">
      <h2 className="auto-card-title">Extracted Leads</h2>
      <div className="lh-results-list">
        {leads.map((lead) => (
          <button
            key={lead.id}
            type="button"
            className={`lh-result-row${selectedId === lead.id ? ' lh-result-row--active' : ''}`}
            onClick={() => onSelect(lead.id)}
          >
            <div>
              <strong>{lead.company}</strong>
              <p>{lead.email}</p>
            </div>
            <span>{Math.round((lead.confidence || 0) * 100)}% match</span>
          </button>
        ))}
      </div>
    </section>
  );
}

const MemoResults = memo(LeadHunterResults);

export default function LeadHunter() {
  const hunter = useLeadHunter();

  return (
    <div className="lh-page">
      <header className="lh-page-head">
        <div>
          <h2 className="auto-card-title">Lead Hunter Operator</h2>
          <p className="lh-card-sub">
            Built-in outreach console for EventThon Network — scrape targets and send branded pitches.
          </p>
        </div>
      </header>

      {hunter.error ? <p className="auto-error">{hunter.error}</p> : null}
      {hunter.notice ? <p className="lh-notice">{hunter.notice}</p> : null}

      <div className="lh-main-grid">
        <LeadHunterQuickForm
          form={hunter.form}
          busy={hunter.busy}
          searchBusy={hunter.searchBusy}
          websiteHighlight={hunter.websiteHighlight}
          websiteInputRef={hunter.websiteInputRef}
          onChange={hunter.patchForm}
          onCountryChange={hunter.patchCountry}
          onGoogleSearch={hunter.runGoogleSearch}
          onExtract={hunter.runExtract}
        />
        <LeadHunterPitchPanel
          pitch={hunter.pitch}
          lead={hunter.selectedLead}
          busy={hunter.busy}
          onSend={hunter.runSendPitch}
        />
      </div>

      <LeadHunterDiscoveryGrid
        rows={hunter.discoveredLinks}
        busy={hunter.searchBusy}
        onLoad={hunter.loadIntoHunter}
      />

      <MemoResults leads={hunter.leads} selectedId={hunter.selectedId} onSelect={hunter.setSelectedId} />
    </div>
  );
}
