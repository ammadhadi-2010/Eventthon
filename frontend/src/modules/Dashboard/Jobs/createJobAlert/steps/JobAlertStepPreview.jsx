import React from 'react';
import JobPreviewWizard from '../jobPreview/JobPreviewWizard';

export default function JobAlertStepPreview({
  form,
  patch,
  estimatedMatches,
  submitting,
  onCreate,
  onSaveDraft,
}) {
  return (
    <section className="ja-panel ja-panel--preview" aria-labelledby="ja-step-preview-title">
      <h2 id="ja-step-preview-title" className="ja-panel__title">
        Job Preview
      </h2>
      <p className="ja-panel__sub">
        Walk through all six preview blocks before publishing your alert.
      </p>
      <JobPreviewWizard
        layout="center"
        form={form}
        patch={patch}
        estimatedMatches={estimatedMatches}
        submitting={submitting}
        onCreate={onCreate}
        onSaveDraft={onSaveDraft}
      />
    </section>
  );
}
