import React, { useMemo, useState } from 'react';
import { FiSettings } from 'react-icons/fi';

export default function WalletSettings({ preferences, onSave }) {
  const initial = useMemo(
    () => ({
      theme: preferences?.theme || 'dark',
      language: preferences?.language || 'en',
      base_currency: preferences?.base_currency || 'PKR',
      compact_mode: Boolean(preferences?.compact_mode),
      email_notifications: preferences?.email_notifications !== false,
    }),
    [preferences],
  );
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState('');

  React.useEffect(() => setForm(initial), [initial]);

  const save = async () => {
    const res = await onSave?.(form);
    setStatus(res?.status === 'success' ? 'Wallet settings saved' : res?.message || 'Save failed');
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h3 style={styles.title}><FiSettings /> Wallet Settings</h3>
        <div style={styles.grid}>
          <label style={styles.label}>
            Theme
            <select style={styles.input} value={form.theme} onChange={(e) => setForm((prev) => ({ ...prev, theme: e.target.value }))}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </label>
          <label style={styles.label}>
            Language
            <select style={styles.input} value={form.language} onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}>
              <option value="en">English</option>
              <option value="ur">Urdu</option>
            </select>
          </label>
          <label style={styles.label}>
            Base Currency
            <select style={styles.input} value={form.base_currency} onChange={(e) => setForm((prev) => ({ ...prev, base_currency: e.target.value }))}>
              <option value="PKR">PKR</option>
              <option value="USD">USD</option>
              <option value="THON">THON</option>
            </select>
          </label>
        </div>
        <div style={styles.toggleRow}>
          <label style={styles.checkLabel}>
            <input type="checkbox" checked={form.compact_mode} onChange={(e) => setForm((prev) => ({ ...prev, compact_mode: e.target.checked }))} />
            Compact Mode
          </label>
          <label style={styles.checkLabel}>
            <input type="checkbox" checked={form.email_notifications} onChange={(e) => setForm((prev) => ({ ...prev, email_notifications: e.target.checked }))} />
            Email Notifications
          </label>
        </div>
        <div style={styles.footer}>
          <button type="button" onClick={save} style={styles.primaryBtn}>Save Settings</button>
          {status ? <span style={styles.status}>{status}</span> : null}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { width: '100%' },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '18px',
    padding: '18px',
  },
  title: { margin: '0 0 14px', color: '#e8eeff', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '10px' },
  label: { color: '#9fb3d9', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' },
  input: {
    background: 'rgba(15,23,42,0.65)',
    border: '1px solid rgba(148,163,184,0.28)',
    color: '#e2e8f0',
    borderRadius: '10px',
    padding: '9px 10px',
    fontSize: '13px',
    outline: 'none',
  },
  toggleRow: { marginTop: '10px', display: 'flex', gap: '20px' },
  checkLabel: { color: '#cbd5e1', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' },
  footer: { marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' },
  primaryBtn: {
    border: '1px solid rgba(59,130,246,0.45)',
    color: '#eff6ff',
    background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
    borderRadius: '9px',
    padding: '7px 12px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
  },
  status: { color: '#9fb3d9', fontSize: '12px' },
};
