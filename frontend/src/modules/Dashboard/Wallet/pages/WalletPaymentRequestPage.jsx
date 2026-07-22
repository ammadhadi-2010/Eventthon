import React, { useMemo, useState } from 'react';
import { FiCheck, FiCopy, FiLink } from 'react-icons/fi';
import {
  DEMO_PAYMENT_REQUESTS, buildPaymentRequestLink,
} from '../data/walletQuickActionsData';
import { formatThonAmount, formatTxDate } from '../utils/walletFormatters';
import { getWalletRowShade } from '../utils/walletCardShades';
import WalletSubpageHeader from '../components/shared/WalletSubpageHeader';
import WalletSubpageShell from '../components/shared/WalletSubpageShell';

function statusClass(status) {
  if (status === 'paid') return 'completed';
  if (status === 'expired') return 'failed';
  return 'pending';
}

export default function WalletPaymentRequestPage({ onBack }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [requests, setRequests] = useState(DEMO_PAYMENT_REQUESTS);

  const recent = useMemo(() => requests, [requests]);

  const handleCreate = (e) => {
    e.preventDefault();
    const value = Number(amount);
    if (!title.trim() || !email.trim() || !value || value <= 0) return;

    const id = `req-${Date.now().toString(36)}`;
    const link = buildPaymentRequestLink(id);
    const entry = {
      id,
      title: title.trim(),
      amount: value,
      to: email.trim(),
      status: 'pending',
      at: new Date().toISOString(),
    };
    setRequests((prev) => [entry, ...prev]);
    setGeneratedLink(link);
    setTitle('');
    setAmount('');
    setEmail('');
    setDueDate('');
    setNote('');
  };

  const copyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <WalletSubpageShell onBack={onBack}>
      <WalletSubpageHeader
        title="Payment Request"
        subtitle="Create a shareable link to request Thon payments"
      />

      <form className="wallet-card wallet-sub-panel wallet-withdraw-form" onSubmit={handleCreate}>
        <h3>Create Request</h3>
        <label>
          <span>Title</span>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Milestone 2 Payment" required />
        </label>
        <label>
          <span>Thon Amount</span>
          <input type="number" min="1" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount in Thon" required />
        </label>
        <label>
          <span>Recipient Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@company.com" required />
        </label>
        <label>
          <span>Due Date</span>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
        <label>
          <span>Note (optional)</span>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Project reference…" />
        </label>
        <button type="submit" className="wallet-btn wallet-btn--primary">
          <FiLink size={14} /> Generate Payment Link
        </button>
        {generatedLink ? (
          <div className="wallet-generated-link">
            <input type="text" readOnly value={generatedLink} onFocus={(e) => e.target.select()} />
            <button type="button" className="wallet-btn wallet-btn--outline" onClick={() => copyLink(generatedLink)}>
              {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
              {copied ? 'Copied' : 'Copy Link'}
            </button>
          </div>
        ) : null}
      </form>

      <section className="wallet-card wallet-sub-panel">
        <h3>Recent Payment Requests</h3>
        <ul className="wallet-tx-list">
          {recent.map((row, index) => {
            const shade = getWalletRowShade(index);
            const link = buildPaymentRequestLink(row.id);
            return (
              <li key={row.id} className={`wallet-tx-row wallet-tx-row--${shade}`}>
                <div className="wallet-tx-row__main">
                  <strong>{row.title}</strong>
                  <span>{row.to}</span>
                  <small>{formatTxDate(row.at)}</small>
                </div>
                <div className="wallet-tx-row__meta">
                  <span className={`wallet-tx-badge wallet-tx-badge--${statusClass(row.status)}`}>{row.status}</span>
                  <strong className="wallet-tx-amount--pos">{formatThonAmount(row.amount, { signed: true })}</strong>
                  <button type="button" className="wallet-link-copy-btn" onClick={() => copyLink(link)}>Copy link</button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </WalletSubpageShell>
  );
}
