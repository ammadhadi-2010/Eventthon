import React from 'react';
import { ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '../../../../api/axiosConfig';
import { APP_STATUS_CLASS, APP_STATUS_OPTIONS } from './jobData';

function resumeHref(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = String(API_BASE_URL || '').replace(/\/+$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

function openResume(url) {
  const href = resumeHref(url);
  if (!href) return;
  window.open(href, '_blank', 'noopener,noreferrer');
}

export default function JobApplicationsTable({ rows, loading, busyId, onStatusChange }) {
  return (
    <section className="um-card jm-main-card jm-main-card--full">
      <div className={`um-table-wrap${loading ? ' um-table-wrap--loading' : ''}`}>
        <div className="um-table-scroll">
          <table className="um-table">
            <thead>
              <tr>
                <th>APPLICANT</th>
                <th>POSITION</th>
                <th>COMPANY</th>
                <th>APPLIED DATE</th>
                <th>STATUS</th>
                <th className="um-th-actions">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="um-table-empty">
                    {loading ? 'Loading applications…' : 'No Applications Yet'}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="um-user-cell">
                        <span className="um-avatar um-avatar--text" aria-hidden>
                          {(row.applicantName || 'A').slice(0, 1).toUpperCase()}
                        </span>
                        <span className="um-name">{row.applicantName}</span>
                      </div>
                    </td>
                    <td>{row.position}</td>
                    <td>{row.company}</td>
                    <td className="um-td-muted">{row.appliedDate}</td>
                    <td>
                      <span className={`um-status-chip ${APP_STATUS_CLASS[row.status] || ''}`}>
                        {row.status
                          ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
                          : 'Applied'}
                      </span>
                    </td>
                    <td className="um-th-actions">
                      <div className="jm-app-actions">
                        <button
                          type="button"
                          className="um-btn um-btn--ghost jm-btn--sm"
                          disabled={!row.resumeUrl}
                          onClick={() => openResume(row.resumeUrl)}
                        >
                          <ExternalLink size={13} aria-hidden />
                          Resume
                        </button>
                        <select
                          className="jm-select jm-select--inline"
                          value={row.status === 'shortlisted' || row.status === 'rejected' ? row.status : 'applied'}
                          disabled={busyId === row.id}
                          aria-label={`Status for ${row.applicantName}`}
                          onChange={(e) => {
                            const next = e.target.value;
                            if (next === 'shortlisted' || next === 'rejected') {
                              onStatusChange(row.id, next);
                            }
                          }}
                        >
                          {APP_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
