import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { JobsCategoryPicker } from '../../../Gigs/components/filters';
import {
  CAREER_LEVELS,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  JOB_DESCRIPTION_PLACEHOLDER,
} from '../createJobAlertConstants';
import { ChipGroup } from '../jobAlertStepShared';
import { JobAlertNativeSelect, JobAlertSelectOption } from '../jobAlertSelectHelpers';

export default function JobAlertStepJobDetails({ form, patch, toggleChip, salaryBounds }) {
  const salMin = salaryBounds?.min ?? 40;
  const salMax = salaryBounds?.max ?? 200;
  return (
    <section className="ja-panel" aria-labelledby="ja-step-job-details-title">
      <h2 id="ja-step-job-details-title" className="ja-panel__title">
        Job Details
      </h2>
      <p className="ja-panel__sub">Define the role and compensation range for your alert.</p>

      <label className="ja-field">
        <span className="ja-label">Job Title / Role</span>
        <input
          type="text"
          className="ja-input"
          placeholder="e.g. Frontend Developer, UI/UX Designer"
          value={form.jobTitle}
          onChange={(e) => patch({ jobTitle: e.target.value })}
        />
      </label>

      <label className="ja-field">
        <span className="ja-label">About Job Description</span>
        <textarea
          className="ja-input ja-textarea"
          rows={4}
          maxLength={600}
          placeholder={JOB_DESCRIPTION_PLACEHOLDER}
          value={form.jobDescription}
          onChange={(e) => patch({ jobDescription: e.target.value })}
        />
      </label>

      <ChipGroup
        label="Employment Type"
        options={EMPLOYMENT_TYPES}
        value={form.employmentType}
        onChange={(v) => toggleChip('employmentType', v)}
      />

      <ChipGroup
        label="Experience Level"
        options={EXPERIENCE_LEVELS}
        value={form.experienceLevel}
        onChange={(v) => toggleChip('experienceLevel', v)}
      />

      <div className="ja-field">
        <span className="ja-label">Job Category</span>
        <JobsCategoryPicker
          value={form.jobCategory}
          onChange={(name) => patch({ jobCategory: name })}
        />
      </div>

      <label className="ja-field">
        <span className="ja-label">Career Level</span>
        <div className="ja-select-wrap">
          <JobAlertNativeSelect
            value={form.careerLevel}
            onChange={(e) => patch({ careerLevel: e.target.value })}
          >
            {CAREER_LEVELS.map((o) => (
              <JobAlertSelectOption key={o} value={o}>
                {o}
              </JobAlertSelectOption>
            ))}
          </JobAlertNativeSelect>
          <FiChevronDown className="ja-select-chev" aria-hidden />
        </div>
      </label>

      <div className="ja-field">
        <div className="ja-label-row">
          <span className="ja-label">Salary Range (Optional)</span>
          <span className="ja-salary-val">
            ${form.salaryMin}K – ${form.salaryMax}K
          </span>
        </div>
        <div className="ja-range-dual">
          <input
            type="range"
            min={salMin}
            max={salMax}
            value={form.salaryMin}
            onChange={(e) => {
              const v = Number(e.target.value);
              patch({ salaryMin: Math.min(v, form.salaryMax - 5) });
            }}
            className="ja-range ja-range--min"
            aria-label="Minimum salary"
          />
          <input
            type="range"
            min={salMin}
            max={salMax}
            value={form.salaryMax}
            onChange={(e) => {
              const v = Number(e.target.value);
              patch({ salaryMax: Math.max(v, form.salaryMin + 5) });
            }}
            className="ja-range ja-range--max"
            aria-label="Maximum salary"
          />
        </div>
        <div className="ja-range-labels">
          <span>${salMin}K</span>
          <span>${salMax}K+</span>
        </div>
      </div>
    </section>
  );
}
