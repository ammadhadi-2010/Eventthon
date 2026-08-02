import React from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import FooterCategoryPanel from '../FooterResources/FooterCategoryPanel';
import { RESOURCES_FOOTER_PAGES } from '../../../FooterPages/config/resourcesFooterConfig';
import { SHELL_CLASS } from '../FooterResources/footerResourceConstants';

const CASE_PAGES = RESOURCES_FOOTER_PAGES.filter((page) => page.category === 'Case Studies');

/**
 * Dedicated Case Studies admin.
 * Same Footer CMS API: admin create/edit → Mongo → public /resources/case-studies.
 */
export default function AdminCaseStudiesManagementPage() {
  return (
    <div className={SHELL_CLASS}>
      <header className="w-full flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight">Case Studies Management</h1>
          <p className="text-xs text-slate-200 mt-1 max-w-2xl">
            Write and publish success stories for the public hub. Each saved entry becomes one card on{' '}
            <strong className="text-white">/resources/case-studies</strong>. Sort order{' '}
            <strong className="text-white">0</strong> marks the Featured strip.
          </p>
        </div>
        <Link
          to="/resources/case-studies"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-violet-500/50 bg-violet-600/20 px-3 py-2 text-[11px] font-bold text-violet-100 hover:bg-violet-600/35"
        >
          <FiExternalLink size={13} aria-hidden /> View live page
        </Link>
      </header>

      <div className="rounded-2xl border border-violet-500/35 bg-violet-500/10 px-4 py-3 text-[12px] text-violet-100">
        <strong className="text-white">How it works:</strong> New Case → title, summary, up to 3 metrics,
        category, author, cover → Save. Edits sync to the public page. Use{' '}
        <strong className="text-white">Seed DB defaults</strong> to load starter cases if the list is empty.
      </div>

      <FooterCategoryPanel
        pages={CASE_PAGES}
        footerBlock="resources"
        initialCategory="Case Studies"
        introNote=""
        deleteConfirm="Delete this case study? It will disappear from /resources/case-studies."
        loadError="Could not load case studies."
        accentClass="bg-violet-600 border-violet-500"
      />
    </div>
  );
}
