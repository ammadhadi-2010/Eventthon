import React from 'react';
import FooterCategoryPanel from './FooterCategoryPanel';
import { COMPANY_FOOTER_PAGES } from '../../../FooterPages/config/companyFooterConfig';

export default function CompanyFooterPanel({ initialCategory = '', onCategoryChange }) {
  return (
    <FooterCategoryPanel
      pages={COMPANY_FOOTER_PAGES}
      footerBlock="company"
      initialCategory={initialCategory}
      onCategoryChange={onCategoryChange}
      introNote="Manage footer Company pages in the same order as the site footer. Careers = EventThon company hiring roles only (synced to /company/careers). About Us includes Our Journey and Leadership Team. Founder's Story is edited separately."
      deleteConfirm="Delete this company page entry?"
      loadError="Could not load company footer content."
      accentClass="bg-violet-600 border-violet-500"
    />
  );
}
