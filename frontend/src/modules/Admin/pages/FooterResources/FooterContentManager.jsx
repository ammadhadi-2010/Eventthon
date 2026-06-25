import React, { useCallback, useEffect, useState } from 'react';
import FooterResourceFormPanel from './FooterResourceFormPanel';
import FooterResourceList from './FooterResourceList';
import {
  createFooterResource,
  deleteFooterResource,
  getFooterResources,
  updateFooterResource,
} from './footerResourceApi';
import { EMPTY_FOOTER_RESOURCE, PANEL_CLASS, SHELL_CLASS } from './footerResourceConstants';
import { rowToFooterForm } from '../../../../models/FooterResource';

export default function FooterContentManager() {
  const [rows, setRows] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FOOTER_RESOURCE);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { rows: data } = await getFooterResources();
      setRows(data);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Could not load footer resources.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = useCallback(() => {
    setFormData(EMPTY_FOOTER_RESOURCE);
    setEditingId('');
  }, []);

  const startEdit = (row) => {
    setEditingId(row.id);
    setFormData(rowToFooterForm(row));
    setStatus('');
    setError('');
  };

  const onSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError('');
    setStatus('');
    try {
      if (editingId) {
        await updateFooterResource(editingId, formData);
        setStatus('Resource updated.');
      } else {
        await createFooterResource(formData);
        setStatus('Resource created.');
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this footer resource?')) return;
    setError('');
    try {
      await deleteFooterResource(id);
      if (editingId === id) resetForm();
      setStatus('Resource deleted.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Delete failed.');
    }
  };

  return (
    <div className={SHELL_CLASS}>
      <header className="w-full flex flex-col gap-1">
        <h1 className="text-lg font-extrabold text-white tracking-tight">Footer Content Manager</h1>
        <p className="text-xs text-slate-200">
          Sidebar lists, video grids, blog covers, and community redirects — all from one CMS.
        </p>
      </header>

      {error ? <p className="text-xs font-semibold text-rose-300">{error}</p> : null}
      {status ? <p className="text-xs font-semibold text-emerald-300">{status}</p> : null}

      <FooterResourceFormPanel
        formData={formData}
        onChange={setFormData}
        onSubmit={onSubmit}
        onReset={resetForm}
        saving={saving}
        editingId={editingId}
      />

      <section className={PANEL_CLASS}>
        <h2 className="text-sm font-bold text-white tracking-tight">Saved Resources</h2>
        <FooterResourceList rows={rows} loading={loading} onEdit={startEdit} onDelete={onDelete} />
      </section>
    </div>
  );
}
