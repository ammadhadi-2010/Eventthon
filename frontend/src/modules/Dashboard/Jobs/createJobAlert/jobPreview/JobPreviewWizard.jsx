import React, { useState } from 'react';
import {
  JobPreviewBudgetPage,
  JobPreviewFinalPage,
  JobPreviewMilestonesPage,
  JobPreviewOverviewPage,
  JobPreviewRequirementsPage,
  JobPreviewScreeningPage,
} from './JobPreviewPages';
import '../styles/job-preview-wizard.css';

const PREVIEW_PAGES = [
  { id: 1, label: 'Overview' },
  { id: 2, label: 'Budget' },
  { id: 3, label: 'Requirements' },
  { id: 4, label: 'Milestones' },
  { id: 5, label: 'Screening' },
  { id: 6, label: 'Publish' },
];

export default function JobPreviewWizard({
  form,
  patch,
  estimatedMatches,
  submitting,
  onCreate,
  onSaveDraft,
  layout = 'center',
}) {
  const [page, setPage] = useState(1);
  const isFinal = page === 6;

  const renderPage = () => {
    switch (page) {
      case 1:
        return <JobPreviewOverviewPage form={form} />;
      case 2:
        return <JobPreviewBudgetPage form={form} />;
      case 3:
        return <JobPreviewRequirementsPage form={form} />;
      case 4:
        return <JobPreviewMilestonesPage form={form} />;
      case 5:
        return <JobPreviewScreeningPage form={form} patch={patch} />;
      case 6:
        return (
          <JobPreviewFinalPage
            form={form}
            estimatedMatches={estimatedMatches}
            submitting={submitting}
            onCreate={onCreate}
            onSaveDraft={onSaveDraft}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`jpw-shell jpw-shell--${layout}`}>
      <div className="jpw-head">
        <h2 className="jpw-head__title">Job Preview</h2>
        <p className="jpw-head__sub">Review all metadata before publishing</p>
      </div>

      <nav className="jpw-dots" aria-label="Preview pages">
        {PREVIEW_PAGES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`jpw-dot${page === item.id ? ' is-active' : ''}${item.id < page ? ' is-done' : ''}`}
            onClick={() => setPage(item.id)}
            aria-current={page === item.id ? 'step' : undefined}
          >
            <span>{item.id}</span>
            <em>{item.label}</em>
          </button>
        ))}
      </nav>

      <div className="jpw-stage" key={page}>
        {renderPage()}
      </div>

      {!isFinal ? (
        <footer className="jpw-nav">
          <button
            type="button"
            className="jpw-nav__prev"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Back
          </button>
          <button
            type="button"
            className="jpw-nav__next"
            onClick={() => setPage((p) => Math.min(6, p + 1))}
          >
            Next →
          </button>
        </footer>
      ) : null}
    </div>
  );
}
