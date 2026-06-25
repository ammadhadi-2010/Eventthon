import React, { useEffect, useState } from 'react';
import UserManagementStats from '../UserManagement/UserManagementStats';
import { fetchAdminGigDetail } from '../../../../services/adminGigService';
import GigDetailPane from './GigDetailPane';
import GigManagementTable from './GigManagementTable';
import GigManagementToolbar from './GigManagementToolbar';
import useGigManagement from './useGigManagement';
import { mapGigFromApi } from './gigData';
import '../../styles/AdminShell.css';
import '../../styles/AdminCards.css';
import '../UserManagement/userManagement.css';
import './gigDetails.css';
import './gigManagement.css';

export default function GigManagementPage() {
  const {
    stats,
    rows,
    loading,
    error,
    activeTab,
    setActiveTab,
    query,
    setQuery,
    approveGig,
    suspendGig,
    deleteGig,
  } = useGigManagement();

  const [viewingGigId, setViewingGigId] = useState(null);
  const [detailGig, setDetailGig] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!viewingGigId) {
      setDetailGig(null);
      return undefined;
    }
    const seed = rows.find((row) => String(row.id) === String(viewingGigId));
    if (seed) setDetailGig(seed);

    let cancelled = false;
    const load = async () => {
      setDetailLoading(true);
      try {
        const data = await fetchAdminGigDetail(viewingGigId);
        if (!cancelled && data) setDetailGig(mapGigFromApi(data));
      } catch (err) {
        // keep seeded list row
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [viewingGigId, rows]);

  const inDrillDown = Boolean(viewingGigId && detailGig);

  const viewGig = (row) => setViewingGigId(String(row.id));

  const runAction = async (fn, row) => {
    try {
      await fn(row.id);
    } catch (err) {
      window.alert(err?.response?.data?.detail || err?.message || 'Action failed');
    }
  };

  const handleApprove = (row) => runAction(approveGig, row);
  const handleSuspend = (row) => runAction(suspendGig, row);
  const handleDelete = async (row) => {
    try {
      await deleteGig(row.id);
      if (String(viewingGigId) === String(row.id)) setViewingGigId(null);
    } catch (err) {
      window.alert(err?.response?.data?.detail || err?.message || 'Delete failed');
    }
  };

  return (
    <div className="um-page gm-page w-full max-w-full p-3 py-2 lg:p-0">
      <header className="um-header um-header--tight gm-header--desktop">
        <div className="um-header-copy">
          <h1 className="um-title um-title--mobile">Gig Management</h1>
          <p className="um-subtitle um-subtitle--compact">Manage all gigs, approvals, and gig categories.</p>
        </div>
      </header>

      {error ? (
        <div className="um-banner-error" role="alert">
          {error}
        </div>
      ) : null}

      {!inDrillDown ? <UserManagementStats stats={stats} desktopCols={4} /> : null}

      {inDrillDown ? (
        <GigDetailPane
          gig={detailGig}
          loading={detailLoading}
          onClose={() => setViewingGigId(null)}
        />
      ) : null}

      {!inDrillDown ? (
        <section className="um-card gm-card--desktop">
          <GigManagementToolbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            query={query}
            onQueryChange={setQuery}
          />
          <GigManagementTable
            rows={rows}
            loading={loading}
            viewingGigId={viewingGigId}
            onViewGig={viewGig}
            onApprove={handleApprove}
            onSuspend={handleSuspend}
            onDelete={handleDelete}
          />
        </section>
      ) : null}
    </div>
  );
}
