import React from 'react';
import GigStyleRichTextEditor from '../../../../../components/richText/GigStyleRichTextEditor';
import useGigStyleRichTextEditor, { htmlTextLength } from '../../../../../components/richText/useGigStyleRichTextEditor';
import FormField from '../shared/FormField';
import TagBadge from '../shared/TagBadge';
import CoverDropzone from '../shared/CoverDropzone';
import ProjectCategorySelects from '../shared/ProjectCategorySelects';
import { useCreateProjectWizard } from '../context/CreateProjectWizardContext';

export default function ProjectDetailsForm() {
  const {
    wizardData,
    tagInput,
    setTagInput,
    updateField,
    addTag,
    removeTag,
    setCoverPreview,
  } = useCreateProjectWizard();

  const rte = useGigStyleRichTextEditor({
    value: wizardData?.detailedDescription || '',
    maxLength: 2000,
    onChange: (html) => updateField('detailedDescription', html),
  });

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const descLen = htmlTextLength(wizardData?.detailedDescription);

  return (
    <div className="cp-form-card ph-card">
      <h2 className="cp-form-title">Create New Project</h2>
      <p className="cp-form-sub">Step 1: Tell the community what you are building.</p>

      <FormField label="Project Title" hint={`${wizardData.title.length}/100`}>
        <input
          type="text"
          className="cp-input"
          maxLength={100}
          value={wizardData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Enter project title"
        />
      </FormField>

      <FormField label="Short Description" hint={`${wizardData.shortDescription.length}/200`}>
        <textarea
          className="cp-textarea cp-textarea--sm"
          maxLength={200}
          rows={3}
          value={wizardData.shortDescription}
          onChange={(e) => updateField('shortDescription', e.target.value)}
          placeholder="Brief summary for cards and search"
        />
      </FormField>

      <FormField label="Detailed Description" hint={`${descLen}/2000`}>
        <GigStyleRichTextEditor
          {...rte}
          maxLength={2000}
          placeholder="Describe scope, deliverables, and success criteria"
        />
      </FormField>

      <ProjectCategorySelects
        category={wizardData.category}
        subCategory={wizardData.subCategory}
        onFieldChange={updateField}
      />

      <FormField label="Tags">
        <div className="cp-tags-row">
          {wizardData.tags.map((tag) => (
            <TagBadge key={tag} label={tag} onRemove={() => removeTag(tag)} />
          ))}
          <input
            type="text"
            className="cp-tag-input"
            placeholder="Add tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={() => addTag(tagInput)}
          />
        </div>
      </FormField>

      <CoverDropzone previewUrl={wizardData.coverPreview} onFileSelect={setCoverPreview} />
    </div>
  );
}
