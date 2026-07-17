import React, { useState } from 'react';
import CampaignDashboard from './CampaignDashboard';
import LeadsTable from './LeadsTable';
import EmailComposer from './EmailComposer';
import OutreachTemplatesList from './OutreachTemplatesList';
import OutreachConversations from './OutreachConversations';
import OutreachLeadHunter from './OutreachLeadHunter';
import OutreachAiResponder from './OutreachAiResponder';
import { OUTREACH_VIEWS } from './outreachViewTabs';
import { composeDraftFromLead } from './outreachLeadMapper';
import { OUTREACH_TEMPLATE_ITEMS } from './outreachTemplatesData';
import useOutreachTemplates from './useOutreachTemplates';
import '../UserManagement/userManagement.css';
import './emailOutreach.css';

export default function OutreachManager() {
  const [view, setView] = useState('overview');
  const [composerDraft, setComposerDraft] = useState({ to: '', subject: '', leadId: '', body: '', templateTs: 0 });
  const [leadsRefreshKey, setLeadsRefreshKey] = useState(0);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const { templates, loading: templatesLoading, saveTemplate } = useOutreachTemplates();

  const refreshOutreachData = () => {
    setLeadsRefreshKey((k) => k + 1);
    setDashboardRefreshKey((k) => k + 1);
  };

  const openComposer = (draft = {}) => {
    setComposerDraft((prev) => ({ ...prev, ...draft, templateTs: Date.now() }));
    setView('composer');
  };

  const handleComposeLead = (row) => openComposer(composeDraftFromLead(row));

  const handleSelectTemplate = (template) => {
    setComposerDraft((prev) => ({
      ...prev,
      subject: template.subject ?? prev.subject,
      body: template.body ?? prev.body,
      templateTs: template.templateTs || Date.now(),
    }));
    if (view !== 'composer') setView('composer');
  };

  const handleInsertTemplate = () => {
    const fallback = templates[0] || OUTREACH_TEMPLATE_ITEMS[0];
    handleSelectTemplate({ subject: fallback.subject, body: fallback.body });
  };

  const templateProps = {
    templates,
    loading: templatesLoading,
    onSelectTemplate: handleSelectTemplate,
    onCreateTemplate: saveTemplate,
  };

  return (
    <div className="eo-page">
      <header className="eo-manager-head">
        <div>
          <h1 className="eo-title">Email Outreach</h1>
          <p className="eo-subtitle">Campaign manager for leads, sequences, and one-to-one outreach.</p>
        </div>
        <nav className="eo-view-tabs" role="tablist" aria-label="Outreach sections">
          {OUTREACH_VIEWS.map((item) => {
            const active = item.id === view;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`eo-view-tab${active ? ' eo-view-tab--active' : ''}`}
                onClick={() => setView(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {view === 'overview' ? (
        <CampaignDashboard refreshKey={dashboardRefreshKey} onOpenComposer={() => openComposer()} templateProps={templateProps} />
      ) : null}
      {view === 'conversations' ? <OutreachConversations refreshKey={dashboardRefreshKey} /> : null}
      {view === 'leads' ? <LeadsTable key={leadsRefreshKey} onComposeLead={handleComposeLead} /> : null}
      {view === 'composer' ? (
        <div className="eo-composer-layout">
          <EmailComposer draft={composerDraft} onSent={refreshOutreachData} onSelectTemplate={handleInsertTemplate} />
          <OutreachTemplatesList {...templateProps} onViewAll={() => openComposer()} />
        </div>
      ) : null}
      {view === 'lead-hunter' ? (
        <OutreachLeadHunter onLeadsUpdated={refreshOutreachData} onComposeLead={handleComposeLead} />
      ) : null}
      {view === 'ai-responder' ? <OutreachAiResponder /> : null}
    </div>
  );
}
