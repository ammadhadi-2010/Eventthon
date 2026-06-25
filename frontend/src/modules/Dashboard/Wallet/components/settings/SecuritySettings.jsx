import React, { useMemo, useState } from 'react';
import { FiShield, FiLock, FiSmartphone } from 'react-icons/fi';

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid rgba(148,163,184,0.12)',
};

const switchWrap = (enabled) => ({
  width: '48px',
  height: '28px',
  borderRadius: '999px',
  border: '1px solid rgba(148,163,184,0.3)',
  background: enabled ? 'linear-gradient(135deg,#2563eb,#3b82f6)' : 'rgba(51,65,85,0.8)',
  position: 'relative',
  cursor: 'pointer',
});

const switchKnob = (enabled) => ({
  position: 'absolute',
  top: '3px',
  left: enabled ? '23px' : '3px',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: '#fff',
  transition: 'all 0.2s ease',
});

export default function SecuritySettings({ security, onSave }) {
  const initial = useMemo(
    () => ({
      kyc_verified: Boolean(security?.kyc_verified),
      two_factor_enabled: Boolean(security?.two_factor_enabled),
      withdrawal_pin_enabled: Boolean(security?.withdrawal_pin_enabled),
      login_alerts: security?.login_alerts !== false,
    }),
    [security],
  );
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState('');

  React.useEffect(() => setForm(initial), [initial]);

  const toggle = (key) => setForm((prev) => ({ ...prev, [key]: !prev[key] }));

  const save = async () => {
    const res = await onSave?.(form);
    setStatus(res?.status === 'success' ? 'Security settings saved' : res?.message || 'Save failed');
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h3 style={styles.title}><FiShield /> Security Controls</h3>
        <div style={rowStyle}>
          <span style={styles.label}><FiSmartphone /> KYC Verified</span>
          <button type="button" onClick={() => toggle('kyc_verified')} style={switchWrap(form.kyc_verified)}><span style={switchKnob(form.kyc_verified)} /></button>
        </div>
        <div style={rowStyle}>
          <span style={styles.label}><FiSmartphone /> Two-Factor Authentication</span>
          <button type="button" onClick={() => toggle('two_factor_enabled')} style={switchWrap(form.two_factor_enabled)}><span style={switchKnob(form.two_factor_enabled)} /></button>
        </div>
        <div style={rowStyle}>
          <span style={styles.label}><FiLock /> Withdrawal PIN Protection</span>
          <button type="button" onClick={() => toggle('withdrawal_pin_enabled')} style={switchWrap(form.withdrawal_pin_enabled)}><span style={switchKnob(form.withdrawal_pin_enabled)} /></button>
        </div>
        <div style={rowStyle}>
          <span style={styles.label}><FiShield /> Login Alerts</span>
          <button type="button" onClick={() => toggle('login_alerts')} style={switchWrap(form.login_alerts)}><span style={switchKnob(form.login_alerts)} /></button>
        </div>
        <div style={styles.footer}>
          <button type="button" onClick={save} style={styles.primaryBtn}>Save Security</button>
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
  title: { margin: '0 0 10px', color: '#e8eeff', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
  label: { color: '#cbd5e1', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' },
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
