import React, { useState } from 'react';
import ProjectsViewHeader from '../components/shared/ProjectsViewHeader';
import ProjectTemplatesPicker from '../createProject/components/ProjectTemplatesPicker';
import { WIZARD_PROJECT_TEMPLATES } from '../createProject/data/projectWizardTemplatesData';

export default function Templates() {
  const [selectedId, setSelectedId] = useState(WIZARD_PROJECT_TEMPLATES[0]?.id || '');

  return (
    <div className="ph-center-stack cp-templates-hub">
      <ProjectsViewHeader
        title="Templates"
        subtitle="Use templates to kickstart your next big project."
      />
      <div className="ph-card cp-templates cp-templates--hub">
        <ProjectTemplatesPicker selectedId={selectedId} onSelect={(tpl) => setSelectedId(tpl.id)} />
      </div>
    </div>
  );
}
