import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { attachNextRankMetadata } from '../../../../models/rankNextTarget';
import { createAdminRank, fetchAdminRanks, saveAdminRank } from '../../../../services/adminRankService';
import { primeRankMatrix } from '../../../../services/rankMatrixCache';
import { applyRankPresetToForm } from '../../../../models/Rank';
import RankFormModal from './RankFormModal';
import RankMatrixTable from './RankMatrixTable';
import RankMobileCard from './RankMobileCard';
import { rankTableRows } from './rankDisplayHelpers';
import { RANK_TABS, filterRanks } from './rankData';
import '../UserManagement/userManagement.css';
import './rank-management-modal.css';
import './rank-matrix.css';

export default function RankManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(RANK_TABS[0]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRank, setEditingRank] = useState(null);
  const [draftForm, setDraftForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminRanks();
      primeRankMatrix(data);
      setRows(rankTableRows(attachNextRankMetadata(data)));
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Could not load ranks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => filterRanks(rows, activeTab), [rows, activeTab]);

  const openCreate = () => {
    setEditingRank(null);
    setDraftForm(applyRankPresetToForm({}, 'E-1'));
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingRank(row);
    setDraftForm(null);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    setSaving(true);
    setError('');
    try {
      if (editingRank?.id) await saveAdminRank(editingRank.id, form);
      else await createAdminRank(form);
      setModalOpen(false);
      setEditingRank(null);
      setDraftForm(null);
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Could not save rank.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="um-page">
      <header className="um-header">
        <div className="um-header-copy">
          <h1 className="um-title">Rank Management</h1>
          <p className="um-subtitle">6-Level Elite Game Plan Matrix — locked badges, points, deals, and star gates.</p>
        </div>
        <div className="um-header-actions">
          <button type="button" className="um-btn um-btn--primary" onClick={openCreate}>
            <Plus size={14} />
            Add New Rank
          </button>
        </div>
      </header>

      {error ? <p className="rm-inline-error">{error}</p> : null}

      <section className="um-card">
        <div className="um-toolbar">
          <div className="um-toolbar-tabs">
            {RANK_TABS.map((tab) => (
              <button key={tab} type="button" className={`um-tab ${activeTab === tab ? 'um-tab--active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className={`um-table-block${loading ? ' um-table-wrap--loading' : ''}`}>
          <div className="rm-mobile-list">
            {filtered.length === 0 ? (
              <p className="um-table-empty">No ranks found.</p>
            ) : (
              filtered.map((row) => (
                <RankMobileCard
                  key={row.id}
                  row={row}
                  onOpen={(item) => navigate(`/admin-control/ranks/${item.id}`)}
                  onEdit={openEdit}
                />
              ))
            )}
          </div>
          <RankMatrixTable rows={filtered} onEdit={openEdit} />
        </div>
      </section>

      <RankFormModal
        open={modalOpen}
        rank={editingRank}
        initialForm={draftForm}
        onClose={() => { setModalOpen(false); setEditingRank(null); setDraftForm(null); }}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
