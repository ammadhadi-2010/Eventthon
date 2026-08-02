import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import JobsLeftSidebar from '../components/JobsLeftSidebar';
import JobsBreadcrumb from '../components/JobsBreadcrumb';
import { useJobsHub } from '../context/JobsHubContext';
import { isJobsUserSignedIn } from '../utils/jobsUser';
import { createJobListing } from '../services/jobsHubApi';
import { createCompanyJob } from '../../../../components/views/company/services/companyPortalApi';
import { isOpportunityType } from '../data/opportunityTypes';
import { saveJobsBrowseFilters } from '../utils/jobsBrowseSession';
import { buildJobsWizardCrumbs } from '../utils/jobsBreadcrumbs';
import JobAlertMobileHeader from './components/JobAlertMobileHeader';
import { clearJobAlertDraft } from './createJobAlertSession';
import { JOB_ALERT_STEPS } from './createJobAlertConstants';
import JobAlertStepRenderer from './JobAlertStepRenderer';
import JobAlertPreviewSidebar from './JobAlertPreviewSidebar';
import JobAlertCompletePreview from './components/JobAlertCompletePreview';
import { useCreateJobAlertForm } from './useCreateJobAlertForm';
import { resolveJobWizardMode } from './jobWizardModes';
import { OPPORTUNITY_STEPS } from './opportunity/opportunityConstants';
import { clearOpportunityDraft } from './opportunity/opportunitySession';
import { useCreateOpportunityForm } from './opportunity/useCreateOpportunityForm';
import OpportunityStepRenderer from './opportunity/OpportunityStepRenderer';
import OpportunityCompletePreview from './opportunity/OpportunityCompletePreview';
import OpportunityPreviewSidebar from './opportunity/OpportunityPreviewSidebar';
import './create-job-alert.css';
import './styles/create-job-alert-mobile.css';
import './styles/ja-step6-preview.css';
import '../styles/jh-breadcrumb.css';

function companyJobPayload(form, asDraft) {
  return {
    job_title: form.jobTitle,
    job_description: form.jobDescription,
    employment_type: form.employmentType,
    experience_level: form.experienceLevel,
    career_level: form.careerLevel,
    job_category: form.jobCategory,
    salary_min: form.salaryMin,
    salary_max: form.salaryMax,
    work_mode: form.workMode,
    skills: form.skills,
    keywords: form.keywords,
    as_draft: asDraft,
  };
}

