import React from 'react';
import { ChipGroup } from '../../jobAlertStepShared';
import { DURATION_OPTIONS, WORK_MODES } from '../opportunityConstants';

export default function OppStepTiming({ form, patch, toggleChip }) {
  return (
    <section className="ja-panel" aria-labelledby="opp-step-timing-title">
      <h2 id="opp-step-timing-title" className="ja-panel__title">
        Timing & Location
      </h2>
      <p className="ja-panel__sub">Set duration, work style, and an optional deadline.</p>

      <ChipGroup
        label="Duration"
        options={DURATION_OPTIONS}
        value={form.duration}
        onChange={(v) => toggleChip('duration', v)}
      />

      <ChipGroup
        label="Remote / Onsite / Hybrid"
        options={WORK_MODES}
        value={form.workMode}
        onChange={(v) => toggleChip('workMode', v)}
      />

      <label className="ja-field">
        <span className="ja-label">Deadline (Optional)</span>
        <input
          type="date"
          className="ja-input"
          value={form.deadline || ''}
          onChange={(e) => patch({ deadline: e.target.value })}
        />
      </label>
    </section>
  );
}
