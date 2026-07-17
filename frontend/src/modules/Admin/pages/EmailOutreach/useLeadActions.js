import { useCallback, useState } from 'react';
import { deleteOutreachLead, updateOutreachLead } from '../../services/emailOutreachApi';
import { composeDraftFromLead } from './outreachLeadMapper';

export default function useLeadActions({ onComposeLead, refresh }) {
  const [viewLead, setViewLead] = useState(null);
  const [editLead, setEditLead] = useState(null);
  const [menuLead, setMenuLead] = useState(null);

  const openView = useCallback((row) => setViewLead(row), []);
  const openEdit = useCallback((row) => setEditLead(row), []);
  const openMenu = useCallback((row) => setMenuLead(row), []);
  const closeModals = useCallback(() => {
    setViewLead(null);
    setEditLead(null);
    setMenuLead(null);
  }, []);

  const handleCompose = useCallback(
    (row) => {
      if (!onComposeLead || !row) return;
      onComposeLead(composeDraftFromLead(row));
    },
    [onComposeLead],
  );

  const handleDelete = useCallback(
    async (row) => {
      if (!row?.id) return;
      const ok = window.confirm(`Delete lead "${row.company}"?`);
      if (!ok) return;
      try {
        await deleteOutreachLead(row.id);
        closeModals();
        refresh?.();
        window.alert('Lead deleted.');
      } catch (err) {
        window.alert(err?.response?.data?.detail || err?.message || 'Delete failed');
      }
    },
    [closeModals, refresh],
  );

  const handleStatus = useCallback(
    async (row, status) => {
      if (!row?.id) return;
      try {
        await updateOutreachLead(row.id, { status });
        closeModals();
        refresh?.();
      } catch (err) {
        window.alert(err?.response?.data?.detail || err?.message || 'Status update failed');
      }
    },
    [closeModals, refresh],
  );

  const rowHandlers = useCallback(
    (row) => ({
      onView: () => openView(row),
      onEdit: () => openEdit(row),
      onMore: () => openMenu(row),
      onEmail: () => handleCompose(row),
    }),
    [handleCompose, openEdit, openMenu, openView],
  );

  return {
    viewLead,
    editLead,
    menuLead,
    setEditLead,
    closeModals,
    rowHandlers,
    handleCompose,
    handleDelete,
    handleStatus,
  };
}
