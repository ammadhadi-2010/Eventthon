import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  Edit3,
  Globe,
  MapPin,
  MoreVertical,
  Tag,
  User,
} from 'lucide-react';
import {
  displayPosterHandle,
  displayPosterName,
  getGigDetailTabs,
  gigInitials,
  GIG_STATUS_CLASS,
  mapGigFromApi,
  posterAvatarUrl,
} from './gigData';
import {
  fetchAdminGigDetail,
  updateAdminGig,
  updateAdminGigMilestoneStatus,
  updateAdminGigProposalStatus,
  updateAdminGigStatus,
} from '../../../../services/adminGigService';
import GigEditModal from './GigEditModal';
import GigProposalsTab from './GigProposalsTab';
import GigMilestonesTab from './GigMilestonesTab';
import GigActivityTab from './GigActivityTab';
import '../../styles/AdminShell.css';
import '../UserManagement/userManagement.css';
import './gigDetails.css';

const META_ICONS = { user: User, tag: Tag, calendar: Calendar, clock: Clock, briefcase: Briefcase, globe: Globe, map: MapPin };

export default function GigDetails() {
  const { gigId } = useParams();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [editOpen, setEditOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reloadGig = useCallback(async () => {
    const apiGig = await fetchAdminGigDetail(gigId);
    if (apiGig) {
      const mapped = mapGigFromApi(apiGig);
      setGig(mapped);
    }
  }, [gigId]);

  const safeGig = gig || { title: '', status: 'PENDING', requirements: [], skills: [] };
  const tabs = useMemo(() => getGigDetailTabs(safeGig), [safeGig]);
  const posterName = displayPosterName(safeGig);
  const posterHandle = displayPosterHandle(safeGig);
  const posterAvatar = posterAvatarUrl(safeGig);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      setGig(null);
      try {
        const apiGig = await fetchAdminGigDetail(gigId);
        if (!mounted) return;
        if (!apiGig) {
          setNotFound(true);
          return;
        }
        setGig(mapGigFromApi(apiGig));
      } catch {
        if (!mounted) return;
        setNotFound(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [gigId]);

  if (!loading && (notFound || !gig)) return <Navigate to="/admin-control/gigs" replace />;

  if (loading || !gig) {
    return (
      <div className="um-page">
        <p className="um-table-empty">Loading gig details…</p>
      </div>
    );
  }

  const g = gig;

  const applyStatus = async (status) => {
    try {
      const updated = await updateAdminGigStatus(gigId, status);
      if (updated) setGig(mapGigFromApi(updated));
    } catch {
      setGig((prev) => (prev ? { ...prev, status: status.toUpperCase() } : prev));
    }
    setActionsOpen(false);
  };

  const handleProposalStatus = async (proposal, status) => {
    if (!proposal?.id) return;
    setSubmitting(true);
    try {
      await updateAdminGigProposalStatus(gigId, proposal.id, status);
      await reloadGig();
    } finally {
      setSubmitting(false);
    }
  };

  const handleMilestoneStatus = async (milestoneId, status) => {
    setSubmitting(true);
    try {
      const milestones = await updateAdminGigMilestoneStatus(gigId, milestoneId, status);
      setGig((prev) => (prev ? { ...prev, milestones } : prev));
      await reloadGig();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async (payload) => {
    try {
      const updated = await updateAdminGig(gigId, payload);
      if (updated) setGig((prev) => ({ ...prev, ...mapGigFromApi(updated) }));
    } catch {
      setGig((prev) => (prev ? {
        ...prev,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        budget: `$${payload.starting_price} - $${payload.starting_price * 2}`,
      } : prev));
    }
    setEditOpen(false);
  };

  const metaRows = [
    { id: 'category', label: 'Category', value: g.category, icon: 'tag' },
    { id: 'sub', label: 'Sub Category', value: g.subCategory || 'General', icon: 'briefcase' },
    { id: 'posted', label: 'Posted On', value: g.postedOn, icon: 'calendar' },
    { id: 'delivery', label: 'Delivery Time', value: g.deliveryTime || '—', icon: 'clock' },
    { id: 'exp', label: 'Experience Level', value: g.experienceLevel || '—', icon: 'user' },
    { id: 'loc', label: 'Location', value: g.location || 'Remote', icon: 'map' },
    { id: 'type', label: 'Gig Type', value: g.gigType || 'Fixed Price', icon: 'globe' },
  ];

  return (
    <div className="um-page">
      <header className="um-header">
        <div className="um-header-copy">
          <h1 className="um-title">Gig Details</h1>
          <p className="gd-breadcrumb">
            <Link to="/admin-control/gigs">Gig Management</Link>
            <ChevronRight size={13} />
            <span>Gig Details</span>
          </p>
        </div>
        <div className="um-header-actions">
          <button type="button" className="um-btn um-btn--ghost" onClick={() => setEditOpen(true)}>
            <Edit3 size={14} />
            Edit Gig
          </button>
          <div className="gd-actions-wrap">
            <button type="button" className="um-btn um-btn--ghost" onClick={() => setActionsOpen((v) => !v)}>
              Actions
              <MoreVertical size={14} />
            </button>
            {actionsOpen ? (
              <div className="gd-actions-menu">
                <button type="button" onClick={() => applyStatus('Published')}>Mark Active</button>
                <button type="button" onClick={() => applyStatus('Draft')}>Mark Pending</button>
                <button type="button" onClick={() => applyStatus('Cancelled')}>Cancel Gig</button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <section className="um-card gd-hero">
        <div className="gd-hero__main">
          <div className="gd-badge">{gigInitials(g.title)}</div>
          <div className="gd-hero__copy">
            <div className="gd-hero__title-row">
              <h2>{g.title}</h2>
              <span className={`um-status-chip ${GIG_STATUS_CLASS[g.status] || 'um-status--pending'}`}>{g.status}</span>
            </div>
            <p>{g.category}</p>
            <p className="gd-muted">Posted by {posterHandle}</p>
          </div>
          <div className="gd-budget">
            <strong>{g.budget}</strong>
            <span>Budget</span>
          </div>
        </div>
        <p className="gd-desc gd-desc--hero">{g.description}</p>
      </section>

      <section className="um-card">
        <div className="um-toolbar-tabs">
          {tabs.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`um-tab ${activeTab === tab ? 'um-tab--active' : ''}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' ? (
          <div className="gd-grid">
            <article className="gd-panel">
              <div className="gd-poster">
                <img src={posterAvatar} alt={posterName} className="gd-poster__avatar" />
                <div>
                  <p className="gd-poster__label">Posted By</p>
                  <strong>{posterName}</strong>
                  <span>{posterHandle}</span>
                </div>
              </div>
              <dl className="gd-meta-list">
                {metaRows.map((row) => {
                  const Icon = META_ICONS[row.icon] || Tag;
                  return (
                    <div key={row.id} className="gd-meta-row">
                      <dt><Icon size={14} />{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  );
                })}
              </dl>
            </article>
            <article className="gd-panel">
              <h3>Description</h3>
              <p className="gd-desc">{g.description}</p>
              <h4>Requirements</h4>
              <ul className="gd-list">{(g.requirements || []).map((r) => <li key={r}>{r}</li>)}</ul>
              <h4>Skills Required</h4>
              <div className="gd-skills">{(g.skills || []).map((s) => <span key={s} className="um-role-pill">{s}</span>)}</div>
            </article>
          </div>
        ) : null}

        {activeTab.startsWith('Proposals') ? (
          <GigProposalsTab
            proposals={g.proposals || []}
            submitting={submitting}
            onAccept={(p) => handleProposalStatus(p, 'Accepted')}
            onReject={(p) => handleProposalStatus(p, 'Rejected')}
          />
        ) : null}
        {activeTab.startsWith('Milestones') ? (
          <GigMilestonesTab milestones={g.milestones || []} onStatusChange={handleMilestoneStatus} />
        ) : null}
        {activeTab === 'Activity' ? <GigActivityTab activities={g.activities || []} /> : null}
        {activeTab === 'Settings' ? <Settings gig={g} /> : null}
      </section>

      <GigEditModal open={editOpen} gig={g} onClose={() => setEditOpen(false)} onSave={handleSave} />
    </div>
  );
}

function Settings({ gig }) {
  return (
    <div className="gd-panel">
      <h3>Gig Settings</h3>
      <dl className="gd-meta-list">
        <div className="gd-meta-row"><dt>Visibility</dt><dd>Public</dd></div>
        <div className="gd-meta-row"><dt>Proposal Limit</dt><dd>25</dd></div>
        <div className="gd-meta-row"><dt>Auto Expiry</dt><dd>{gig.deliveryTime || '7 Days'}</dd></div>
        <div className="gd-meta-row"><dt>Current Status</dt><dd>{gig.status}</dd></div>
      </dl>
    </div>
  );
}
