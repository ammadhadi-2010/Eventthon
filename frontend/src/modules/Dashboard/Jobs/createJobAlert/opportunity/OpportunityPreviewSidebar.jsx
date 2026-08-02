import React from 'react';
import { FiBriefcase, FiCheck, FiClock, FiMapPin, FiUsers } from 'react-icons/fi';
import JobCompanyLogo from '../../components/JobCompanyLogo';

function budgetLabel(form) {
  const model = form.budgetModel || 'Negotiable';
  if (model === 'Fixed' || model === 'Hourly') {
    return `${model} · ${form.budgetAmount || '—'}`;
  }
  if (model === 'Equity') return `Equity · ${form.equityShare || '—'}`;
  return model;
}

export default function OpportunityPreviewSidebar({
  form,
  submitting = false,
  onCreate,
  onSaveDraft,
  submitLabel = 'Publish Opportunity',
}) {
  const title = form.jobTitle.trim() || 'Your opportunity title';
  const skills = form.skills || [];
  const extraSkills = Math.max(0, skills.length - 3);
  const descriptionPreview = form.jobDescription?.trim();

  return (
    <aside className="ja-preview-stack">
      <div className="ja-preview-card gigs-card">
        <div className="ja-preview-card__head">
          <JobCompanyLogo
            company={title}
            logoText={title.slice(0, 1)}
            listingKind="opportunity"
            shade="electric"
            className="ja-preview-logo"
          />
          <div>
            <h3 className="ja-preview-title">
              {title}
              <FiCheck className="ja-preview-check" aria-hidden />
            </h3>
            <p className="ja-preview-meta">
              {form.opportunityType || 'Opportunity'} · {form.jobCategory || 'Category'}
            </p>
            {descriptionPreview ? (
              <p className="ja-preview-desc">{descriptionPreview}</p>
            ) : null}
          </div>
        </div>

        <div className="ja-preview-pills">
          <span><FiBriefcase size={12} /> {budgetLabel(form)}</span>
          <span><FiClock size={12} /> {form.duration || 'Duration'}</span>
          <span><FiMapPin size={12} /> {form.workMode || 'Remote'}</span>
          <span><FiUsers size={12} /> {form.peopleNeeded || 1} needed</span>
        </div>

        <p className="ja-preview-salary">{budgetLabel(form)}</p>

        {skills.length ? (
          <div className="ja-preview-skills">
            {skills.slice(0, 3).map((s) => (
              <span key={s}>{s}</span>
            ))}
            {extraSkills > 0 ? <span className="ja-preview-more">+{extraSkills} more</span> : null}
          </div>
        ) : null}
      </div>

      <button type="button" className="ja-create-btn" onClick={onCreate} disabled={submitting}>
        {submitting ? 'Working…' : submitLabel}
      </button>
      <button type="button" className="ja-draft-btn" onClick={onSaveDraft} disabled={submitting}>
        Save as Draft
      </button>
    </aside>
  );
}
