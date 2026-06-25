import React from 'react';
import { FiBell, FiBriefcase, FiCheck, FiClock, FiMapPin } from 'react-icons/fi';
import { BusinessIcon, BUSINESS_LOTTIE } from '../../../../../components/lottie';
import JobPreviewToggle from './JobPreviewToggle';
import { buildJobPreviewMilestones } from './jobPreviewMilestones';

export function JobPreviewOverviewPage({ form }) {
  const title = form.jobTitle.trim() || 'Untitled Role';
  const description = form.jobDescription?.trim() || 'Add a description on step 1 to preview it here.';
  return (
    <div className="jpw-page jpw-page--overview">
      <div className="jpw-page__hero">
        <span className="jpw-page__icon" aria-hidden><FiBriefcase size={18} /></span>
        <div>
          <h3 className="jpw-page__title">{title}</h3>
          <p className="jpw-page__meta">{form.jobCategory} · {form.careerLevel}</p>
        </div>
      </div>
      <p className="jpw-page__body">{description}</p>
      <div className="jpw-badge-row">
        <span className="jpw-badge jpw-badge--violet">{form.employmentType}</span>
        <span className="jpw-badge jpw-badge--cyan">{form.experienceLevel}</span>
      </div>
    </div>
  );
}

export function JobPreviewBudgetPage({ form }) {
  return (
    <div className="jpw-page jpw-page--budget">
      <h3 className="jpw-page__heading">Compensation Package</h3>
      <p className="jpw-salary-range">${form.salaryMin}K – ${form.salaryMax}K</p>
      <div className="jpw-badge-row">
        <span className="jpw-badge jpw-badge--green">USD Annual</span>
        <span className="jpw-badge jpw-badge--blue">{form.employmentType}</span>
        <span className="jpw-badge jpw-badge--pink">{form.workMode}</span>
      </div>
      <ul className="jpw-checklist">
        <li>Salary band synced with alert filters</li>
        <li>Range updates live from step 1 sliders</li>
        <li>Currency badge shown on matched listings</li>
      </ul>
    </div>
  );
}

export function JobPreviewRequirementsPage({ form }) {
  const skills = form.skills?.length ? form.skills : ['Add skills on step 2'];
  const keywords = form.keywords?.length ? form.keywords : [];
  return (
    <div className="jpw-page jpw-page--requirements">
      <h3 className="jpw-page__heading">Core Requirements</h3>
      <p className="jpw-page__sub">Mandatory skills & match keywords</p>
      <div className="jpw-tag-grid">
        {skills.map((skill) => (
          <span key={skill} className="jpw-skill-tag">{skill}</span>
        ))}
      </div>
      {keywords.length ? (
        <>
          <p className="jpw-page__label">Keywords</p>
          <div className="jpw-tag-grid jpw-tag-grid--soft">
            {keywords.map((word) => (
              <span key={word} className="jpw-keyword-tag">{word}</span>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function JobPreviewMilestonesPage({ form }) {
  const milestones = buildJobPreviewMilestones(form);
  return (
    <div className="jpw-page jpw-page--milestones">
      <h3 className="jpw-page__heading">Milestones & Timeline</h3>
      <ol className="jpw-timeline">
        {milestones.map((item, index) => (
          <li key={item.id} className={`jpw-timeline__item jpw-timeline__item--${item.tone}`}>
            <span className="jpw-timeline__index">{index + 1}</span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.window} · {item.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function JobPreviewScreeningPage({ form, patch }) {
  return (
    <div className="jpw-page jpw-page--screening">
      <h3 className="jpw-page__heading">Screening & Application Settings</h3>
      <div className="jpw-screen-grid">
        <div><span>Work mode</span><strong>{form.workMode}</strong></div>
        <div><span>Location</span><strong>{form.location?.trim() || 'Flexible'}</strong></div>
        <div><span>Timezone</span><strong>{form.timezone}</strong></div>
        <div><span>Alert frequency</span><strong>{form.alertFrequency}</strong></div>
      </div>
      <div className="jpw-toggle-stack">
        <JobPreviewToggle
          label="Email Notifications"
          sub={form.notificationEmail || 'you@company.com'}
          checked={form.emailNotifications}
          onChange={(v) => patch({ emailNotifications: v })}
        />
        <JobPreviewToggle
          label="In-App Notifications"
          sub="Push alerts inside EventThon"
          checked={form.pushNotifications}
          onChange={(v) => patch({ pushNotifications: v })}
        />
        <JobPreviewToggle
          label="Weekly Summary"
          sub="Every Monday at 9:00 AM"
          checked={form.weeklySummary}
          onChange={(v) => patch({ weeklySummary: v })}
        />
      </div>
    </div>
  );
}

export function JobPreviewFinalPage({ form, estimatedMatches, submitting, onCreate, onSaveDraft }) {
  const title = form.jobTitle.trim() || 'Frontend Developer';
  return (
    <div className="jpw-page jpw-page--final">
      <div className="jpw-final-grid">
        <div className="jpw-final-card">
          <div className="jpw-final-card__head">
            <span className="jpw-page__icon" aria-hidden><FiBell size={18} /></span>
            <div>
              <h3>{title}<FiCheck className="jpw-final-check" aria-hidden /></h3>
              <p>{form.jobCategory} · {form.careerLevel}</p>
            </div>
          </div>
          <div className="jpw-final-pills">
            <span><FiBriefcase size={12} /> {form.employmentType}</span>
            <span><FiMapPin size={12} /> {form.location?.trim() || form.workMode}</span>
            <span><FiClock size={12} /> {form.experienceLevel}</span>
          </div>
          <p className="jpw-salary-range jpw-salary-range--compact">${form.salaryMin}K – ${form.salaryMax}K</p>
        </div>
        <div className="jpw-final-card jpw-final-card--stats">
          <p className="jpw-estimated__label">Estimated Matches</p>
          <p className="jpw-estimated__range">{estimatedMatches.low} – {estimatedMatches.high}</p>
          <p className="jpw-estimated__sub">high-match jobs per week</p>
          <div className="jpw-estimated__icon" aria-hidden>
            <BusinessIcon src={BUSINESS_LOTTIE.target} size={36} label="" />
          </div>
        </div>
      </div>
      <button type="button" className="jpw-publish-btn" onClick={onCreate} disabled={submitting}>
        {submitting ? 'Publishing…' : 'Publish Job Alert'}
      </button>
      <button type="button" className="jpw-draft-btn" onClick={onSaveDraft} disabled={submitting}>
        Save as Draft
      </button>
    </div>
  );
}
