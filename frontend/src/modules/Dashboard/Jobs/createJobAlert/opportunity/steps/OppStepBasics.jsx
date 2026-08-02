import React from 'react';
import { JobsCategoryPicker } from '../../../../Gigs/components/filters';
import { ChipGroup } from '../../jobAlertStepShared';
import { OPPORTUNITY_TYPES } from '../opportunityConstants';

export default function OppStepBasics({ form, patch, toggleChip }) {
  return (
    <section className="ja-panel" aria-labelledby="opp-step-basics-title">
      <h2 id="opp-step-basics-title" className="ja-panel__title">
        Opportunity Basics
      </h2>
      <p className="ja-panel__sub">Name the opportunity and choose how people will join.</p>

      <label className="ja-field">
        <span className="ja-label">Opportunity Title</span>
        <input
          type="text"
          className="ja-input"
          placeholder="e.g. Need React Developer for 3 Days"
          value={form.jobTitle}
          onChange={(e) => patch({ jobTitle: e.target.value })}
          maxLength={140}
        />
      </label>

      <div className="ja-field">
        <span className="ja-label">Category</span>
        <JobsCategoryPicker
          value={form.jobCategory}
          onChange={(name) => patch({ jobCategory: name })}
        />
      </div>

      <ChipGroup
        label="Opportunity Type"
        options={OPPORTUNITY_TYPES}
        value={form.opportunityType}
        onChange={(v) => toggleChip('opportunityType', v)}
      />
    </section>
  );
}
