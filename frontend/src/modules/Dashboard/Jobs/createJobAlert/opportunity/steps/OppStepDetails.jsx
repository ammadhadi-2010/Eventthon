import React from 'react';
import { FiChevronDown, FiPlus } from 'react-icons/fi';
import { TagList } from '../../jobAlertStepShared';
import { JobAlertNativeSelect, JobAlertSelectOption } from '../../jobAlertSelectHelpers';
import { EXPERIENCE_OPTIONS, OPPORTUNITY_DESC_PLACEHOLDER } from '../opportunityConstants';

export default function OppStepDetails({ form, patch, addTag, removeTag }) {
  const onSkillKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag('skills', 'skillInput', form.skillInput);
    }
  };

  return (
    <section className="ja-panel" aria-labelledby="opp-step-details-title">
      <h2 id="opp-step-details-title" className="ja-panel__title">
        Description & Skills
      </h2>
      <p className="ja-panel__sub">Explain the ask and what skills you need.</p>

      <label className="ja-field">
        <span className="ja-label">Description</span>
        <textarea
          className="ja-input ja-textarea"
          rows={5}
          maxLength={2000}
          placeholder={OPPORTUNITY_DESC_PLACEHOLDER}
          value={form.jobDescription}
          onChange={(e) => patch({ jobDescription: e.target.value })}
        />
      </label>

      <div className="ja-field">
        <span className="ja-label">Required Skills</span>
        <TagList tags={form.skills || []} onRemove={(t) => removeTag('skills', t)} />
        <div className="ja-tag-add-row">
          <input
            type="text"
            className="ja-input"
            placeholder="Add a skill"
            value={form.skillInput || ''}
            onChange={(e) => patch({ skillInput: e.target.value })}
            onKeyDown={onSkillKey}
          />
          <button
            type="button"
            className="ja-tag-add-btn"
            onClick={() => addTag('skills', 'skillInput', form.skillInput)}
          >
            <FiPlus size={14} /> Add Skill
          </button>
        </div>
      </div>

      <label className="ja-field">
        <span className="ja-label">Experience (Optional)</span>
        <div className="ja-select-wrap">
          <JobAlertNativeSelect
            value={form.experienceLevel || 'Any'}
            onChange={(e) => patch({ experienceLevel: e.target.value })}
          >
            {EXPERIENCE_OPTIONS.map((o) => (
              <JobAlertSelectOption key={o} value={o}>{o}</JobAlertSelectOption>
            ))}
          </JobAlertNativeSelect>
          <FiChevronDown className="ja-select-chev" aria-hidden />
        </div>
      </label>
    </section>
  );
}
