import React from 'react';
import FooterCategoryPanel from './FooterCategoryPanel';
import { RESOURCES_FOOTER_PAGES } from '../../../FooterPages/config/resourcesFooterConfig';

export default function ResourcesFooterPanel({
  initialCategory = '',
  onCategoryChange,
}) {
  return (
    <FooterCategoryPanel
      pages={RESOURCES_FOOTER_PAGES}
      footerBlock="resources"
      initialCategory={initialCategory}
      onCategoryChange={onCategoryChange}
      introNote="Manage Resources footer pages in footer order. Tutorials = video cards on /resources/tutorials. Guides = handbooks. Docs = topic articles. Rank Matrix is in-app only."
      deleteConfirm="Delete this resources page entry?"
      loadError="Could not load resources footer content."
      accentClass="bg-blue-600 border-blue-500"
    />
  );
}
