import React from 'react';
import { ChipGroup } from '../../jobAlertStepShared';
import { BUDGET_MODELS } from '../opportunityConstants';

export default function OppStepBudget({ form, patch, toggleChip }) {
  const model = form.budgetModel || 'Negotiable';
  const showAmount = model === 'Fixed' || model === 'Hourly';
  const showEquity = model === 'Equity';

  return (
    <section className="ja-panel" aria-labelledby="opp-step-budget-title">
      <h2 id="opp-step-budget-title" className="ja-panel__title">
        Budget
      </h2>
      <p className="ja-panel__sub">Choose how this opportunity is compensated.</p>

      <ChipGroup
        label="Budget Type"
        options={BUDGET_MODELS}
        value={model}
        onChange={(v) => toggleChip('budgetModel', v)}
      />

      {showAmount ? (
        <label className="ja-field">
          <span className="ja-label">{model === 'Hourly' ? 'Hourly Rate' : 'Fixed Budget'}</span>
          <input
            type="text"
            className="ja-input"
            placeholder={model === 'Hourly' ? 'e.g. $25/hr' : 'e.g. $500'}
            value={form.budgetAmount || ''}
            onChange={(e) => patch({ budgetAmount: e.target.value })}
            maxLength={40}
          />
        </label>
      ) : null}

      {showEquity ? (
        <label className="ja-field">
          <span className="ja-label">Equity Share</span>
          <input
            type="text"
            className="ja-input"
            placeholder="e.g. 1–2% equity"
            value={form.equityShare || ''}
            onChange={(e) => patch({ equityShare: e.target.value })}
            maxLength={40}
          />
        </label>
      ) : null}

      {model === 'Unpaid' || model === 'Negotiable' ? (
        <p className="ja-panel__sub" style={{ marginTop: 4 }}>
          {model === 'Unpaid'
            ? 'This opportunity will show as unpaid / volunteer-friendly.'
            : 'Budget can be discussed with applicants after they apply.'}
        </p>
      ) : null}
    </section>
  );
}
