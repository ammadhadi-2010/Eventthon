import React from 'react';
import ProjectTemplatesPicker from '../components/ProjectTemplatesPicker';
import { useCreateProjectWizard } from '../context/CreateProjectWizardContext';

export default function ProjectTemplatesForm() {
  const { wizardData, applyProjectTemplate } = useCreateProjectWizard();

  return (
    <div className="cp-form-card ph-card cp-templates">
      <h2 className="cp-templates__title">3. Templates</h2>
      <p className="cp-templates__sub">Use templates to kickstart your next big project.</p>
      <ProjectTemplatesPicker
        selectedId={wizardData.selectedTemplateId}
        onSelect={applyProjectTemplate}
      />
    </div>
  );
}
