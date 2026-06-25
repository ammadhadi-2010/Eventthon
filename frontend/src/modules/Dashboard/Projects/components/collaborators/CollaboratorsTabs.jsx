import React from 'react';
import { COLLABORATOR_TABS } from '../../data/topCollaboratorsData';

export default function CollaboratorsTabs({ activeTab, onChange, tabs = COLLABORATOR_TABS }) {
  return (
    <div className="ph-col-tabs" role="tablist" aria-label="Collaborator filters">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`ph-col-tab${activeTab === tab.id ? ' is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
}
