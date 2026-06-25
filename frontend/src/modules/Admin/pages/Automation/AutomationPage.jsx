import React, { useState } from 'react';
import { Download, Send, Settings } from 'lucide-react';
import AutomationStats from './AutomationStats';
import CreatePostForm from './CreatePostForm';
import RecentPostsTable from './RecentPostsTable';
import AutomationAssistant from './AutomationAssistant';
import AutomationSettingsModal from './AutomationSettingsModal';
import AutomationAllPostsView from './AutomationAllPostsView';
import AutomationHubTabs from './AutomationHubTabs';
import LeadHunter from './LeadHunter/LeadHunter';
import { useAutomation } from './useAutomation';
import '../UserManagement/userManagement.css';
import './automation.css';

export default function AutomationPage() {
  const hub = useAutomation();
  const [draftCaption, setDraftCaption] = useState('');
  const [hubTab, setHubTab] = useState('posts');

  const handleGenerate = async (text) => {
    const caption = await hub.runGenerate(text);
    if (caption) setDraftCaption(caption);
    return caption;
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ metrics: hub.metrics, posts: hub.rows }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'automation-report.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (hub.viewAll) {
    return (
      <div className="um-page auto-page w-full min-w-0">
        {hub.error ? <p className="auto-error">{hub.error}</p> : null}
        <AutomationAllPostsView
          rows={hub.rows}
          total={hub.total}
          page={hub.page}
          loading={hub.loading}
          onBack={() => hub.setViewAll(false)}
          onPageChange={hub.setPage}
          onPublish={hub.publishPost}
          onStatusChange={hub.setPostStatus}
          onDelete={hub.removePost}
        />
      </div>
    );
  }

  return (
    <div className="um-page auto-page w-full min-w-0">
      <header className="um-header">
        <div className="um-header-copy">
          <h1 className="um-title auto-title">
            <Send size={22} className="text-violet-400" aria-hidden />
            Automation
          </h1>
          <p className="um-subtitle">
            Create a post and publish it automatically across all your connected social platforms.
          </p>
        </div>
        <div className="um-header-actions">
          <button type="button" className="um-btn um-btn--ghost" onClick={handleExport}>
            <Download size={14} aria-hidden />
            Export Report
          </button>
          <button type="button" className="um-btn um-btn--primary" onClick={() => hub.setSettingsOpen(true)}>
            <Settings size={14} aria-hidden />
            Automation Settings
          </button>
        </div>
      </header>

      {hub.error ? <p className="auto-error">{hub.error}</p> : null}

      <AutomationHubTabs active={hubTab} onChange={setHubTab} />

      {hubTab === 'lead-hunter' ? (
        <LeadHunter />
      ) : (
        <>
      <AutomationStats stats={hub.stats} />

      <div className="auto-main-grid">
        <CreatePostForm
          busy={hub.busy}
          connectedPlatforms={hub.connectedPlatforms}
          caption={draftCaption}
          onCaptionChange={setDraftCaption}
          onSubmit={hub.submitPost}
        />
        <RecentPostsTable
          rows={hub.rows}
          loading={hub.loading}
          onViewAll={() => hub.setViewAll(true)}
          onPublish={hub.publishPost}
          onStatusChange={hub.setPostStatus}
          onDelete={hub.removePost}
        />
      </div>

      <AutomationAssistant busy={hub.busy} onGenerate={handleGenerate} />
        </>
      )}

      <AutomationSettingsModal
        open={hub.settingsOpen}
        busy={hub.busy}
        platforms={hub.platformSettings}
        onClose={() => hub.setSettingsOpen(false)}
        onSave={hub.saveSettings}
      />
    </div>
  );
}
