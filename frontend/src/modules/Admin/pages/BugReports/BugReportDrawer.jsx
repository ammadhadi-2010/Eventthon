import React from 'react';
import { STATUS_OPTIONS } from './bugReportLabels';
import { resolveReporterImageurl } from './reporterAvatar';

export default function BugReportDrawer({
  open,
  report,
  statusDraft,
  onStatusChange,
  replyText,
  onReplyChange,
  onClose,
  onSaveStatus,
  onSendReply,
  saving,
  resolving,
}) {
  if (!open || !report) return null;

  const reporterName = report.reporter_name || 'Anonymous Reporter';
  const reporterImage = resolveReporterImageurl(report.reporter_imageurl, reporterName);
  const screenshotRaw = report.screenshot_imageurl;
  const screenshotUrl = screenshotRaw ? resolveReporterImageurl(screenshotRaw, 'SS') : '';

  return (
    <div className="abr-drawer-layer" role="presentation" onClick={onClose}>
      <aside
        className="abr-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Bug report response drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="abr-drawer__head">
          <div>
            <p>{report.report_code}</p>
            <h2>{report.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close drawer">
            ×
          </button>
        </header>

        <div className="abr-drawer__reporter">
          <img src={reporterImage} alt={`${reporterName} profile`} />
          <div>
            <strong>{reporterName}</strong>
            <span>{report.page_location || report.page_url}</span>
          </div>
        </div>

        <p className="abr-drawer__description">{report.description}</p>
        {screenshotUrl ? <img className="abr-drawer__shot" src={screenshotUrl} alt="Screenshot attachment" /> : null}

        <label className="abr-drawer__field">
          <span>Status</span>
          <select value={statusDraft} onChange={(event) => onStatusChange(event.target.value)}>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="abr-drawer__save" onClick={onSaveStatus} disabled={resolving}>
          {resolving ? 'Updating…' : 'Save Status'}
        </button>

        <label className="abr-drawer__field">
          <span>Admin Response</span>
          <textarea
            value={replyText}
            onChange={(event) => onReplyChange(event.target.value)}
            placeholder="Type your engineering resolution update for this user..."
            rows={5}
            maxLength={2000}
          />
        </label>

        <button type="button" className="abr-drawer__send" onClick={onSendReply} disabled={saving}>
          {saving ? 'Sending…' : 'Send Resolution Reply'}
        </button>
      </aside>
    </div>
  );
}
