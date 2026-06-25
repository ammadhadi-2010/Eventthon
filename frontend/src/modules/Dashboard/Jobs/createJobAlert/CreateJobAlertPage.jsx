import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import JobsLeftSidebar from '../components/JobsLeftSidebar';
import { useJobsHub } from '../context/JobsHubContext';
import { isJobsUserSignedIn } from '../utils/jobsUser';
import JobAlertMobileHeader from './components/JobAlertMobileHeader';
import { clearJobAlertDraft } from './createJobAlertSession';
import { JOB_ALERT_STEPS } from './createJobAlertConstants';
import JobAlertStepRenderer from './JobAlertStepRenderer';
import JobAlertPreviewSidebar from './JobAlertPreviewSidebar';
import JobAlertCompletePreview from './components/JobAlertCompletePreview';
import { useCreateJobAlertForm } from './useCreateJobAlertForm';
import './create-job-alert.css';
import './styles/create-job-alert-mobile.css';
import './styles/ja-step6-preview.css';

export default function CreateJobAlertPage() {
  const navigate = useNavigate();
  const { addAlert, menuCounts } = useJobsHub();
  const wizard = useCreateJobAlertForm();
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const currentStep = wizard.step;
  const signedIn = isJobsUserSignedIn();

  const showToast = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 4200);
  };

  const handleCreate = async () => {
    if (!signedIn) {
      showToast('Sign in with your email or mobile to create an alert.');
      return;
    }
    if (!wizard.form.jobTitle.trim()) {
      showToast('Add a job title on step 1.');
      wizard.goToStep(1);
      return;
    }
    setSubmitting(true);
    try {
      const created = await addAlert(wizard.form);
      if (created) {
        clearJobAlertDraft();
        navigate('/jobs/alerts', { replace: true, state: { alertCreated: true } });
        return;
      }
      showToast('Could not save alert. Try again in a moment.');
    } catch {
      showToast('Network error. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDraft = () => {
    wizard.saveDraft();
    showToast('Draft saved. You can continue later from this page.');
  };

  const previewProps = {
    form: wizard.form,
    patch: wizard.patch,
    estimatedMatches: wizard.estimatedMatches,
    submitting,
    onCreate: handleCreate,
    onSaveDraft: handleDraft,
  };

  const stepProps = {
    form: wizard.form,
    patch: wizard.patch,
    toggleChip: wizard.toggleChip,
    addTag: wizard.addTag,
    removeTag: wizard.removeTag,
    salaryBounds: wizard.salaryBounds,
    ...previewProps,
  };

  return (
    <div className="jobs-page ja-page">
      {toast ? <p className="ja-toast" role="status">{toast}</p> : null}
      
      <JobAlertMobileHeader
        title="Create Job Alert"
        subtitle="Set criteria and get notified when matching jobs are posted."
      />

      <div className="jobs-layout ja-layout">
        <div className="jobs-layout__rail jobs-layout__rail--left">
          <JobsLeftSidebar
            activeSection="alerts"
            onSectionSelect={() => navigate('/jobs')}
            menuCounts={menuCounts}
          />
        </div>

        <div className="jobs-layout__center ja-center">
          <div className="ja-wizard-body">
            {!signedIn ? (
              <div className="ja-auth-banner gigs-card" role="alert">
                <p>Sign in to save job alerts. Your draft is stored locally until you publish.</p>
              </div>
            ) : null}

            <header className="ja-header">
              <Link to="/jobs/alerts" className="ja-back" aria-label="Back to job alerts">
                <FiArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="ja-header__title">Create Job Alert</h1>
                <p className="ja-header__sub">Set criteria and get notified when matching jobs are posted.</p>
              </div>
            </header>

            {/* Fixed Stepper - Using JOB_ALERT_STEPS directly to remove duplicates */}
            <nav className="ja-stepper" aria-label="Create alert steps">
              {JOB_ALERT_STEPS.map((s) => {
                const done = s.id < currentStep;
                const active = s.id === currentStep;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`ja-step${active ? ' is-active' : ''}${done ? ' is-done' : ''}`}
                    onClick={() => wizard.goToStep(s.id)}
                  >
                    <span className="ja-step__node">{done ? <FiCheck size={14} /> : s.id}</span>
                    <span className="ja-step__label">{s.label}</span>
                  </button>
                );
              })}
            </nav>

            <div
              key={currentStep}
              className="ja-form-scroll"
              role="region"
              aria-live="polite"
              aria-label={`Step ${currentStep}`}
            >
              {currentStep === 6 ? (
                <JobAlertCompletePreview
                  form={wizard.form}
                  submitting={submitting}
                  onCreate={handleCreate}
                  onSaveDraft={handleDraft}
                />
              ) : (
                <JobAlertStepRenderer currentStep={currentStep} {...stepProps} />
              )}
            </div>

            <footer className="ja-footer">
              {currentStep > 1 ? (
                <button type="button" className="ja-footer-prev" onClick={wizard.goBack} disabled={submitting}>
                  ← Previous Step
                </button>
              ) : (
                <button type="button" className="ja-footer-cancel" onClick={() => navigate('/jobs')} disabled={submitting}>
                  Cancel
                </button>
              )}
              <div className="ja-footer__right">
                {wizard.isLast ? (
                  <button type="button" className="ja-footer-next" onClick={handleCreate} disabled={submitting}>
                    {submitting ? 'Publishing...' : 'Confirm & Publish Alert'}
                  </button>
                ) : (
                  <button type="button" className="ja-footer-next" disabled={!wizard.canGoNext || submitting} onClick={wizard.goNext}>
                    Next Step <FiArrowRight size={16} />
                  </button>
                )}
              </div>
            </footer>
          </div>
        </div>

        <div className="jobs-layout__rail jobs-layout__rail--right ja-rail-right">
          <JobAlertPreviewSidebar {...previewProps} />
        </div>
      </div>
    </div>
  );
}