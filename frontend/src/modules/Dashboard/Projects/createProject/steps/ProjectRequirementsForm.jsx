import React from 'react';
import FormField from '../shared/FormField';
import EditableStringList from '../shared/EditableStringList';
import { useCreateProjectWizard } from '../context/CreateProjectWizardContext';

export default function ProjectRequirementsForm() {
  const { wizardData, updateField, updateListItem, addListItem, removeListItem } = useCreateProjectWizard();

  return (
    <div className="cp-form-card ph-card">
      <h2 className="cp-form-title">Create New Project</h2>
      <p className="cp-form-sub">Step 2: Define goals, deliverables, and technical requirements.</p>

      <FormField label="Project Objectives">
        <textarea
          className="cp-textarea"
          rows={3}
          value={wizardData.objectives}
          onChange={(e) => updateField('objectives', e.target.value)}
          placeholder="What outcomes should this project achieve?"
        />
      </FormField>

      <FormField label="Key Deliverables">
        <textarea
          className="cp-textarea"
          rows={3}
          value={wizardData.deliverables}
          onChange={(e) => updateField('deliverables', e.target.value)}
          placeholder="List tangible outputs for collaborators"
        />
      </FormField>

      <EditableStringList
        label="Functional Requirements"
        items={wizardData.requirements}
        placeholder="e.g. OAuth login for admins"
        onChange={(i, v) => updateListItem('requirements', i, v)}
        onAdd={() => addListItem('requirements')}
        onRemove={(i) => removeListItem('requirements', i)}
      />

      <EditableStringList
        label="Tech Stack"
        items={wizardData.techStack}
        placeholder="e.g. React, PostgreSQL"
        onChange={(i, v) => updateListItem('techStack', i, v)}
        onAdd={() => addListItem('techStack')}
        onRemove={(i) => removeListItem('techStack', i)}
      />
    </div>
  );
}
