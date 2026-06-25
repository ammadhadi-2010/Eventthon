import React, { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  FileText,
  Globe,
  Save,
  Settings,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchGeneralSettings, saveGeneralSettings } from '../../../../services/adminSettingsService';
import { DEFAULT_GENERAL_SETTINGS, GENERAL_SETTING_ROWS } from './generalSettingsData';
import '../UserManagement/userManagement.css';
import './generalSettings.css';

const ICONS = {
  globe: Globe,
  file: FileText,
  clock: Clock,
  calendar: Calendar,
  userCheck: UserCheck,
  shield: ShieldCheck,
  settings: Settings,
};

export default function GeneralSettings() {
  const [settings, setSettings] = useState(DEFAULT_GENERAL_SETTINGS);
  const [editRow, setEditRow] = useState(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchGeneralSettings();
      if (data) setSettings({ ...DEFAULT_GENERAL_SETTINGS, ...data });
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (row) => {
    if (row.type === 'toggle') return;
    setEditRow(row);
    setDraft(String(settings[row.id] ?? ''));
  };

  const applyEdit = () => {
    if (!editRow) return;
    setSettings((prev) => ({ ...prev, [editRow.id]: draft }));
    setEditRow(null);
    setDraft('');
  };

  const toggle = (id) => {
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const saveAll = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await saveGeneralSettings(settings);
      if (updated) setSettings({ ...DEFAULT_GENERAL_SETTINGS, ...updated });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="gs-page">
      <header className="um-header">
        <div className="um-header-copy">
          <h1 className="um-title">General Settings</h1>
          <p className="gs-breadcrumb">
            <Link to="/admin-control/settings">System Settings</Link>
            <span>›</span>
            <span>General Settings</span>
          </p>
        </div>
        <div className="um-header-actions">
          <button type="button" className="um-btn um-btn--primary" onClick={saveAll} disabled={loading || saving}>
            <Save size={14} />
            {saving ? 'Saving…' : saved ? 'Saved' : 'Save Changes'}
          </button>
        </div>
      </header>

      {error ? <p className="um-banner-error">{error}</p> : null}

      <section className={`gs-card${loading ? ' gs-card--loading' : ''}`}>
        {GENERAL_SETTING_ROWS.map((row) => {
          const Icon = ICONS[row.icon] || Settings;
          const value = settings[row.id];
          return (
            <div key={row.id} className="gs-row">
              <div className="gs-row-icon">
                <Icon size={16} />
              </div>
              <div className="gs-row-copy">
                <h3>{row.label}</h3>
                <p>{row.description}</p>
              </div>
              <div className="gs-row-value">
                {row.type === 'toggle' ? (
                  <div className="gs-toggle-wrap">
                    <span className="gs-toggle-label">{value ? 'Enabled' : 'Disabled'}</span>
                    <button
                      type="button"
                      className={`gs-toggle ${value ? 'gs-toggle--on' : ''}`}
                      onClick={() => toggle(row.id)}
                      disabled={loading || saving}
                      aria-label={`Toggle ${row.label}`}
                    >
                      <span className="gs-toggle__knob" />
                    </button>
                  </div>
                ) : (
                  value
                )}
              </div>
              <button type="button" className="gs-edit-btn" onClick={() => openEdit(row)} disabled={loading || saving}>
                Edit
              </button>
            </div>
          );
        })}
      </section>

      {editRow ? (
        <div className="gs-modal-root" role="dialog" aria-modal="true">
          <button type="button" className="gs-modal-backdrop" onClick={() => setEditRow(null)} aria-label="Close" />
          <div className="gs-modal">
            <h3>Edit {editRow.label}</h3>
            <label>
              {editRow.label}
              {editRow.type === 'textarea' ? (
                <textarea rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} />
              ) : editRow.type === 'select' ? (
                <select value={draft} onChange={(e) => setDraft(e.target.value)}>
                  {(editRow.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input value={draft} onChange={(e) => setDraft(e.target.value)} />
              )}
            </label>
            <div className="gs-modal-actions">
              <button type="button" className="um-btn um-btn--ghost" onClick={() => setEditRow(null)}>
                Cancel
              </button>
              <button type="button" className="um-btn um-btn--primary" onClick={applyEdit}>
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
