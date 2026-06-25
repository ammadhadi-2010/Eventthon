import React from 'react';
import FormField from '../shared/FormField';
import EditableStringList from '../shared/EditableStringList';
import {
  PROJECT_STATUS_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  TIMELINE_OPTIONS,
} from '../data/createProjectWizardData';
import { useCreateProjectWizard } from '../context/CreateProjectWizardContext';
import ProjectPricingTiersSection from './ProjectPricingTiersSection';

export default function ProjectBudgetTimelineForm() {
  const { wizardData, updateField, updateListItem, addListItem, removeListItem } = useCreateProjectWizard();

  return (
    <div className="cp-form-card ph-card">
      <h2 className="cp-form-title">Create New Project</h2>
      <p className="cp-form-sub">Step 5: Budget, timeline, and Basic / Standard / Premium packages.</p>

      <div className="cp-select-row">
        <FormField label="Project Status">
          <select
            className="cp-select"
            value={wizardData.status}
            onChange={(e) => updateField('status', e.target.value)}
          >
            {PROJECT_STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Project Type">
          <select
            className="cp-select"
            value={wizardData.projectType}
            onChange={(e) => updateField('projectType', e.target.value)}
          >
            {PROJECT_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="cp-select-row">
        <FormField label="Budget Min (USD)">
          <input
            type="number"
            className="cp-input"
            min={0}
            value={wizardData.budgetMin}
            onChange={(e) => updateField('budgetMin', e.target.value)}
          />
        </FormField>
        <FormField label="Budget Max (USD)">
          <input
            type="number"
            className="cp-input"
            min={0}
            value={wizardData.budgetMax}
            onChange={(e) => updateField('budgetMax', e.target.value)}
          />
        </FormField>
      </div>

      <p className="cp-budget-preview">
        Preview range: <strong>{wizardData.budgetRange || 'Not set'}</strong>
      </p>

      <div className="cp-select-row">
        <FormField label="Timeline">
          <select
            className="cp-select"
            value={wizardData.timeline}
            onChange={(e) => updateField('timeline', e.target.value)}
          >
            {TIMELINE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Target Start Date">
          <input
            type="date"
            className="cp-input"
            value={wizardData.startDate}
            onChange={(e) => updateField('startDate', e.target.value)}
          />
        </FormField>
      </div>

      <EditableStringList
        label="Milestones"
        items={wizardData.milestones}
        placeholder="e.g. MVP launch"
        onChange={(i, v) => updateListItem('milestones', i, v)}
        onAdd={() => addListItem('milestones')}
        onRemove={(i) => removeListItem('milestones', i)}
      />

      <ProjectPricingTiersSection />
    </div>
  );
}
