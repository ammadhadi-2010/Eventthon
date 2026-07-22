import React, { useMemo, useState } from 'react';
import { DEMO_SENT_TRANSFERS } from '../data/walletQuickActionsData';
import { formatEtAmount, formatThonAmount, formatTxDate, resolveThonBalances } from '../utils/walletFormatters';
import { getWalletRowShade } from '../utils/walletCardShades';
import WalletSubpageHeader from '../components/shared/WalletSubpageHeader';
import WalletSubpageShell from '../components/shared/WalletSubpageShell';

export default function WalletSendPage({ wallet, userData, onTransfer, onBack }) {
  const { available } = resolveThonBalances(wallet);
  const balance = available || 12560;

  const [toUserId, setToUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const recent = useMemo(() => DEMO_SENT_TRANSFERS, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = Number(amount);
    if (!toUserId.trim()) {
      setMessage('Enter recipient user ID or email.');
      return;
    }
    if (!value || value <= 0) {
      setMessage('Enter a valid Thon amount.');
      return;
    }
    if (value > balance) {
      setMessage('Insufficient available balance.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    const result = await onTransfer?.({
      toUserId: toUserId.trim(),
      amount: value,
      note: note.trim(),
    });
    setSubmitting(false);
    if (result?.status === 'error') {
      setMessage(result.message || 'Transfer failed.');
      return;
    }
    setMessage(`Successfully sent ${formatThonAmount(value)} to ${toUserId.trim()}.`);
    setAmount('');
    setNote('');
  };

  return (
    <WalletSubpageShell onBack={onBack}>
      <WalletSubpageHeader
        title="Send Thon"
        subtitle={`Available to send: ${formatThonAmount(balance)}`}
      />

      <form className="wallet-card wallet-sub-panel wallet-withdraw-form" onSubmit={handleSubmit}>
        <h3>Transfer Details</h3>
        <label>
          <span>Recipient (User ID or Email)</span>
          <input
            type="text"
            value={toUserId}
            onChange={(e) => setToUserId(e.target.value)}
            placeholder="e.g. user@eventthon.com"
          />
        </label>
        <label>
          <span>Thon Amount</span>
          <input type="number" min="1" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount in Thon" />
        </label>
        <label>
          <span>Note (optional)</span>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Payment for…" />
        </label>
        {message ? <p className={`wallet-form-message${message.includes('Successfully') ? ' wallet-form-message--info' : ''}`}>{message}</p> : null}
        <button type="submit" className="wallet-btn wallet-btn--primary" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send Thon'}
        </button>
      </form>

      <section className="wallet-card wallet-sub-panel wallet-send-tips">
        <h3>Transfer Tips</h3>
        <ul className="wallet-tip-list">
          <li>Double-check the recipient before sending — Thon transfers are instant.</li>
          <li>Use notes to reference gigs, projects, or squad payments.</li>
          <li>Your sender ID: {userData?.email || userData?._id || 'Connected account'}</li>
        </ul>
      </section>

      <section className="wallet-card wallet-sub-panel">
        <h3>Recent Sent Transfers</h3>
        <ul className="wallet-tx-list">
          {recent.map((row, index) => {
            const shade = getWalletRowShade(index);
            return (
              <li key={row.id} className={`wallet-tx-row wallet-tx-row--${shade}`}>
                <div className="wallet-tx-row__main">
                  <strong>To {row.to}</strong>
                  <small>{formatTxDate(row.at)}</small>
                </div>
                <div className="wallet-tx-row__meta">
                  <span className={`wallet-tx-badge wallet-tx-badge--${row.status}`}>{row.status}</span>
                  <strong className="wallet-tx-amount--neg">{formatEtAmount(row.amount, { signed: true })}</strong>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </WalletSubpageShell>
  );
}
