import React, { useMemo, useState } from 'react';
import { FiAlertTriangle, FiPlus, FiShield } from 'react-icons/fi';
import { DEMO_PAYMENT_ACCOUNTS, DEMO_WITHDRAWALS } from '../data/walletSubpagesData';
import { formatThonAmount, formatTxDate, resolveThonBalances } from '../utils/walletFormatters';
import { getWalletRowShade } from '../utils/walletCardShades';
import WalletSubpageHeader from '../components/shared/WalletSubpageHeader';

function BalanceCard({ label, value, tone }) {
  return (
    <article className={`wallet-card wallet-withdraw-stat wallet-withdraw-stat--${tone}`}>
      <span>{label}</span>
      <strong>{formatThonAmount(value)}</strong>
    </article>
  );
}

function AccountCard({ account, selected, onSelect }) {
  const tone = account.type === 'bank' ? 'bank' : account.type;
  return (
    <button
      type="button"
      className={`wallet-account-card wallet-account-card--${tone}${selected ? ' is-selected' : ''}`}
      onClick={() => onSelect(account.id)}
    >
      <strong>{account.label}</strong>
      <span>{account.detail}</span>
      <small>{account.holder}</small>
      {account.primary ? <em className="wallet-account-primary">Primary</em> : null}
    </button>
  );
}

export default function WalletWithdrawPage({ wallet, bankAccounts = [], security, onWithdraw, onAddAccount }) {
  const balances = resolveThonBalances(wallet);
  const available = balances.available || 12560;
  const pending = balances.pending || 2300;
  const withdrawable = balances.withdrawable || Math.max(0, available - pending - balances.locked);

  const accounts = bankAccounts?.length ? bankAccounts.map((a, i) => ({
    id: a.id || `acc-${i}`,
    type: a.type || 'bank',
    label: a.bank_name || a.label || 'Bank Account',
    detail: a.account_number ? `•••• ${String(a.account_number).slice(-4)}` : '••••',
    holder: a.account_holder || 'Account Holder',
    primary: Boolean(a.primary),
  })) : DEMO_PAYMENT_ACCOUNTS;

  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const recent = useMemo(() => DEMO_WITHDRAWALS, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      setMessage('Enter a valid Thon amount.');
      return;
    }
    if (value > withdrawable) {
      setMessage('Amount exceeds withdrawable balance.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    const result = await onWithdraw?.({ amount: value, note: note || `Withdraw to ${selectedAccount}` });
    setSubmitting(false);
    setMessage(result?.status === 'error' ? (result.message || 'Withdraw failed') : 'Withdrawal request submitted.');
    if (result?.status !== 'error') setAmount('');
  };

  return (
    <div className="wallet-subpage-stack">
      <WalletSubpageHeader title="Withdraw Thon" subtitle="Transfer Thon to your linked accounts" />

      <div className="wallet-withdraw-balances">
        <BalanceCard label="Available Balance" value={available} tone="available" />
        <BalanceCard label="Withdrawable" value={withdrawable} tone="withdrawable" />
        <BalanceCard label="Pending" value={pending} tone="pending" />
      </div>

      <section className="wallet-card wallet-sub-panel">
        <div className="wallet-sub-panel__head">
          <h3>Payment Accounts</h3>
          <button type="button" className="wallet-btn wallet-btn--outline" onClick={onAddAccount}>
            <FiPlus size={14} /> Add New Account
          </button>
        </div>
        <div className="wallet-account-grid">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              selected={selectedAccount === account.id}
              onSelect={setSelectedAccount}
            />
          ))}
        </div>
      </section>

      <form className="wallet-card wallet-sub-panel wallet-withdraw-form" onSubmit={handleSubmit}>
        <h3>Withdraw Form</h3>
        <label>
          <span>Thon Amount</span>
          <input type="number" min="1" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 500" />
        </label>
        <label>
          <span>Note (optional)</span>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Withdrawal note" />
        </label>
        {message ? <p className="wallet-form-message">{message}</p> : null}
        <button type="submit" className="wallet-btn wallet-btn--primary" disabled={submitting}>
          {submitting ? 'Processing…' : 'Request Withdrawal'}
        </button>
      </form>

      <section className="wallet-card wallet-sub-panel">
        <h3>Recent Withdrawals</h3>
        <ul className="wallet-tx-list">
          {recent.map((row, index) => {
            const shade = getWalletRowShade(index);
            return (
              <li key={row.id} className={`wallet-tx-row wallet-tx-row--${shade}`}>
                <div className="wallet-tx-row__main">
                  <strong>{row.method}</strong>
                  <small>{formatTxDate(row.at)}</small>
                </div>
                <div className="wallet-tx-row__meta">
                  <span className={`wallet-tx-badge wallet-tx-badge--${row.status}`}>{row.status}</span>
                  <strong className="wallet-tx-amount--neg">{formatThonAmount(row.amount, { signed: true })}</strong>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`wallet-card wallet-security-notice${security?.two_factor_enabled ? ' is-secure' : ''}`}>
        <FiShield size={20} aria-hidden />
        <div>
          <strong>{security?.two_factor_enabled ? '2FA Enabled' : 'Enable 2FA for Withdrawals'}</strong>
          <p>
            {security?.two_factor_enabled
              ? 'Your wallet withdrawals are protected with two-factor authentication.'
              : 'Turn on two-factor authentication before withdrawing large amounts.'}
          </p>
        </div>
        {!security?.two_factor_enabled ? <FiAlertTriangle className="wallet-security-warn" aria-hidden /> : null}
      </section>
    </div>
  );
}
