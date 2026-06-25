import React, { useEffect } from 'react';
import StepIndicator from './StepIndicator';
import WizardFooter from './WizardFooter';
import ProjectDetailsForm from './steps/ProjectDetailsForm';
import ProjectRequirementsForm from './steps/ProjectRequirementsForm';
import ProjectTemplatesForm from './steps/ProjectTemplatesForm';
import ProjectTeamSkillsForm from './steps/ProjectTeamSkillsForm';
import ProjectBudgetTimelineForm from './steps/ProjectBudgetTimelineForm';
import ProjectReviewForm from './steps/ProjectReviewForm';
import ProjectPreviewCard from './preview/ProjectPreviewCard';
import CreateProjectMobileTitleRow from './CreateProjectMobileTitleRow';
import { WIZARD_STEP_COPY } from './data/createProjectWizardData';
import { useCreateProjectWizard } from './context/CreateProjectWizardContext';

const STEP_FORMS = {
  1: ProjectDetailsForm,
  2: ProjectRequirementsForm,
  3: ProjectTemplatesForm,
  4: ProjectTeamSkillsForm,
  5: ProjectBudgetTimelineForm,
  6: ProjectReviewForm,
};

export default function CreateProjectWizardView({ onCancel, onPublish, searchQuery = '' }) {
  const wizard = useCreateProjectWizard();
  const StepForm = STEP_FORMS[wizard.step] || ProjectDetailsForm;
  const stepCopy = WIZARD_STEP_COPY[wizard.step] || WIZARD_STEP_COPY[1];

  const handleBack = () => {
    if (wizard.step > 1) wizard.prevStep();
    else onCancel();
  };

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    const labels = document.querySelectorAll('.cp-field__label, .cp-form-title, .cp-templates__title');
    for (const el of labels) {
      if (String(el.textContent || '').toLowerCase().includes(q)) {
        el.closest('.cp-field, .cp-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
    }
  }, [searchQuery]);

  const handleNext = async () => {
    wizard.persistSnapshot();
    if (wizard.step >= wizard.totalSteps) {
      try {
        if (onPublish) {
          await onPublish(wizard.wizardData);
        } else {
          onCancel();
        }
        wizard.resetWizard();
        if (onPublish) onCancel();
      } catch (err) {
        window.alert(err?.message || 'Could not publish project. Sign in and try again.');
      }
      return;
    }
    wizard.nextStep();
  };

  return (
    <div className="cp-root">
      <div className="cp-main">
        <StepIndicator currentStep={wizard.step} />
        <CreateProjectMobileTitleRow
          title={stepCopy.title}
          subtitle={stepCopy.subtitle}
          onBack={handleBack}
        />
        <StepForm />
        <WizardFooter
          step={wizard.step}
          totalSteps={wizard.totalSteps}
          onSaveDraft={wizard.saveDraft}
          onCancel={onCancel}
          onBack={wizard.prevStep}
          onNext={handleNext}
        />
      </div>
      <ProjectPreviewCard currentStep={wizard.step} />
    </div>
  );
}
