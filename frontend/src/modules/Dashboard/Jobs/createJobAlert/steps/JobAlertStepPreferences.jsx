import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { JobAlertNativeSelect, JobAlertSelectOption } from '../jobAlertSelectHelpers';

export default function JobAlertStepPreferences({ form, patch }) {
  return (
    <section className="ja-panel" aria-labelledby="ja-step-preferences-title">
      <h2 id="ja-step-preferences-title" className="ja-panel__title">
        Preferences
      </h2>
      <p className="ja-panel__sub">Tune how strictly we match jobs to your profile.</p>

      <label className="ja-field">
        <span className="ja-label">Company Size</span>
        <div className="ja-select-wrap">
          <JobAlertNativeSelect
            value={form.companySize}
            onChange={(e) => patch({ companySize: e.target.value })}
          >
            <JobAlertSelectOption value="Any">Any size</JobAlertSelectOption>
            <JobAlertSelectOption value="Startup">Startup (1–50)</JobAlertSelectOption>
            <JobAlertSelectOption value="Mid">Mid-size (51–500)</JobAlertSelectOption>
            <JobAlertSelectOption value="Enterprise">Enterprise (500+)</JobAlertSelectOption>
          </JobAlertNativeSelect>
          <FiChevronDown className="ja-select-chev" aria-hidden />
        </div>
      </label>

      <label className="ja-field">
        <span className="ja-label">Match Strictness</span>
        <div className="ja-select-wrap">
          <JobAlertNativeSelect
            value={form.matchStrictness}
            onChange={(e) => patch({ matchStrictness: e.target.value })}
          >
            <JobAlertSelectOption value="Relaxed">Relaxed — more results</JobAlertSelectOption>
            <JobAlertSelectOption value="Balanced">Balanced</JobAlertSelectOption>
            <JobAlertSelectOption value="Strict">Strict — only top matches</JobAlertSelectOption>
          </JobAlertNativeSelect>
          <FiChevronDown className="ja-select-chev" aria-hidden />
        </div>
      </label>
    </section>
  );
}
