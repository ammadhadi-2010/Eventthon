import React, { useEffect, useMemo, useState } from 'react';
import { Check, Eye, Filter, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserManagementStats from '../UserManagement/UserManagementStats';
import { fetchUsersList, updateUserStatus } from '../../../../services/adminUserManagementService';
import '../../styles/AdminShell.css';
import '../../styles/AdminCards.css';
import '../UserManagement/userManagement.css';

const TABS = ['ALL REQUESTS', 'PENDING', 'VERIFIED', 'REJECTED'];

export default function VerificationRequestsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchUsersList({ tab: 'all', q: query, page: 1, pageSize: 100 });
        setRows(Array.isArray(data.rows) ? data.rows : []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [query]);

  const filtered = useMemo(() => {
    if (activeTab === 'ALL REQUESTS') return rows;
    if (activeTab === 'PENDING') return rows.filter((r) => r.adminStatus === 'pending');
    if (activeTab === 'VERIFIED') return rows.filter((r) => r.adminStatus === 'approved');
    return rows.filter((r) => String(r.identityStatus || '').toLowerCase() === 'rejected' || r.adminStatus === 'unverified');
  }, [activeTab, rows]);

  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((r) => r.adminStatus === 'pending').length;
    const verified = rows.filter((r) => r.adminStatus === 'approved').length;
    const rejected = rows.filter((r) => String(r.identityStatus || '').toLowerCase() === 'rejected').length;
    return [
      { id: 'total', label: 'Total Requests', value: String(total), change: '+10.5%', detail: 'vs last month', color: '#8b5cf6', icon: 'users' },
      { id: 'pending', label: 'Pending', value: String(pending), change: '+12.2%', detail: 'vs last month', color: '#f59e0b', icon: 'activity' },
      { id: 'verified', label: 'Verified', value: String(verified), change: '+20.1%', detail: 'vs last month', color: '#10b981', icon: 'badgeCheck' },
      { id: 'rejected', label: 'Rejected', value: String(rejected), change: '-6.3%', detail: 'vs last month', color: '#ef4444', icon: 'userX' },
    ];
  }, [rows]);

  const runAction = async (row, action) => {
    await updateUserStatus(row.mobile, action);
    const data = await fetchUsersList({ tab: 'all', q: query, page: 1, pageSize: 100 });
    setRows(Array.isArray(data.rows) ? data.rows : []);
  };

  return (
    <div className="um-page">
      <header className="um-header">
        <div className="um-header-copy">
          <h1 className="um-title">Verification Requests</h1>
          <p className="um-subtitle">Review and manage user verification requests.</p>
        </div>
      </header>
      <UserManagementStats stats={stats} />
      <section className="um-card">
        <div className="um-toolbar">
          <div className="um-toolbar-tabs">{TABS.map((t) => <button key={t} type="button" onClick={() => setActiveTab(t)} className={`um-tab ${activeTab === t ? 'um-tab--active' : ''}`}>{t}</button>)}</div>
          <div className="um-toolbar-actions">
            <div className="um-search"><Search size={14} className="um-search-icon" /><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search requests..." className="um-search-input" /></div>
            <button type="button" className="um-filter-btn"><Filter size={14} />Filters</button>
          </div>
        </div>
        <div className="um-table-block">
          <div className={`um-table-wrap${loading ? ' um-table-wrap--loading' : ''}`}>
            <div className="um-table-scroll">
              <table className="um-table">
                <thead><tr><th>USER</th><th>REQUEST TYPE</th><th>SUBMITTED ON</th><th>STATUS</th><th>DOCUMENTS</th><th className="um-th-actions">ACTIONS</th></tr></thead>
                <tbody>
                  {filtered.length === 0 ? <tr><td colSpan={6} className="um-table-empty">No verification requests found.</td></tr> : filtered.map((row) => (
                    <tr key={row.id}>
                      <td>{row.displayName}</td>
                      <td>{row.requestType || 'Identity Verification'}</td>
                      <td className="um-td-muted">{row.submittedOn || row.joined}</td>
                      <td><span className={`um-status-chip ${row.adminStatus === 'approved' ? 'um-status--active' : row.adminStatus === 'pending' ? 'um-status--pending' : 'um-status--deleted'}`}>{row.adminStatus === 'approved' ? 'VERIFIED' : row.adminStatus === 'pending' ? 'PENDING' : 'REJECTED'}</span></td>
                      <td className="um-td-muted">{row.documentsCount || 0} Files</td>
                      <td className="um-th-actions">
                        <div className="sdm-actions">
                          <button type="button" className="um-row-menu" onClick={() => runAction(row, 'approve_verification')} aria-label="Approve"><Check size={14} /></button>
                          <button type="button" className="um-row-menu" onClick={() => runAction(row, 'reject_verification')} aria-label="Reject"><X size={14} /></button>
                          <button
                            type="button"
                            className="um-row-menu"
                            aria-label="View"
                            onClick={() => navigate(`/admin-control/verification/${encodeURIComponent(row.mobile)}`, { state: { row } })}
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
