import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { DONATION_PRESET_AMOUNTS } from '../donationData';
import { logDonationIntent } from '../donationApi';
import { readStoredUserStub } from '../../../utils/storedUser';
import { getUserDisplayName } from '../../Dashboard/utils/dashboardMedia';

function resolveFinalAmount(custom, amount) {
  const parsed = Number(custom);
  if (custom && Number.isFinite(parsed) && parsed > 0) return Math.round(parsed);
  return Number(amount) || 0;
}

export default function DonateModal({ open, organization, onClose, presetAmounts = DONATION_PRESET_AMOUNTS }) {
  const amounts = Array.isArray(presetAmounts) && presetAmounts.length ? presetAmounts : DONATION_PRESET_AMOUNTS;
  const [amount, setAmount] = useState(amounts[1] || amounts[0]);
  const [custom, setCustom] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setAmount(amounts[1] || amounts[0]);
      setCustom('');
      setError('');
      setSubmitting(false);
    }
  }, [open, amounts]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose, submitting]);

  if (!open || !organization) return null;

  const finalAmount = resolveFinalAmount(custom, amount);
  const canProceed = finalAmount >= 100 && Boolean(organization.website);

  const proceed = async () => {
    if (!canProceed || submitting) return;
    setSubmitting(true);
    setError('');

    const user = readStoredUserStub();
    const userName = getUserDisplayName(user) || localStorage.getItem('userName') || '';

    try {
      await logDonationIntent({
        organizationId: organization.id,
        organizationName: organization.name,
        amountThon: finalAmount,
        userEmail: user?.email || localStorage.getItem('userEmail') || '',
        userName,
      });
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Could not log donation. You can still continue to the organization site.');
    } finally {
      setSubmitting(false);
    }

    if (organization.website) {
      window.open(organization.website, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  return createPortal(
    <div className="donate-modal" role="presentation" onClick={() => !submitting && onClose()}>
      <div
        className="donate-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donate-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="donate-modal__head">
          <div>
            <h2 id="donate-modal-title">Donate to {organization.name}</h2>
            <p>Select an amount in Thon. You&apos;ll complete payment on the verified organization site.</p>
          </div>
          <button type="button" className="donate-modal__close" onClick={onClose} disabled={submitting} aria-label="Close">
            <FiX size={18} />
          </button>
        </header>

        <div className="donate-modal__amounts">
          {amounts.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`donate-modal__amount${!custom && amount === preset ? ' is-active' : ''}`}
              onClick={() => {
                setCustom('');
                setAmount(preset);
                setError('');
              }}
              disabled={submitting}
            >
              {preset.toLocaleString()} Thon
            </button>
          ))}
        </div>

        <label className="donate-modal__custom">
          <span>Custom amount (min 100 Thon)</span>
          <input
            type="number"
            min="100"
            step="100"
            placeholder="Enter Thon amount"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setError('');
            }}
            disabled={submitting}
          />
        </label>

        <p className="donate-modal__note">
          Selected: <strong>{finalAmount > 0 ? finalAmount.toLocaleString() : '—'} Thon</strong>
        </p>

        {error ? <p className="donate-modal__error" role="alert">{error}</p> : null}

        <button
          type="button"
          className="donate-modal__cta"
          onClick={proceed}
          disabled={!canProceed || submitting}
        >
          {submitting ? 'Opening…' : `Continue to ${organization.name.split(' ')[0]}`}
        </button>

        {!organization.website ? (
          <p className="donate-modal__error">This organization has no website configured yet.</p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
