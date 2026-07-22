import React, { useEffect, useMemo, useState } from 'react';
import {
  DEMO_TOP_UPS, TOP_UP_METHODS, TOP_UP_PRESETS_USD,
} from '../data/walletQuickActionsData';
import {
  formatThonAmount, formatTxDate, resolveThonBalances, usdToThon,
} from '../utils/walletFormatters';
import { getWalletRowShade } from '../utils/walletCardShades';
import { createDepositCheckout, getPaymentConfig } from '../walletApi';
import WalletSubpageHeader from '../components/shared/WalletSubpageHeader';
import WalletSubpageShell from '../components/shared/WalletSubpageShell';

const DEFAULT_THON_PER_USD = 100;

export default function WalletAddBalancePage({ wallet, userData, onBack }) {
  const { available } = resolveThonBalances(wallet);
  const [method, setMethod] = useState(TOP_UP_METHODS[0].id);
  const [amountUsd, setAmountUsd] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [thonPerUsd, setThonPerUsd] = useState(DEFAULT_THON_PER_USD);
  const [configLoading, setConfigLoading] = useState(true);

  const selected = TOP_UP_METHODS.find((m) => m.id === method) || TOP_UP_METHODS[0];
  const recent = useMemo(() => DEMO_TOP_UPS, []);
  const thonPreview = usdToThon(amountUsd, thonPerUsd);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const config = await getPaymentConfig();
        if (active && config?.thon_per_usd) {
          setThonPerUsd(Number(config.thon_per_usd) || DEFAULT_THON_PER_USD);
        }
      } catch (err) {
        console.error('Payment config load failed:', err);
      } finally {
        if (active) setConfigLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const usd = Number(amountUsd);
    if (!usd || usd <= 0) {
      setMessage('Enter a valid USD amount.');
      return;
    }
    if (method !== 'card') {
      setMessage('Card checkout is required for online deposits. Select Debit / Credit Card.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      const origin = window.location.origin;
      const result = await createDepositCheckout(userData, {
        amountUsd: usd,
        successUrl: `${origin}/wallet?deposit=success`,
        cancelUrl: `${origin}/wallet?deposit=cancelled`,
        gateway: 'stripe',
      });
      const checkoutUrl = result?.checkout_url;
      if (!checkoutUrl) {
        throw new Error('Checkout URL missing from server response');
      }
      window.location.href = checkoutUrl;
    } catch (err) {
      setSubmitting(false);
      const detail = err?.response?.data?.detail;
      setMessage(typeof detail === 'string' ? detail : err?.message || 'Unable to start checkout.');
    }
  };

  return (
    <WalletSubpageShell onBack={onBack}>
      <WalletSubpageHeader
        title="Add Balance"
        subtitle={`Current balance: ${formatThonAmount(available || 0)}`}
      />

      <section className="wallet-card wallet-sub-panel">
        <h3>Select Payment Method</h3>
        <div className="wallet-method-grid">
          {TOP_UP_METHODS.map((item, index) => {
            const shade = getWalletRowShade(index);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={`wallet-method-card wallet-tx-row--${shade}${method === item.id ? ' is-selected' : ''}`}
                onClick={() => setMethod(item.id)}
              >
                <span className={`wallet-tx-row__icon wallet-tx-row__icon--${shade}`}><Icon size={16} /></span>
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.detail} · Fee {item.fee}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <form className="wallet-card wallet-sub-panel wallet-withdraw-form" onSubmit={handleSubmit}>
        <h3>Deposit Amount (USD)</h3>
        <div className="wallet-preset-row">
          {TOP_UP_PRESETS_USD.map((preset) => (
            <button key={preset} type="button" className="wallet-preset-btn" onClick={() => setAmountUsd(String(preset))}>
              ${preset}
            </button>
          ))}
        </div>
        <label>
          <span>Custom USD Amount</span>
          <input
            type="number"
            min="0.5"
            step="0.01"
            value={amountUsd}
            onChange={(ev) => setAmountUsd(ev.target.value)}
            placeholder="Enter USD amount"
          />
        </label>
        <p className="wallet-form-hint">
          {configLoading
            ? 'Loading conversion rate…'
            : `You will receive ${formatThonAmount(thonPreview)} (${thonPerUsd} Thon per $1 USD)`}
        </p>
        {message ? <p className="wallet-form-message">{message}</p> : null}
        <button type="submit" className="wallet-btn wallet-btn--primary" disabled={submitting || configLoading}>
          {submitting ? 'Redirecting to checkout…' : `Add Balance via ${selected.label}`}
        </button>
      </form>

      <section className="wallet-card wallet-sub-panel">
        <h3>Recent Top-Ups</h3>
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
                  <strong className="wallet-tx-amount--pos">{formatThonAmount(row.amount, { signed: true })}</strong>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </WalletSubpageShell>
  );
}
