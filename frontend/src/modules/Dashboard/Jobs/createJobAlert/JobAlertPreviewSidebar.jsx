import React from 'react';
import { FiBell, FiBriefcase, FiCheck, FiClock, FiMapPin } from 'react-icons/fi';
import { BusinessIcon, BUSINESS_LOTTIE } from '../../../../components/lottie';

function Toggle({ checked, onChange, label, sub }) {
  return (
    <label className="ja-toggle-row">
      <div className="ja-toggle-copy">
        <span>{label}</span>
        {sub ? <small>{sub}</small> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`ja-toggle${checked ? ' is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="ja-toggle__knob" />
      </button>
    </label>
  );
}

export default function JobAlertPreviewSidebar({
  form,
  patch,
  estimatedMatches,
  submitting = false,
  onCreate,
  onSaveDraft,
}) {
  const title = form.jobTitle.trim() || 'Frontend Developer';
  const extraSkills = Math.max(0, form.skills.length - 3);
  const descriptionPreview = form.jobDescription?.trim();

  return (
    <aside className="ja-preview-stack">
      <div className="ja-preview-card gigs-card">
        <div className="ja-preview-card__head">
          <span className="ja-preview-bell" aria-hidden>
            <FiBell size={18} />
          </span>
          <div>
            <h3 className="ja-preview-title">
              {title}
              <FiCheck className="ja-preview-check" aria-hidden />
            </h3>
            <p className="ja-preview-meta">
              {form.jobCategory} · {form.careerLevel}
            </p>
            {descriptionPreview ? (
              <p className="ja-preview-desc">{descriptionPreview}</p>
            ) : null}
          </div>
        </div>

        <div className="ja-preview-pills">
          <span>
            <FiBriefcase size={12} /> {form.employmentType}
          </span>
          <span>
            <FiMapPin size={12} /> {form.location?.trim() ? form.location : form.workMode}
          </span>
          <span>
            <FiClock size={12} /> {form.experienceLevel}
          </span>
        </div>

        <p className="ja-preview-salary">
          ${form.salaryMin}K – ${form.salaryMax}K
        </p>

        <div className="ja-preview-skills">
          {form.skills.slice(0, 3).map((s) => (
            <span key={s}>{s}</span>
          ))}
          {extraSkills > 0 ? <span className="ja-preview-more">+{extraSkills} more</span> : null}
        </div>
      </div>

      <div className="ja-preview-card gigs-card">
        <h4 className="ja-preview-section-title">Notification Channels</h4>
        <Toggle
          label="Email Notifications"
          sub={form.notificationEmail}
          checked={form.emailNotifications}
          onChange={(v) => patch({ emailNotifications: v })}
        />
        <Toggle
          label="In-App Notifications"
          sub="Push alerts inside EventThon"
          checked={form.pushNotifications}
          onChange={(v) => patch({ pushNotifications: v })}
        />
        <Toggle
          label="Weekly Summary"
          sub="Every Monday at 9:00 AM"
          checked={form.weeklySummary}
          onChange={(v) => patch({ weeklySummary: v })}
        />
      </div>

      <div className="ja-preview-card gigs-card ja-estimated">
        <div className="ja-estimated__copy">
          <p className="ja-estimated__label">Estimated Matches</p>
          <p className="ja-estimated__range">
            {estimatedMatches.low} – {estimatedMatches.high}
          </p>
          <p className="ja-estimated__sub">high-match jobs per week</p>
          <div className="ja-estimated__spark" aria-hidden />
        </div>
        <div className="ja-estimated__icon" aria-hidden>
          <BusinessIcon src={BUSINESS_LOTTIE.target} size={40} label="Estimated matches animation" />
        </div>
      </div>

      <button type="button" className="ja-create-btn" onClick={onCreate} disabled={submitting}>
        {submitting ? 'Creating…' : 'Create Alert'}
      </button>
      <button type="button" className="ja-draft-btn" onClick={onSaveDraft} disabled={submitting}>
        Save as Draft
      </button>
    </aside>
  );
}
