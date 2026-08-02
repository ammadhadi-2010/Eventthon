import React from 'react';

function PreviewSection({ title, children }) {
  return (
    <section className="ja-step6-section">
      <h3 className="ja-step6-section__title">{title}</h3>
      <div className="ja-step6-section__body">{children}</div>
    </section>
  );
}

function PreviewRow({ label, value }) {
  return (
    <p className="ja-step6-row">
      <span className="ja-step6-row__label">{label}</span>
      <span className="ja-step6-row__value">{value || '—'}</span>
    </p>
  );
}

function budgetLabel(form) {
  const model = form.budgetModel || 'Negotiable';
  if (model === 'Fixed' || model === 'Hourly') {
    return `${model} · ${form.budgetAmount || '—'}`;
  }
  if (model === 'Equity') return `Equity · ${form.equityShare || '—'}`;
  return model;
}

export default function OpportunityCompletePreview({
  form,
  submitting,
  onCreate,
  onSaveDraft,
  submitLabel = 'Publish Opportunity',
}) {
  return (
    <section className="ja-panel ja-step6-preview" aria-labelledby="opp-preview-title">
      <header className="ja-step6-preview__head">
        <h2 id="opp-preview-title" className="ja-panel__title">Preview & Publish</h2>
        <p className="ja-panel__sub">Confirm your opportunity before submitting for review.</p>
      </header>

      <PreviewSection title="Basics">
        <PreviewRow label="Title" value={form.jobTitle} />
        <PreviewRow label="Category" value={form.jobCategory} />
        <PreviewRow label="Type" value={form.opportunityType} />
      </PreviewSection>

      <PreviewSection title="Details">
        <PreviewRow label="Description" value={form.jobDescription} />
        <PreviewRow
          label="Skills"
          value={(form.skills || []).length ? form.skills.join(', ') : '—'}
        />
        <PreviewRow label="Experience" value={form.experienceLevel} />
      </PreviewSection>

      <PreviewSection title="Budget & Timing">
        <PreviewRow label="Budget" value={budgetLabel(form)} />
        <PreviewRow label="Duration" value={form.duration} />
        <PreviewRow label="Work mode" value={form.workMode} />
        <PreviewRow label="Deadline" value={form.deadline || 'None'} />
      </PreviewSection>

      <PreviewSection title="Team">
        <PreviewRow label="People needed" value={String(form.peopleNeeded ?? 1)} />
        <PreviewRow
          label="Attachments"
          value={(form.attachmentNames || []).length
            ? form.attachmentNames.join(', ')
            : 'None'}
        />
      </PreviewSection>

      <footer className="ja-step6-actions">
        <button
          type="button"
          onClick={onCreate}
          disabled={submitting}
          className="ja-step6-publish bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg"
        >
          {submitting ? 'Publishing…' : submitLabel}
        </button>
        <button type="button" onClick={onSaveDraft} disabled={submitting} className="ja-step6-draft">
          Save Draft
        </button>
      </footer>
    </section>
  );
}
