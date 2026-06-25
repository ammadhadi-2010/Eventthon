import React from 'react';
import { FiEdit2 } from 'react-icons/fi';
import RichHtmlContent from '../../shared/RichHtmlContent';
import { WIZARD_PROJECT_TEMPLATES } from '../data/projectWizardTemplatesData';
import { useCreateProjectWizard } from '../context/CreateProjectWizardContext';

function ReviewBlock({ title, onEdit, children }) {
  return (
    <section className="cp-review-block">
      <div className="cp-review-block__head">
        <h4>{title}</h4>
        <button type="button" className="cp-review-edit" onClick={onEdit}>
          <FiEdit2 size={12} aria-hidden />
          Edit
        </button>
      </div>
      {children}
    </section>
  );
}

export default function ProjectReviewForm() {
  const { wizardData, goToStep } = useCreateProjectWizard();
  const selectedTemplate = WIZARD_PROJECT_TEMPLATES.find((t) => t.id === wizardData.selectedTemplateId);

  return (
    <div className="cp-form-card ph-card">
      <h2 className="cp-form-title">Create New Project</h2>
      <p className="cp-form-sub">Step 6: Review everything before publishing.</p>

      <ReviewBlock title="Project Details" onEdit={() => goToStep(1)}>
        <p>
          <strong>{wizardData.title}</strong>
        </p>
        <p className="cp-review-muted">{wizardData.shortDescription}</p>
        <p className="cp-review-muted">
          {wizardData.category} · {wizardData.subCategory}
        </p>
        <div className="cp-review-rich">
          <RichHtmlContent html={wizardData.detailedDescription} />
        </div>
        <p className="cp-review-tags">{wizardData.tags.join(' · ')}</p>
      </ReviewBlock>

      <ReviewBlock title="Requirements" onEdit={() => goToStep(2)}>
        <p className="cp-review-muted">{wizardData.objectives}</p>
        <p className="cp-review-muted">{wizardData.deliverables}</p>
        <ul>
          {wizardData.requirements.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </ReviewBlock>

      <ReviewBlock title="Template" onEdit={() => goToStep(3)}>
        <p>
          <strong>{selectedTemplate?.title || 'No template selected'}</strong>
        </p>
        {selectedTemplate ? (
          <p className="cp-review-muted">
            {selectedTemplate.category} · {selectedTemplate.uses} uses
          </p>
        ) : null}
      </ReviewBlock>

      <ReviewBlock title="Team & Skills" onEdit={() => goToStep(4)}>
        <p>
          {wizardData.experienceLevel} · {wizardData.workMode} · {wizardData.teamSize}
        </p>
        <p className="cp-review-muted">Roles: {wizardData.rolesNeeded.join(', ')}</p>
        <p className="cp-review-muted">Skills: {wizardData.skills.join(', ')}</p>
      </ReviewBlock>

      <ReviewBlock title="Budget & Timeline" onEdit={() => goToStep(5)}>
        <p>
          {wizardData.status} · {wizardData.projectType} · {wizardData.budgetRange} · {wizardData.timeline}
        </p>
        <ul>
          {wizardData.milestones.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
        <p className="cp-review-muted">Packages:</p>
        <ul>
          {['basic', 'standard', 'premium'].map((key) => (
            <li key={key}>
              {key}: ${wizardData.pricingTiers?.[key]?.price} · {wizardData.pricingTiers?.[key]?.deliveryDays}d
            </li>
          ))}
        </ul>
      </ReviewBlock>
    </div>
  );
}
