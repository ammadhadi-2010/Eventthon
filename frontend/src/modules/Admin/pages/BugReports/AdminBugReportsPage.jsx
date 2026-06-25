import React from 'react';
import useAdminBugReports from './useAdminBugReports';
import BugReportsMetrics from './BugReportsMetrics';
import BugReportsFilters from './BugReportsFilters';
import BugReportsTable from './BugReportsTable';
import BugReportDrawer from './BugReportDrawer';
import './admin-bug-reports.css';
import './admin-bug-drawer.css';

export default function AdminBugReportsPage() {
  const state = useAdminBugReports();

  return (
    <div className="admin-bug-reports admin-panel">
      <header className="abr-head">
        <div>
          <h1>Bug Reports Management</h1>
          <p>Monitor user feedback, triage priorities, and close the loop with live notifications.</p>
        </div>
      </header>

      <BugReportsMetrics summary={state.summary} />
      <BugReportsFilters filters={state.filters} onChange={state.setFilters} />

      {state.statusText ? <p className="abr-status">{state.statusText}</p> : null}

      <BugReportsTable rows={state.reports} loading={state.loading} onOpen={state.openDrawer} />

      <BugReportDrawer
        open={state.drawerOpen}
        report={state.selectedReport}
        statusDraft={state.statusDraft}
        onStatusChange={state.setStatusDraft}
        replyText={state.replyText}
        onReplyChange={state.setReplyText}
        onClose={state.closeDrawer}
        onSaveStatus={state.saveStatus}
        onSendReply={state.submitReply}
        saving={state.sending}
        resolving={state.resolving}
      />
    </div>
  );
}
