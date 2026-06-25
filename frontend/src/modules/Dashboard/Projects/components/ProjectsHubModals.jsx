import React from 'react';
import { FiX } from 'react-icons/fi';

function ModalShell({ title, onClose, children }) {
  return (
    <div className="ph-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="ph-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="ph-modal-head">
          <h2>{title}</h2>
          <button type="button" className="ph-icon-btn" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

export function NewProjectModal({ open, onClose }) {
  if (!open) return null;
  return (
    <ModalShell title="Create New Project" onClose={onClose}>
      <p className="ph-modal-copy">Start a new workspace for your squad. This flow will connect to project APIs soon.</p>
      <label className="ph-modal-field">
        Project name
        <input type="text" placeholder="e.g. AI Content Generator" />
      </label>
      <label className="ph-modal-field">
        Category
        <select defaultValue="web">
          <option value="web">Web Development</option>
          <option value="ai">AI & Machine Learning</option>
          <option value="mobile">Mobile Apps</option>
        </select>
      </label>
      <button type="button" className="ph-btn ph-btn--primary ph-modal-submit" onClick={onClose}>
        Create Project
      </button>
    </ModalShell>
  );
}

export function AnalyticsModal({ open, onClose }) {
  if (!open) return null;
  return (
    <ModalShell title="Project Analytics" onClose={onClose}>
      <div className="ph-analytics-grid">
        <div>
          <span>Delivery rate</span>
          <strong>92%</strong>
        </div>
        <div>
          <span>On-time milestones</span>
          <strong>87%</strong>
        </div>
        <div>
          <span>Avg. squad velocity</span>
          <strong>+14%</strong>
        </div>
        <div>
          <span>Budget utilization</span>
          <strong>78%</strong>
        </div>
      </div>
      <p className="ph-modal-copy">Full analytics dashboard will expand with live squad metrics.</p>
    </ModalShell>
  );
}
