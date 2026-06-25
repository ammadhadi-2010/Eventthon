import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchAdminFeedbackReports,
  resolveFeedbackReport,
  sendFeedbackReply,
  updateFeedbackStatus,
} from '../../services/adminFeedbackApi';

const DEFAULT_SUMMARY = {
  total: 0,
  new: 0,
  in_progress: 0,
  resolved: 0,
  closed: 0,
};

function mergeReportRow(existing, updated) {
  return updated ? { ...existing, ...updated } : existing;
}

export default function useAdminBugReports() {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [replyText, setReplyText] = useState('');
  const [statusDraft, setStatusDraft] = useState('New');
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', search: '' });
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [statusText, setStatusText] = useState('');

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchAdminFeedbackReports(filters);
      setReports(payload.rows);
      setSummary(payload.summary);
    } catch (error) {
      console.error('Admin feedback list failed:', error);
      setStatusText('Could not load bug reports.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const selectedReport = useMemo(
    () => reports.find((row) => row.id === selectedId) || null,
    [reports, selectedId],
  );

  const openDrawer = (reportId) => {
    const row = reports.find((item) => item.id === reportId);
    setSelectedId(reportId);
    setStatusDraft(row?.status || 'New');
    setReplyText('');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedId('');
    setReplyText('');
  };

  const patchReport = (updated) => {
    if (!updated?.id) return;
    setReports((prev) => prev.map((row) => (row.id === updated.id ? mergeReportRow(row, updated) : row)));
  };

  const submitReply = async () => {
    if (!selectedReport?.id) return;
    const message = replyText.trim();
    if (message.length < 4) {
      setStatusText('Enter a resolution message before sending.');
      return;
    }
    setSending(true);
    setStatusText('');
    try {
      const updated = await sendFeedbackReply(selectedReport.id, message);
      patchReport(updated);
      setReplyText('');
      setStatusDraft('Resolved');
      await loadReports();
      setStatusText('Reply sent. User notification delivered and report marked resolved.');
    } catch (error) {
      console.error('Feedback reply failed:', error);
      setStatusText('Could not send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const saveStatus = async () => {
    if (!selectedReport?.id || !statusDraft) return;
    setResolving(true);
    setStatusText('');
    try {
      const updated =
        statusDraft === 'Resolved'
          ? await resolveFeedbackReport(selectedReport.id)
          : await updateFeedbackStatus(selectedReport.id, statusDraft);
      patchReport(updated);
      await loadReports();
      setStatusText(
        statusDraft === 'Resolved'
          ? 'Report resolved. Resolution notification dispatched to the reporter.'
          : 'Report status updated successfully.',
      );
    } catch (error) {
      console.error('Feedback status update failed:', error);
      setStatusText('Could not update report status. Please try again.');
    } finally {
      setResolving(false);
    }
  };

  return {
    reports,
    summary,
    loading,
    filters,
    setFilters,
    drawerOpen,
    openDrawer,
    closeDrawer,
    selectedReport,
    replyText,
    setReplyText,
    statusDraft,
    setStatusDraft,
    sending,
    resolving,
    statusText,
    submitReply,
    saveStatus,
    reload: loadReports,
  };
}