export default function CreateJobAlertPage({ mode = 'alert' }) {
  const navigate = useNavigate();
  const { addAlert, menuCounts, searchFilters, setSearchFilters } = useJobsHub();
  const isListingOpportunity = mode === 'opportunity';
  const isAlertMode = mode === 'alert' || mode === 'opportunityAlert';
  const alertWizard = useCreateJobAlertForm();
  const oppWizard = useCreateOpportunityForm();
  const wizard = isListingOpportunity ? oppWizard : alertWizard;
  const steps = isListingOpportunity ? OPPORTUNITY_STEPS : JOB_ALERT_STEPS;
  const meta = resolveJobWizardMode(mode);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const currentStep = wizard.step;
  const signedIn = isJobsUserSignedIn();
  const isListing = mode === 'opportunity' || mode === 'company';
  const isOpportunity = isListingOpportunity;

  const showToast = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 4200);
  };

  const handleCreate = async () => {
    if (!signedIn) {
      showToast(
        isListing
          ? 'Sign in to publish this post.'
          : 'Sign in with your email or mobile to create an alert.',
      );
      return;
    }
    if (!wizard.form.jobTitle.trim()) {
      showToast(
        isListingOpportunity
          ? 'Add an opportunity title on step 1.'
          : mode === 'opportunityAlert'
            ? 'Add an opportunity alert title on step 1.'
            : 'Add a job title on step 1.',
      );
      wizard.goToStep(1);
      return;
    }
    setSubmitting(true);
    try {
      if (isAlertMode) {
        const created = await addAlert({
          ...wizard.form,
          alertKind: meta.alertKind || 'job',
        });
        if (created) {
          clearJobAlertDraft();
          navigate(meta.successPath, { replace: true, state: meta.successState });
          return;
        }
        showToast('Could not save alert. Try again in a moment.');
      } else if (mode === 'company') {
        const created = await createCompanyJob(companyJobPayload(wizard.form, false));
        if (created?.id) {
          clearJobAlertDraft();
          navigate(meta.successPath, { replace: true, state: meta.successState });
          return;
        }
        showToast('Could not publish job. Try again in a moment.');
      } else {
        const result = await createJobListing(wizard.form, meta.listingKind);
        if (result?.data || result?.status === 'success') {
          if (isListingOpportunity) clearOpportunityDraft();
          else clearJobAlertDraft();
          navigate(meta.successPath, { replace: true, state: meta.successState });
          return;
        }
        showToast('Could not publish. Try again in a moment.');
      }
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === 'string'
        ? detail
        : err?.message || 'Network error. Check your connection and try again.';
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDraft = async () => {
    if (mode !== 'company') {
      wizard.saveDraft();
      showToast('Draft saved. You can continue later from this page.');
      return;
    }
    if (!signedIn) {
      showToast('Sign in to save a company draft.');
      return;
    }
    if (!wizard.form.jobTitle.trim()) {
      showToast('Add a job title on step 1 before saving a draft.');
      wizard.goToStep(1);
      return;
    }
    setSubmitting(true);
    try {
      const created = await createCompanyJob(companyJobPayload(wizard.form, true));
      if (created?.id) {
        clearJobAlertDraft();
        showToast('Draft saved to company jobs.');
        navigate('/company/dashboard/draft-jobs', { replace: true });
        return;
      }
      showToast('Could not save draft. Try again.');
    } catch (err) {
      const detail = err?.response?.data?.detail;
      showToast(typeof detail === 'string' ? detail : err?.message || 'Could not save draft.');
    } finally {
      setSubmitting(false);
    }
  };

  const previewProps = {
    form: wizard.form,
    patch: wizard.patch,
    estimatedMatches: alertWizard.estimatedMatches,
    submitting,
    onCreate: handleCreate,
    onSaveDraft: handleDraft,
    submitLabel: meta.submitLabel,
  };

  const stepProps = {
    form: wizard.form,
    patch: wizard.patch,
    toggleChip: wizard.toggleChip,
    addTag: wizard.addTag,
    removeTag: wizard.removeTag,
    salaryBounds: alertWizard.salaryBounds,
    ...previewProps,
  };

  return (
    <div className="jobs-page ja-page">
      {toast ? <p className="ja-toast" role="status">{toast}</p> : null}

      <JobAlertMobileHeader title={meta.title} subtitle={meta.subtitle} mode={mode} />

      <div className="jobs-layout ja-layout">
        {mode === 'company' ? null : (
          <div className="jobs-layout__rail jobs-layout__rail--left">
            <JobsLeftSidebar
              activeSection={meta.activeSection}
              onSectionSelect={() => navigate('/jobs')}
              searchFilters={searchFilters}
              onBrowseOpportunity={(opportunityType) => {
                if (opportunityType === '__clear__') {
                  setSearchFilters(
                    saveJobsBrowseFilters({
                      ...searchFilters,
                      listingKind: '',
                      jobType: isOpportunityType(searchFilters.jobType) ? '' : searchFilters.jobType,
                    }),
                  );
                } else {
                  setSearchFilters(
                    saveJobsBrowseFilters({
                      ...searchFilters,
                      listingKind: 'opportunity',
                      jobType: opportunityType || '',
                      workMode: '',
                    }),
                  );
                }
                navigate('/jobs');
              }}
              menuCounts={menuCounts}
            />
          </div>
        )}

        <div className="jobs-layout__center ja-center">
          <div className="ja-wizard-body">
            {!signedIn ? (
              <div className="ja-auth-banner gigs-card" role="alert">
                <p>
                  {isListing
                    ? 'Sign in to publish. Your draft is stored locally until you submit.'
                    : 'Sign in to save job alerts. Your draft is stored locally until you publish.'}
                </p>
              </div>
            ) : null}

            {mode === 'company' ? (
              <div className="ja-auth-banner gigs-card" role="status">
                <p>
                  Only verified company accounts can post permanent hiring jobs. Listings stay pending
                  until admin approval.
                </p>
              </div>
            ) : null}

            <header className="ja-header">
              <JobsBreadcrumb items={buildJobsWizardCrumbs(mode)} className="jh-breadcrumb--compact" />
              <div>
                <h1 className="ja-header__title">{meta.title}</h1>
                <p className="ja-header__sub">{meta.subtitle}</p>
              </div>
            </header>

            <nav className="ja-stepper" aria-label={`${meta.title} steps`}>
              {steps.map((s) => {
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
                isOpportunity ? (
                  <OpportunityCompletePreview {...previewProps} />
                ) : (
                  <JobAlertCompletePreview {...previewProps} />
                )
              ) : isOpportunity ? (
                <OpportunityStepRenderer currentStep={currentStep} {...stepProps} />
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
                <button type="button" className="ja-footer-cancel" onClick={() => navigate(meta.backPath)} disabled={submitting}>
                  Cancel
                </button>
              )}
              <div className="ja-footer__right">
                {wizard.isLast ? (
                  <button type="button" className="ja-footer-next" onClick={handleCreate} disabled={submitting}>
                    {submitting ? meta.submittingLabel : meta.submitLabel}
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
          {isOpportunity ? (
            <OpportunityPreviewSidebar {...previewProps} />
          ) : (
            <JobAlertPreviewSidebar {...previewProps} />
          )}
        </div>
      </div>
    </div>
  );
}
