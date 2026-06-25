import React, { useEffect, useState } from 'react';
import UserManagementStats from '../UserManagement/UserManagementStats';
import { fetchAdminSquadDetail, fetchAdminSquadMembers } from '../../../../services/adminSquadService';
import SquadDetailPane from './SquadDetailPane';
import SquadEditModal from './SquadEditModal';
import SquadManagementTable from './SquadManagementTable';
import SquadManagementToolbar from './SquadManagementToolbar';
import useSquadManagement from './useSquadManagement';
import { mapSquadSummaryFromApi } from './squadData';
import '../../styles/AdminShell.css';
import '../../styles/AdminCards.css';
import '../UserManagement/userManagement.css';
import './squadDetails.css';
import './squadManagement.css';

export default function SquadManagementPage() {
  const {
    stats,
    rows,
    loading,
    activeTab,
    setActiveTab,
    query,
    setQuery,
    selectedSquadId,
    setSelectedSquadId,
    selectedSquad,
    patchSquad,
    setSquadStatus,
    disbandSquad,
    error,
    reload,
  } = useSquadManagement();

  const [editRow, setEditRow] = useState(null);
  const [detailSquad, setDetailSquad] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!selectedSquadId) {
      setDetailSquad(null);
      return undefined;
    }
    const seed = rows.find((row) => String(row.id) === String(selectedSquadId));
    if (seed) setDetailSquad(seed);

    let cancelled = false;
    const load = async () => {
      setDetailLoading(true);
      try {
        const [data, hydratedMembers] = await Promise.all([
          fetchAdminSquadDetail(selectedSquadId),
          fetchAdminSquadMembers(selectedSquadId).catch(() => []),
        ]);
        if (!cancelled && data) {
          const merged = {
            ...data,
            members: hydratedMembers.length ? hydratedMembers : data.members,
          };
          setDetailSquad(mapSquadSummaryFromApi(merged));
        }
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
  }, [selectedSquadId, rows]);

  const viewSquad = (row) => {
    setSelectedSquadId(String(row.id));
  };

  const handleStatusChange = async (row, status) => {
    try {
      await setSquadStatus(row.id, status);
      setDetailSquad((prev) =>
        prev && String(prev.id) === String(row.id) ? { ...prev, status } : prev,
      );
    } catch (err) {
      window.alert(err?.response?.data?.detail || err?.message || 'Status update failed');
    }
  };

  const handleDisband = async (row) => {
    const ok = window.confirm(`Disband "${row.name}"? This removes the squad from admin view.`);
    if (!ok) return;
    try {
      await disbandSquad(row.id);
    } catch (err) {
      window.alert(err?.response?.data?.detail || err?.message || 'Disband failed');
    }
  };

  const handlePatch = (squadId, patch) => {
    const next = {
      name: patch.name,
      category: patch.category,
      description: patch.description,
      handle: patch.name ? `@${patch.name.toLowerCase().replace(/\s+/g, '')}` : undefined,
    };
    patchSquad(squadId, next);
    setDetailSquad((prev) =>
      prev && String(prev.id) === String(squadId) ? { ...prev, ...next } : prev,
    );
  };

  const activeDetail = detailSquad || selectedSquad;
  const inDrillDown = Boolean(selectedSquadId && activeDetail);

  return (
    <div className="um-page sm-page w-full max-w-full p-3 py-2 lg:p-0">
      <header className="um-header um-header--tight sm-header--desktop">
        <div className="um-header-copy">
          <h1 className="um-title um-title--mobile">Squad Management</h1>
          <p className="um-subtitle um-subtitle--compact">Manage all squads, members, and activities.</p>
        </div>
      </header>

      {error ? (
        <div className="um-banner-error" role="alert">
          {error}
        </div>
      ) : null}

      {!inDrillDown ? <UserManagementStats stats={stats} desktopCols={4} /> : null}

      {inDrillDown ? (
        <SquadDetailPane
          squad={activeDetail}
          loading={detailLoading}
          onClose={() => setSelectedSquadId(null)}
          onPatch={handlePatch}
          onStatusChange={handleStatusChange}
          onDisband={handleDisband}
        />
      ) : null}

      {!inDrillDown ? (
        <section className="um-card sm-card--desktop">
          <SquadManagementToolbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            query={query}
            onQueryChange={setQuery}
          />
          <SquadManagementTable
            rows={rows}
            loading={loading}
            selectedSquadId={selectedSquadId}
            onViewSquad={viewSquad}
            onEditSquad={setEditRow}
            onStatusChange={handleStatusChange}
            onDisbandSquad={handleDisband}
          />
        </section>
      ) : null}

      {editRow ? (
        <SquadEditModal
          draft={{
            name: editRow.name,
            category: editRow.category,
            description: editRow.description || '',
          }}
          squadId={editRow.id}
          onClose={() => setEditRow(null)}
          onSave={async (draft) => {
            handlePatch(editRow.id, draft);
            setEditRow(null);
            await reload();
          }}
        />
      ) : null}
    </div>
  );
}
