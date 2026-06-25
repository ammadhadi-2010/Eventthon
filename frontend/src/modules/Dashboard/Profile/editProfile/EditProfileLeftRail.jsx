import React from 'react';
import { FiBookOpen } from 'react-icons/fi';
import { EDIT_PROFILE_STEPS } from './editProfileSteps';
import './editProfileLayout.css';

const EditProfileLeftRail = ({ activeIndex, onSelectStep, completionPct }) => (
  <aside className="ep-left-rail ep-root">
    <div className="ep-left-rail__brand">
      <div className="ep-left-rail__logo">ET</div>
      <div className="ep-left-rail__brand-text">
        <span className="ep-left-rail__brand-name">EventThon</span>
        <h2 className="ep-left-rail__title">Edit profile</h2>
        <p className="ep-left-rail__subtitle">
          Complete your profile to unlock trust badges and better discovery.
        </p>
      </div>
    </div>

    <nav className="ep-left-rail__nav" aria-label="Profile wizard steps">
      {EDIT_PROFILE_STEPS.map((step, idx) => {
        const active = idx === activeIndex;
        const done = idx < activeIndex;
        return (
          <button
            key={step.id}
            type="button"
            data-ep-step={step.id}
            onClick={() => onSelectStep(idx)}
            className={`ep-left-rail__step ${active ? 'ep-left-rail__step--active' : ''} ${done && !active ? 'ep-left-rail__step--done' : ''}`}
          >
            <span className="ep-left-rail__step-num">{done ? '✓' : idx + 1}</span>
            <span className="ep-left-rail__step-copy">
              <span className="ep-left-rail__step-label">{step.label}</span>
              <span className="ep-left-rail__step-hint">{step.hint}</span>
            </span>
          </button>
        );
      })}
    </nav>

    <div className="ep-left-rail__completion">
      <p className="ep-left-rail__completion-label">Profile completion</p>
      <div className="ep-left-rail__progress-track">
        <div className="ep-left-rail__progress-fill" style={{ width: `${Math.min(100, completionPct)}%` }} />
      </div>
      <p className="ep-left-rail__completion-pct">{completionPct.toFixed(1)}%</p>
    </div>

    <button type="button" className="ep-left-rail__help">
      <FiBookOpen className="ep-left-rail__help-icon" aria-hidden />
      <span className="ep-left-rail__help-text">
        <span className="ep-left-rail__help-line">Need help?</span>
        <span className="ep-left-rail__help-sub">Check our profile guide</span>
      </span>
    </button>
  </aside>
);

export default EditProfileLeftRail;
