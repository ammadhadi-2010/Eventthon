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

function PreviewTagList({ items, emptyLabel }) {
  if (!items?.length) {
    return <p className="ja-step6-row__value">{emptyLabel}</p>;
  }
  return (
    <div className="ja-step6-tags">
      {items.map((item) => (
        <span key={item} className="ja-step6-tag">{item}</span>
      ))}
    </div>
  );
}

function channelLabel(enabled) {
  return enabled ? 'Enabled' : 'Disabled';
}

export default function JobAlertCompletePreview({ form, submitting, onCreate, onSaveDraft }) {
  return (
    <section className="ja-panel ja-step6-preview" aria-labelledby="ja-step6-preview-title">
      <header className="ja-step6-preview__head">
        <h2 id="ja-step6-preview-title" className="ja-panel__title">Final Review — All Alert Data</h2>
        <p className="ja-panel__sub">Confirm every field from steps 1–5 before publishing.</p>
      </header>

      <PreviewSection title="A · Job Identity">
        <PreviewRow label="Job Title" value={form.jobTitle} />
        <p className="ja-step6-desc">
          <span className="ja-step6-row__label">Description</span>
          <span className="ja-step6-desc__text">{form.jobDescription?.trim() || '—'}</span>
        </p>
        <PreviewRow label="Employment Type" value={form.employmentType} />
        <PreviewRow label="Experience Level" value={form.experienceLevel} />
        <PreviewRow label="Career Level" value={form.careerLevel} />
        <PreviewRow label="Job Category" value={form.jobCategory} />
        <PreviewRow label="Salary Range" value={`$${form.salaryMin}K – $${form.salaryMax}K`} />
      </PreviewSection>

      <PreviewSection title="B · Targeting & Skills">
        <p className="ja-step6-row__label">Skills</p>
        <PreviewTagList items={form.skills} emptyLabel="No skills added" />
        <p className="ja-step6-row__label ja-step6-row__label--spaced">Keywords</p>
        <PreviewTagList items={form.keywords} emptyLabel="No keywords added" />
      </PreviewSection>

      <PreviewSection title="C · Location Matrix">
        <PreviewRow label="Work Mode" value={form.workMode} />
        <PreviewRow label="Preferred Location" value={form.location?.trim() || 'Flexible / Remote'} />
        <PreviewRow label="Target Timezone" value={form.timezone} />
      </PreviewSection>

      <PreviewSection title="D · Preferences">
        <PreviewRow label="Company Size" value={form.companySize} />
        <PreviewRow label="Match Strictness" value={form.matchStrictness} />
      </PreviewSection>

      <PreviewSection title="E · Frequency & Channels">
        <PreviewRow label="Alert Frequency" value={form.alertFrequency} />
        <PreviewRow label="Notification Email" value={form.notificationEmail} />
        <PreviewRow label="Email Notifications" value={channelLabel(form.emailNotifications)} />
        <PreviewRow label="In-App / Mobile Alerts" value={channelLabel(form.pushNotifications)} />
        <PreviewRow label="Weekly Summary" value={channelLabel(form.weeklySummary)} />
      </PreviewSection>

      <footer className="ja-step6-actions">
        <button
          type="button"
          onClick={onCreate}
          disabled={submitting}
          className="ja-step6-publish bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg"
        >
          {submitting ? 'Publishing...' : 'Confirm & Publish Alert'}
        </button>
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={submitting}
          className="ja-step6-draft"
        >
          Save Draft
        </button>
      </footer>
    </section>
  );
}
