import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { WORK_MODES } from '../createJobAlertConstants';
import { ChipGroup } from '../jobAlertStepShared';
import { JobAlertNativeSelect, JobAlertSelectOption } from '../jobAlertSelectHelpers';

export default function JobAlertStepLocation({ form, patch, toggleChip }) {
  return (
    <section className="ja-panel" aria-labelledby="ja-step-location-title">
      <h2 id="ja-step-location-title" className="ja-panel__title">
        Location &amp; Type
      </h2>
      <p className="ja-panel__sub">Set where and how you want to work.</p>

      <ChipGroup
        label="Work Mode"
        options={WORK_MODES}
        value={form.workMode}
        onChange={(v) => toggleChip('workMode', v)}
      />

      <label className="ja-field">
        <span className="ja-label">Preferred Location</span>
        <input
          type="text"
          className="ja-input"
          placeholder="e.g. Karachi, Remote (Global), Lahore"
          value={form.location}
          onChange={(e) => patch({ location: e.target.value })}
        />
      </label>

      <label className="ja-field">
        <span className="ja-label">Timezone</span>
        <div className="ja-select-wrap">
          <JobAlertNativeSelect
            value={form.timezone}
            onChange={(e) => patch({ timezone: e.target.value })}
          >
            <JobAlertSelectOption value="Any">Any timezone</JobAlertSelectOption>
            <JobAlertSelectOption value="PKT">Pakistan (PKT)</JobAlertSelectOption>
            <JobAlertSelectOption value="GST">Gulf (GST)</JobAlertSelectOption>
            <JobAlertSelectOption value="EST">US Eastern</JobAlertSelectOption>
            <JobAlertSelectOption value="GMT">UK / GMT</JobAlertSelectOption>
          </JobAlertNativeSelect>
          <FiChevronDown className="ja-select-chev" aria-hidden />
        </div>
      </label>
    </section>
  );
}
