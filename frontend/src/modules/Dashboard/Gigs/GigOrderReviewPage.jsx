import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiCreditCard, FiDollarSign, FiSmartphone } from 'react-icons/fi';
import API from '../../../api/axiosConfig';
import { derivePackageTiers } from './gigExplorer/constants';
import { runBetaGigInquire } from './gigExplorer/gigBetaInquireFlow';
import { normalizeGig } from './gigExplorer/model';
import { getGigsActorId, getGigsSessionHeaders } from './utils/gigsSession';
import { GigsHubBackButton } from './components/GigsHubBackButton';
import './styles/gigs-hub-back-btn.css';
import './styles/gigs-order-review.css';
import './styles/gigs-order-review-mobile.css';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit Card', hint: 'Visa, Mastercard, Amex', icon: FiCreditCard },
  { id: 'paypal', label: 'PayPal', hint: 'Pay with your PayPal balance', icon: FiDollarSign },
  { id: 'wallet', label: 'Wallet', hint: 'ET Coin wallet balance', icon: FiSmartphone },
];

function money(n) {
  const v = Number(n) || 0;
  return `$${Number.isInteger(v) ? v : v.toFixed(2)}`;
}

export default function GigOrderReviewPage() {
  const { gigId } = useParams();
  const [searchParams] = useSearchParams();
  const packageKey = searchParams.get('package') || 'standard';
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState('card');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await API.get(`/api/gigs/${encodeURIComponent(gigId)}`, {
          headers: getGigsSessionHeaders(),
        });
        const raw = res?.data?.gig || res?.data;
        if (!cancelled) setGig(raw ? normalizeGig(raw) : null);
      } catch {
        if (!cancelled) setGig(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [gigId]);

  const tier = useMemo(() => {
    if (!gig) return null;
    const tiers = derivePackageTiers(gig);
    return tiers.find((t) => t.key === packageKey) || tiers[0];
  }, [gig, packageKey]);

  const subtotal = tier?.price ?? 0;
  const serviceFee = Math.round(subtotal * 0.05 * 100) / 100;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + serviceFee + tax;

  const completeOrder = async () => {
    if (!gig || busy) return;
    setBusy(true);
    const buyerId = getGigsActorId();
    const result = await runBetaGigInquire({
      selectedGig: gig,
      buyerId,
      packageTier: tier?.key || packageKey,
      navigate,
    });
    if (result.toast) setToast(result.toast);
    setBusy(false);
  };

  const goBack = () => {
    if (gig?.id) {
      navigate(`/gigs/explorer?gig=${encodeURIComponent(gig.id)}`);
      return;
    }
    navigate('/gigs');
  };

  const backBtn = <GigsHubBackButton onBack={goBack} />;

  if (loading) {
    return (
      <div className="gigs-page gor-page">
        <div className="gor-head-row">{backBtn}<p className="gor-sub">Loading order review…</p></div>
      </div>
    );
  }

  if (!gig || !tier) {
    return (
      <div className="gigs-page gor-page">
        <div className="gor-head-row">{backBtn}</div>
        <p className="gor-sub">This gig could not be loaded for checkout.</p>
      </div>
    );
  }

  const deliveryLabel = `${tier.delivery} day${tier.delivery === 1 ? '' : 's'} delivery`;

  return (
    <div className="gigs-page gor-page">
      <header className="gor-head">
        <div className="gor-head-row">
          {backBtn}
          <div className="gor-head-copy">
            <h1 className="gor-title">Review your order</h1>
            <p className="gor-sub">Confirm package details and payment method before continuing.</p>
          </div>
        </div>
      </header>

      {toast ? <p className="gor-toast">{toast}</p> : null}

      <div className="gor-layout">
        <div className="gor-main">
          <section className="gor-card" aria-label="Order items">
            <h2 className="gor-section-title">Order items</h2>
            <article className="gor-item">
              {gig.imageurl ? (
                <img src={gig.imageurl} alt="" className="gor-item-thumb" />
              ) : (
                <div className="gor-item-thumb gor-item-thumb--placeholder" aria-hidden>
                  {(gig.sellerAvatarInitial || 'G').slice(0, 2)}
                </div>
              )}
              <div className="gor-item-body">
                <h3 className="gor-item-title">{gig.title}</h3>
                <p className="gor-sub">{tier.label} package · Qty 1</p>
                <p className="gor-sub">{deliveryLabel}</p>
                <p className="gor-item-price">{money(subtotal)}</p>
              </div>
            </article>
          </section>

          <section className="gor-card" aria-label="Payment method">
            <h2 className="gor-section-title">Payment method</h2>
            <div className="gor-pay-list" role="radiogroup" aria-label="Select payment method">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const active = payment === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`gor-pay-option${active ? ' is-active' : ''}`}
                    onClick={() => setPayment(method.id)}
                  >
                    <span className="gor-pay-radio" aria-hidden />
                    <Icon size={18} aria-hidden />
                    <span className="gor-pay-copy">
                      <strong>{method.label}</strong>
                      <small>{method.hint}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="gor-summary" aria-label="Billing summary">
          <div className="gor-summary-card">
            <h2 className="gor-section-title">Order summary</h2>
            <div className="gor-summary-line">
              <span className="gor-sub">Subtotal</span>
              <span className="gor-price-strong">{money(subtotal)}</span>
            </div>
            <div className="gor-summary-line">
              <span className="gor-sub">Service fee</span>
              <span className="gor-price-strong">{money(serviceFee)}</span>
            </div>
            <div className="gor-summary-line">
              <span className="gor-sub">Tax</span>
              <span className="gor-price-strong">{money(tax)}</span>
            </div>
            <div className="gor-summary-line gor-summary-line--total">
              <span className="gor-title">Total</span>
              <span className="gor-price-strong">{money(total)}</span>
            </div>
            <p className="gor-sub">Estimated delivery: {deliveryLabel}</p>
            <button type="button" className="gor-submit" disabled={busy} onClick={completeOrder}>
              {busy ? 'Processing…' : 'Complete order'}
            </button>
            <p className="gor-beta-note">Beta launch — payment is deferred; you will continue in Messages.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
