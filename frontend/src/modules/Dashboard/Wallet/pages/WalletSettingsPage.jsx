import React, { useState } from 'react';
import { DEMO_DEVICES, DEMO_LOGIN_HISTORY, DEMO_PAYMENT_ACCOUNTS } from '../data/walletSubpagesData';
import { formatTxDate } from '../utils/walletFormatters';
import { getWalletRowShade } from '../utils/walletCardShades';
import WalletSubpageHeader from '../components/shared/WalletSubpageHeader';

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <label className="wallet-toggle-row">
      <div>
        <strong>{label}</strong>
        {hint ? <span>{hint}</span> : null}
      </div>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export default function WalletSettingsPage({
  security,
  preferences,
  bankAccounts = [],
  onSaveSecurity,
  onSavePreferences,
}) {
  const [pinEnabled, setPinEnabled] = useState(Boolean(security?.withdrawal_pin_enabled));
  const [twoFactor, setTwoFactor] = useState(Boolean(security?.two_factor_enabled));
  const [emailNotif, setEmailNotif] = useState(preferences?.email_notifications !== false);
  const [privacyMode, setPrivacyMode] = useState(Boolean(preferences?.compact_mode));
  const [message, setMessage] = useState('');

  const accounts = bankAccounts?.length ? bankAccounts : DEMO_PAYMENT_ACCOUNTS;

  const persistSecurity = async (patch) => {
    const result = await onSaveSecurity?.(patch);
    setMessage(result?.status === 'error' ? result.message : 'Security settings saved.');
  };

  const persistPreferences = async (patch) => {
    const result = await onSavePreferences?.(patch);
    setMessage(result?.status === 'error' ? result.message : 'Preferences saved.');
  };

  return (
    <div className="wallet-subpage-stack">
      <WalletSubpageHeader title="Settings & Security" subtitle="Manage wallet PIN, 2FA, devices, and privacy" />

      {message ? <p className="wallet-form-message wallet-form-message--info">{message}</p> : null}

      <section className="wallet-card wallet-sub-panel">
        <h3>Wallet PIN</h3>
        <ToggleRow
          label="Withdrawal PIN"
          hint="Require a 6-digit PIN before every withdrawal"
          checked={pinEnabled}
          onChange={(value) => { setPinEnabled(value); persistSecurity({ withdrawal_pin_enabled: value }); }}
        />
      </section>

      <section className="wallet-card wallet-sub-panel">
        <h3>Two-Factor Authentication</h3>
        <ToggleRow
          label="Enable 2FA"
          hint="Protect wallet actions with authenticator app"
          checked={twoFactor}
          onChange={(value) => { setTwoFactor(value); persistSecurity({ two_factor_enabled: value }); }}
        />
      </section>

      <section className="wallet-card wallet-sub-panel">
        <h3>Devices</h3>
        <ul className="wallet-settings-list">
          {DEMO_DEVICES.map((device, index) => {
            const shade = getWalletRowShade(index);
            return (
              <li key={device.id} className={`wallet-settings-row wallet-tx-row--${shade}`}>
                <div>
                  <strong>{device.name}{device.current ? ' (This device)' : ''}</strong>
                  <span>{device.location} · {device.lastActive}</span>
                </div>
                {!device.current ? <button type="button" className="wallet-btn wallet-btn--ghost">Revoke</button> : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="wallet-card wallet-sub-panel">
        <h3>Login History</h3>
        <ul className="wallet-settings-list">
          {DEMO_LOGIN_HISTORY.map((row, index) => {
            const shade = getWalletRowShade(index);
            return (
              <li key={row.id} className={`wallet-settings-row wallet-tx-row--${shade}`}>
                <div>
                  <strong>{row.device}</strong>
                  <span>{row.ip} · {formatTxDate(row.at)}</span>
                </div>
                <span className={`wallet-tx-badge wallet-tx-badge--${row.status === 'blocked' ? 'failed' : 'completed'}`}>
                  {row.status}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="wallet-card wallet-sub-panel">
        <h3>Connected Payment Accounts</h3>
        <ul className="wallet-settings-list">
          {accounts.map((acc, index) => {
            const shade = getWalletRowShade(index);
            return (
              <li key={acc.id || index} className={`wallet-settings-row wallet-tx-row--${shade}`}>
                <div>
                  <strong>{acc.label || acc.bank_name}</strong>
                  <span>{acc.detail || acc.account_number}</span>
                </div>
                <button type="button" className="wallet-btn wallet-btn--ghost">Manage</button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="wallet-card wallet-sub-panel">
        <h3>Notification Settings</h3>
        <ToggleRow
          label="Email notifications"
          hint="Withdrawals, rewards, and security alerts"
          checked={emailNotif}
          onChange={(value) => { setEmailNotif(value); persistPreferences({ email_notifications: value }); }}
        />
      </section>

      <section className="wallet-card wallet-sub-panel">
        <h3>Privacy</h3>
        <ToggleRow
          label="Compact wallet mode"
          hint="Hide detailed balances on dashboard widgets"
          checked={privacyMode}
          onChange={(value) => { setPrivacyMode(value); persistPreferences({ compact_mode: value }); }}
        />
      </section>

      <section className="wallet-card wallet-sub-panel wallet-danger-zone">
        <h3>Delete Wallet Data</h3>
        <p>Permanently remove cached wallet analytics and export history from this device.</p>
        <button type="button" className="wallet-btn wallet-btn--danger">Delete Wallet Data</button>
      </section>
    </div>
  );
}
