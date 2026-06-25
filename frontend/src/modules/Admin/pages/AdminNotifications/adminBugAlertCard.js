export function isBugReportAlert(item) {
  return item?.category === 'bug_report' || item?.alert_kind === 'bug_report';
}

export function formatBugReportAlertTitle(item) {
  if (!isBugReportAlert(item)) return item?.title || 'Alert';
  const issueTitle = String(item?.issue_title || '').trim();
  if (issueTitle) {
    return `New Bug Report Pending Verification: ${issueTitle}`;
  }
  return item?.title || 'New Bug Report Pending Verification';
}

export const BUG_REPORTS_PANEL_PATH = '/admin-control/bug-reports';
