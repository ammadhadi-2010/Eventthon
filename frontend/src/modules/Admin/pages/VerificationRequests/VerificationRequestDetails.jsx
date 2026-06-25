import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Download, Eye, Mail, Phone, X } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchAdminVerificationRequest, updateUserStatus } from '../../../../services/adminUserManagementService';
import {
  buildProfileSummaryRows,
  buildVerificationAttachments,
  getDisplayName,
  getProfileAvatar,
} from '../UserManagement/userProfileReviewUtils';
import '../../styles/AdminShell.css';
import './verificationRequests.css';

const TABS = ['Submitted Documents', 'Review History', 'User Information'];

export default function VerificationRequestDetails() {
  const { mobile } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const seedRow = location.state?.row || null;
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [notes, setNotes] = useState('');
  const [actionOpen, setActionOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState({ user: null, row: seedRow, request: null, history: [] });

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchAdminVerificationRequest(decodeURIComponent(mobile || ''));
        if (!mounted) return;
        setPayload({
          user: data?.user || null,
          row: data?.row || seedRow,
          request: data?.request || null,
          history: Array.isArray(data?.history) ? data.history : [],
        });
        setNotes(data?.request?.feedback || '');
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.detail || e?.message || 'Failed to load request details.');
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [mobile, seedRow]);

  const name = getDisplayName(payload.user, payload.row);
  const avatar = getProfileAvatar(payload.user, payload.row);
  const attachments = useMemo(() => buildVerificationAttachments(payload.user || {}), [payload.user]);
  const profileRows = useMemo(() => buildProfileSummaryRows(payload.user || {}, payload.row || {}), [payload.user, payload.row]);
  const status = String(payload.request?.status || payload.user?.identity_status || payload.row?.adminStatus || 'pending').toLowerCase();

  const applyAction = async (action) => {
    setSubmitting(true);
    setError('');
    try {
      await updateUserStatus(decodeURIComponent(mobile || ''), action, notes);
      const data = await fetchAdminVerificationRequest(decodeURIComponent(mobile || ''));
      setPayload({
        user: data?.user || null,
        row: data?.row || seedRow,
        request: data?.request || null,
        history: Array.isArray(data?.history) ? data.history : [],
      });
      setNotes(data?.request?.feedback || '');
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Action failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vrd-page">
      <header className="vrd-header">
        <div>
          <h1 className="vrd-title">Verification Request Details</h1>
          <p className="vrd-breadcrumb"><Link to="/admin-control/verification">Verification Requests</Link> <span>›</span> Request Details</p>
        </div>
        <div className="vrd-actions">
          <button type="button" className="vrd-outline-btn" onClick={() => setActionOpen((v) => !v)}>
            Actions <ChevronDown size={14} />
          </button>
          {actionOpen ? (
            <div className="vrd-menu">
              <button type="button" onClick={() => applyAction('approve_verification')}>Mark as Verified</button>
              <button type="button" onClick={() => applyAction('reject_verification')}>Mark as Rejected</button>
            </div>
          ) : null}
        </div>
      </header>

      <section className="vrd-card">
        <div className="vrd-identity">
          <img src={avatar} alt={name} className="vrd-avatar" />
          <div className="vrd-user-copy">
            <h2>{name}</h2>
            <p>{payload.user?.username ? `@${payload.user.username}` : '@user'}</p>
            <p><Mail size={14} /> {payload.user?.email || payload.row?.email || 'No email'}</p>
            <p><Phone size={14} /> {payload.row?.mobile || 'No mobile'}</p>
          </div>
          <div className="vrd-meta">
            <p>Request Type <strong>{payload.request?.requestType || 'Identity Verification'}</strong></p>
            <p>Submitted On <strong>{payload.request?.submittedOn || payload.row?.joined || '—'}</strong></p>
            <p>Status <strong className={`vrd-status vrd-status--${status.includes('reject') ? 'rejected' : status.includes('approve') || status.includes('verified') ? 'verified' : 'pending'}`}>{status.includes('reject') ? 'Rejected' : status.includes('approve') || status.includes('verified') ? 'Verified' : 'Pending Review'}</strong></p>
          </div>
        </div>

        <div className="vrd-tabs">{TABS.map((tab) => <button key={tab} type="button" className={`vrd-tab ${tab === activeTab ? 'vrd-tab--active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>

        <div className="vrd-grid">
          <div className="vrd-panel">
            {activeTab === 'Submitted Documents' ? (
              attachments.length ? attachments.map((item) => (
                <div key={item.id} className="vrd-doc-row">
                  <div><p>{item.label}</p><span>{item.kind || 'file'}</span></div>
                  <a className="vrd-view-btn" href={item.url} target="_blank" rel="noreferrer"><Eye size={14} /> View</a>
                </div>
              )) : <p className="vrd-empty">No submitted documents found.</p>
            ) : activeTab === 'Review History' ? (
              payload.history.length ? payload.history.map((item) => (
                <div key={item.id} className="vrd-doc-row">
                  <div><p>{item.action.replace(/_/g, ' ')}</p><span>{item.actor} • {item.at}</span></div>
                  <span className="vrd-empty">{item.note || 'No note'}</span>
                </div>
              )) : <p className="vrd-empty">No review history yet.</p>
            ) : (
              profileRows.map((row) => <p key={row.id} className="vrd-profile-row"><span>{row.label}</span><strong>{row.value}</strong></p>)
            )}
          </div>
          <div className="vrd-panel">
            <h3>Reviewer Notes</h3>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about this verification..." className="vrd-notes" />
            <div className="vrd-decision">
              <h3>Admin Decision</h3>
              <div className="vrd-decision-row">
                <button type="button" className="vrd-approve" onClick={() => applyAction('approve_verification')} disabled={submitting}><Check size={14} />Approve</button>
                <button type="button" className="vrd-reject" onClick={() => applyAction('reject_verification')} disabled={submitting}><X size={14} />Reject</button>
              </div>
              <a className="vrd-download" href={attachments[0]?.url || '#'} target="_blank" rel="noreferrer"><Download size={14} /> Download file</a>
            </div>
            {error ? <p className="vrd-error">{error}</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
