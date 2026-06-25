import React from 'react';
import { WIZARD_STEPS } from './data/createProjectWizardData';

export default function StepIndicator({ currentStep }) {
  return (
    <nav className="cp-steps" aria-label="Create project progress">
      {WIZARD_STEPS.map((step, index) => {
        const done = step.id < currentStep;
        const active = step.id === currentStep;
        const isLast = index === WIZARD_STEPS.length - 1;
        return (
          <div key={step.id} className={`cp-step${active ? ' is-active' : ''}${done ? ' is-done' : ''}`} data-cp-step={step.id}>
            <div className="cp-step__node">
              <span className="cp-step__num">{done ? '✓' : step.id}</span>
              <span className="cp-step__label">{step.label}</span>
            </div>
            {!isLast ? <div className={`cp-step__line${done || active ? ' is-filled' : ''}`} aria-hidden /> : null}
          </div>
        );
      })}
    </nav>
  );
}
