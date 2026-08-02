import React, { useCallback, useEffect, useState } from 'react';
import {
  Award,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  FileText,
  Grid3X3,
  Hash,
  Layers,
  List,
  Save,
  Settings,
  ShieldCheck,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import '../UserManagement/userManagement.css';
import '../SystemSettings/generalSettings.css';

const ICONS = {
  briefcase: Briefcase,
  shield: ShieldCheck,
  building: Building2,
  file: FileText,
  bell: Bell,
  hash: Hash,
  calendar: Calendar,
  award: Award,
  target: Target,
  layers: Layers,
  zap: Zap,
  users: Users,
  grid: Grid3X3,
  list: List,
  settings: Settings,
};

/** Shared admin settings form for Jobs / Opportunity hub config. */
export default function AdminHubSettingsForm({
  title,
  breadcrumbParent = 'Job Management',
  breadcrumbParentTo = '/admin-control/jobs',
  rows,
  defaults,
  loadSettings,
  saveSettings,
}) {
  const [settings, setSettings] = useState(defaults);
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
      const data = await loadSettings();
      if (data) setSettings({ ...defaults, ...data });
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, [defaults, loadSettings]);

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
    const next =
      editRow.type === 'number' ? Number(draft) || defaults[editRow.id] : draft;
    setSettings((prev) => ({ ...prev, [editRow.id]: next }));
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
      const payload = { ...defaults, ...settings };
      delete payload.updatedAt;
      const updated = await saveSettings(payload);
      if (updated) setSettings({ ...defaults, ...updated });
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
          <h1 className="um-title">{title}</h1>
          <p className="gs-breadcrumb">
            <Link to={breadcrumbParentTo}>{breadcrumbParent}</Link>
            <span>›</span>
            <span>{title}</span>
          </p>
        </div>
        <div className="um-header-actions">
          <button
            type="button"
            className="um-btn um-btn--primary"
            onClick={saveAll}
            disabled={loading || saving}
          >
            <Save size={14} />
            {saving ? 'Saving…' : saved ? 'Saved' : 'Save Changes'}
          </button>
        </div>
      </header>

      {error ? <p className="um-banner-error">{error}</p> : null}

      <section className={`gs-card${loading ? ' gs-card--loading' : ''}`}>
        {rows.map((row) => {
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
                  String(value ?? '')
                )}
              </div>
              {row.type === 'toggle' ? (
                <span className="gs-edit-btn gs-edit-btn--spacer" aria-hidden />
              ) : (
                <button
                  type="button"
                  className="gs-edit-btn"
                  onClick={() => openEdit(row)}
                  disabled={loading || saving}
                >
                  Edit
                </button>
              )}
            </div>
          );
        })}
      </section>

      {editRow ? (
        <div className="gs-modal-root" role="dialog" aria-modal="true">
          <button
            type="button"
            className="gs-modal-backdrop"
            onClick={() => setEditRow(null)}
            aria-label="Close"
          />
          <div className="gs-modal">
            <h3>Edit {editRow.label}</h3>
            <label>
              {editRow.label}
              {editRow.type === 'textarea' ? (
                <textarea rows={4} value={draft} onChange={(e) => setDraft(e.target.value)} />
              ) : (
                <input
                  type={editRow.type === 'number' ? 'number' : 'text'}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
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
