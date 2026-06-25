import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiMoreVertical, FiPlus, FiShoppingBag, FiStar } from 'react-icons/fi';
import API from '../../../../api/axiosConfig';
import { myGigStats, myGigTabs } from '../data/gigsData';
import { getGigsActorId, getGigsSessionHeaders } from '../utils/gigsSession';
import { GigsHubSectionHeader } from './GigsHubBackButton';
import { isMongoObjectId } from '../utils/navigateGigSurfaces';

const MyGigsContent = ({ onOpenCreateGig = () => {}, onBack }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All Gigs');
  const [ownerTab, setOwnerTab] = useState('All');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [rowsSource, setRowsSource] = useState([]);
  const [actionMessage, setActionMessage] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadMyGigs = useCallback(async () => {
    const userId = getGigsActorId();
    if (!userId) {
      setRowsSource([]);
      return;
    }
    try {
      const res = await API.get(`/api/gigs/my/${encodeURIComponent(userId)}`, {
        headers: getGigsSessionHeaders(),
      });
      const gigs = Array.isArray(res?.data?.gigs) ? res.data.gigs : [];
      const mapped = gigs.map((gig, index) => {
        const rawStatus = (gig.status || 'Draft').toLowerCase();
        const status =
          rawStatus === 'pending' || rawStatus === 'pending review'
            ? 'Pending Review'
            : rawStatus === 'paused'
              ? 'Paused'
              : rawStatus === 'published' || rawStatus === 'active'
                ? 'Active'
                : 'Draft';
        return {
          id: gig._id || `gig-${index}`,
          title: gig.title || 'Untitled Gig',
          ownerType: gig.owner_type || 'user',
          status,
          statusClass: status === 'Active' ? 'active' : status === 'Pending Review' ? 'pending' : 'pending',
          price: `$${Number(gig.starting_price || 0)}`,
          orders: String(gig.orders ?? 0),
          rating: gig.rating ? Number(gig.rating).toFixed(1) : '-',
          thumbText: (gig.title || 'G').trim().charAt(0).toUpperCase() || 'G',
          thumbClass: ['blue', 'purple', 'pink', 'slate'][index % 4],
        };
      });
      setRowsSource(mapped);
    } catch {
      setRowsSource([]);
    }
  }, []);

  useEffect(() => {
    loadMyGigs();
  }, [loadMyGigs]);

  useEffect(() => {
    if (!actionMessage) return undefined;
    const t = window.setTimeout(() => setActionMessage(''), 4000);
    return () => window.clearTimeout(t);
  }, [actionMessage]);

  const getRatingTone = (rating) => {
    const numeric = Number(rating);
    if (!Number.isFinite(numeric)) return 'muted';
    if (numeric >= 4.8) return 'gold';
    if (numeric >= 4.5) return 'amber';
    return 'slate';
  };

  const rows = useMemo(() => {
    let filteredByOwner = rowsSource;
    if (ownerTab === 'Personal') filteredByOwner = rowsSource.filter((row) => (row.ownerType || 'user') !== 'squad');
    if (ownerTab === 'Squad') filteredByOwner = rowsSource.filter((row) => row.ownerType === 'squad');

    if (activeTab === 'All Gigs') return filteredByOwner;
    if (activeTab === 'Active') return filteredByOwner.filter((row) => row.status === 'Active');
    if (activeTab === 'Pending') return filteredByOwner.filter((row) => row.status === 'Pending Review');
    if (activeTab === 'Draft') return filteredByOwner.filter((row) => row.status === 'Draft');
    if (activeTab === 'Paused') return filteredByOwner.filter((row) => row.status === 'Paused');
    return filteredByOwner;
  }, [activeTab, ownerTab, rowsSource]);

  const closeMenu = () => setOpenMenuId(null);

  const handleDuplicate = async (row) => {
    if (!isMongoObjectId(row.id)) {
      setActionMessage('Only saved gigs can be duplicated.');
      closeMenu();
      return;
    }
    const sellerUserId = localStorage.getItem('userId') || '';
    if (!sellerUserId) {
      setActionMessage('Sign in to duplicate gigs.');
      closeMenu();
      return;
    }
    try {
      setBusyId(row.id);
      const res = await API.get(`/api/gigs/${row.id}`);
      const g = res?.data?.gig;
      if (!g) throw new Error('Gig load failed.');
      await API.post('/api/gigs/', {
        title: `${String(g.title || 'Gig').slice(0, 120)} (Copy)`.slice(0, 140),
        description: String(g.description || ''),
        category: String(g.category || 'General'),
        starting_price: Number(g.starting_price ?? 0),
        seller_user_id: sellerUserId,
        owner_type: String(g.owner_type || 'user'),
        squad_id: g.owner_type === 'squad' ? (g.squad_id || '').trim() || null : null,
        status: 'Draft',
        tags: Array.isArray(g.tags) ? g.tags : [],
      });
      setActionMessage('Duplicate saved as Draft.');
      await loadMyGigs();
    } catch (e) {
      setActionMessage(String(e?.response?.data?.detail || e?.message || 'Duplicate failed.'));
    } finally {
      setBusyId(null);
      closeMenu();
    }
  };

  const handlePauseResume = async (row) => {
    if (!isMongoObjectId(row.id)) return;
    const nextRaw = row.status === 'Paused' ? 'Published' : 'Paused';
    try {
      setBusyId(row.id);
      await API.patch(`/api/gigs/${row.id}/status`, { status: nextRaw });
      setActionMessage(nextRaw === 'Paused' ? 'Gig paused.' : 'Gig resumed.');
      await loadMyGigs();
    } catch (e) {
      setActionMessage(String(e?.response?.data?.detail || e?.message || 'Status update failed.'));
    } finally {
      setBusyId(null);
      closeMenu();
    }
  };

  const handleDelete = async (row) => {
    if (!isMongoObjectId(row.id)) return;
    if (!window.confirm('Delete this gig? This cannot be undone.')) return;
    try {
      setBusyId(row.id);
      await API.delete(`/api/gigs/${row.id}`);
      setActionMessage('Gig deleted.');
      await loadMyGigs();
    } catch (e) {
      setActionMessage(String(e?.response?.data?.detail || e?.message || 'Delete failed.'));
    } finally {
      setBusyId(null);
      closeMenu();
    }
  };

  return (
    <section className="gigs-main-stack">
      <div className="gigs-card mygigs-card">
        <div className="mygigs-head">
          <GigsHubSectionHeader
            title="My Gigs"
            subtitle="Manage and track your gigs all in one place."
            onBack={onBack}
            className="mygigs-head__main"
          />
          <button type="button" className="mygigs-create-btn" onClick={() => onOpenCreateGig()}>
            <FiPlus size={14} />
            Create New Gig
          </button>
        </div>

        {actionMessage ? (
          <p style={{ padding: '0 4px 8px', color: '#bae6fd', fontSize: 13 }}>{actionMessage}</p>
        ) : null}

        <div className="mygigs-stats-grid">
          {myGigStats.map((stat) => (
            <div key={stat.label} className="mygigs-stat-box">
              <h4>{stat.value}</h4>
              <p>{stat.label}</p>
              <span className={`mygigs-stat-trend${stat.trend.startsWith('-') ? ' is-down' : ''}`}>{stat.trend}</span>
              <svg className="mygigs-stat-line" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
                <path d={stat.points} />
              </svg>
            </div>
          ))}
        </div>

        <div className="mygigs-tabs">
          {['All', 'Personal', 'Squad'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`mygigs-tab${ownerTab === tab ? ' is-active' : ''}`}
              onClick={() => setOwnerTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mygigs-tabs">
          {myGigTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`mygigs-tab${activeTab === tab ? ' is-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mygigs-rows">
          {rows.map((row) => (
            <div key={row.id} className="mygigs-row">
              <div className={`mygigs-thumb ${row.thumbClass}`}>{row.thumbText}</div>
              <div>
                <p className="mygigs-title">{row.title}</p>
                {row.ownerType === 'squad' ? <p className="mygigs-owner-pill">Squad Gig</p> : null}
                <span className={`mygigs-status ${row.statusClass}`}>{row.status}</span>
              </div>
              <div className="mygigs-meta">
                <p><FiDollarSign className="meta-icon dollar" size={13} /> {row.price}</p>
                <span>Starting Price</span>
              </div>
              <div className="mygigs-meta">
                <p><FiShoppingBag className="meta-icon orders" size={13} /> {row.orders}</p>
                <span>Orders</span>
              </div>
              <div className="mygigs-meta">
                <p>
                  <FiStar className={`meta-icon rating ${getRatingTone(row.rating)}`} size={13} />
                  {row.rating}
                </p>
                <span>Rating</span>
              </div>
              <button
                type="button"
                className="mygigs-menu-btn"
                aria-label="More actions"
                disabled={busyId === row.id}
                onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
              >
                <FiMoreVertical size={14} />
              </button>
              {openMenuId === row.id ? (
                <div className="mygigs-row-menu">
                  <button
                    type="button"
                    onClick={() => {
                      if (isMongoObjectId(row.id)) navigate(`/gigs/explorer?gig=${encodeURIComponent(row.id)}`);
                      else setActionMessage('Save the gig online to preview it.');
                      closeMenu();
                    }}
                  >
                    Preview in Explorer
                  </button>
                  <button type="button" disabled={busyId === row.id} onClick={() => handleDuplicate(row)}>Duplicate</button>
                  <button type="button" disabled={!isMongoObjectId(row.id) || busyId === row.id} onClick={() => handlePauseResume(row)}>
                    {row.status === 'Paused' ? 'Resume' : 'Pause'}
                  </button>
                  <button type="button" className="danger" disabled={busyId === row.id} onClick={() => handleDelete(row)}>Delete</button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MyGigsContent;
