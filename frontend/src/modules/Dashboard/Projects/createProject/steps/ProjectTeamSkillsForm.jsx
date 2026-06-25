import React from 'react';
import FormField from '../shared/FormField';
import EditableStringList from '../shared/EditableStringList';
import {
  EXPERIENCE_OPTIONS,
  WORK_MODE_OPTIONS,
} from '../data/createProjectWizardData';
import { useCreateProjectWizard } from '../context/CreateProjectWizardContext';

const TEAM_SIZE_OPTIONS = ['1 - 2 Members', '3 - 4 Members', '5 - 7 Members', '8+ Members'];

export default function ProjectTeamSkillsForm() {
  const { wizardData, updateField, updateListItem, addListItem, removeListItem } = useCreateProjectWizard();

  return (
    <div className="cp-form-card ph-card">
      <h2 className="cp-form-title">Create New Project</h2>
      <p className="cp-form-sub">Step 4: Describe the team you need and required skills.</p>

      <div className="cp-select-row">
        <FormField label="Experience Level">
          <select
            className="cp-select"
            value={wizardData.experienceLevel}
            onChange={(e) => updateField('experienceLevel', e.target.value)}
          >
            {EXPERIENCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Work Mode">
          <select
            className="cp-select"
            value={wizardData.workMode}
            onChange={(e) => updateField('workMode', e.target.value)}
          >
            {WORK_MODE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Team Size">
        <select
          className="cp-select"
          value={wizardData.teamSize}
          onChange={(e) => updateField('teamSize', e.target.value)}
        >
          {TEAM_SIZE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </FormField>

      <EditableStringList
        label="Roles Needed"
        items={wizardData.rolesNeeded}
        placeholder="e.g. Backend Engineer"
        onChange={(i, v) => updateListItem('rolesNeeded', i, v)}
        onAdd={() => addListItem('rolesNeeded')}
        onRemove={(i) => removeListItem('rolesNeeded', i)}
      />

      <EditableStringList
        label="Required Skills"
        items={wizardData.skills}
        placeholder="e.g. React, NLP"
        onChange={(i, v) => updateListItem('skills', i, v)}
        onAdd={() => addListItem('skills')}
        onRemove={(i) => removeListItem('skills', i)}
      />
    </div>
  );
}
