import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronRight, Crown, Edit3, MoreVertical } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  fetchAdminRankDetail,
  saveAdminRank,
  updateAdminRankStatus,
} from '../../../../services/adminRankService';
import RankFormModal from './RankFormModal';
import RankBadgeViewport from './RankBadgeViewport';
import './rank-matrix.css';
import '../UserManagement/userManagement.css';
import './rankDetails.css';

const TABS = ['Overview', 'Users', 'Permissions', 'Requirements'];

export default function RankDetails() {
  const { rankId } = useParams();
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const apiRank = await fetchAdminRankDetail(rankId);
        setRank(apiRank);
        if (!apiRank) setNotFound(true);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [rankId]);

  const benefits = useMemo(
    () => [rank?.benefits, 'Access to advanced features', 'Can create private squads', 'Higher visibility in search', 'Custom profile badge'].filter(Boolean),
    [rank],
  );

  if (!loading && (notFound || !rank)) return <Navigate to="/admin-control/ranks" replace />;

  const safeRank = rank || {
    name: '',
    icon: '⭐',
    status: 'active',
    minPoints: 0,
    users: 0,
    createdOn: '—',
    updatedOn: '—',
    requirements: { completedProjects: 0, successRate: '0%', positiveReviews: 0, accountAge: '0 Days' },
  };

  const setStatus = async (status) => {
    try {
      const updated = await updateAdminRankStatus(rankId, status);
      if (updated) setRank(updated);
    } catch {
      setRank((prev) => ({ ...prev, status, updatedOn: new Date().toISOString().slice(0, 10) }));
    }
    setActionsOpen(false);
  };

  const handleSave = async (form) => {
    try {
      const updated = await saveAdminRank(rankId, form);
      setRank(updated || { ...rank, ...form });
    } catch {
      setRank((prev) => ({ ...prev, ...form }));
    }
    setEditOpen(false);
  };

  return (
    <div className="um-page">
      <header className="um-header">
        <div className="um-header-copy">
          <h1 className="um-title">Rank Details</h1>
          <p className="rd-breadcrumb"><Link to="/admin-control/ranks">Rank Management</Link><ChevronRight size={13} /><span>Rank Details</span></p>
        </div>
        <div className="um-header-actions">
          <button type="button" className="um-btn um-btn--ghost" onClick={() => setEditOpen(true)} disabled={loading}><Edit3 size={14} />Edit Rank</button>
          <div className="rd-actions-wrap">
            <button type="button" className="um-btn um-btn--ghost" onClick={() => setActionsOpen((v) => !v)} disabled={loading}>Actions<MoreVertical size={14} /></button>
            {actionsOpen ? (
              <div className="rd-actions-menu">
                <button type="button" onClick={() => setStatus('active')}>Mark Active</button>
                <button type="button" onClick={() => setStatus('inactive')}>Mark Inactive</button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <section className={`rd-top-grid${loading ? ' gs-card--loading' : ''}`}>
        <article className="rd-card">
          <div className="rd-rank-head">
            <RankBadgeViewport row={safeRank} size="lg" />
            <div>
              <h2>{safeRank.name}</h2>
              <span className={`um-status-chip ${safeRank.status === 'active' ? 'um-status--active' : 'um-status--unverified'}`}>{safeRank.status.toUpperCase()}</span>
              <p>For skilled professionals with proven experience.</p>
            </div>
          </div>
          <div className="rd-points">
            <Crown size={16} />
            <div><strong>{safeRank.minPoints.toLocaleString()}</strong><span>Min Points Required</span></div>
          </div>
        </article>

        <article className="rd-card">
          <h3>Rank Benefits</h3>
          <ul className="rd-check-list">
            {benefits.map((item) => <li key={item}><Check size={14} />{item}</li>)}
          </ul>
        </article>
      </section>

      <section className="um-card">
        <div className="um-toolbar-tabs">
          {TABS.map((tab) => (
            <button key={tab} type="button" className={`um-tab ${activeTab === tab ? 'um-tab--active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}{tab === 'Users' ? ` (${safeRank.users})` : ''}</button>
          ))}
        </div>

        {activeTab === 'Overview' ? (
          <div className="rd-bottom-grid">
            <article className="rd-card">
              <h3>Rank Information</h3>
              <dl className="rd-list">
                <Info label="Rank Code" value={safeRank.rankCode || '—'} />
                <Info label="Rank Name" value={safeRank.rankName || safeRank.name} />
                <Info label="Min Deals" value={String(safeRank.minDealsRequired ?? 0)} />
                <Info label="Min Star Rating" value={Number(safeRank.minStarRating || 0).toFixed(1)} />
                <Info label="Frontline Featured" value={safeRank.featureOnFrontlineDashboard ? 'Yes' : 'No'} />
                <Info label="Status" value={safeRank.status === 'active' ? 'Active' : 'Inactive'} />
                <Info label="Created On" value={safeRank.createdOn} />
                <Info label="Last Updated" value={safeRank.updatedOn} />
              </dl>
            </article>
            <article className="rd-card">
              <h3>Requirements</h3>
              <dl className="rd-list">
                <Info label="Minimum Points" value={safeRank.minPoints.toLocaleString()} />
                <Info label="Icon URL" value={safeRank.iconUrl || safeRank.icon || '—'} />
              </dl>
            </article>
          </div>
        ) : null}

        {activeTab === 'Users' ? <div className="rd-empty">Total users in this rank: {safeRank.users}</div> : null}
        {activeTab === 'Permissions' ? <div className="rd-empty">Permission matrix will be configured here.</div> : null}
        {activeTab === 'Requirements' ? <div className="rd-empty">Advanced requirement rules will be configured here.</div> : null}
      </section>

      <RankFormModal open={editOpen} rank={safeRank} onClose={() => setEditOpen(false)} onSave={handleSave} />
    </div>
  );
}

function Info({ label, value }) {
  return <div className="rd-item"><dt>{label}</dt><dd>{value}</dd></div>;
}
