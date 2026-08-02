import React from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import FooterCategoryPanel from '../FooterResources/FooterCategoryPanel';
import { RESOURCES_FOOTER_PAGES } from '../../../FooterPages/config/resourcesFooterConfig';
import { SHELL_CLASS } from '../FooterResources/footerResourceConstants';

const HELP_PAGES = RESOURCES_FOOTER_PAGES.filter((page) => page.category === 'Help Center');

/**
 * Dedicated Help Center admin.
 * Same Footer CMS API: admin edit → Mongo → public /resources/help (single entry).
 */
export default function AdminHelpCenterPage() {
  return (
    <div className={SHELL_CLASS}>
      <header className="w-full flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight">Help Center Management</h1>
          <p className="text-xs text-slate-200 mt-1 max-w-2xl">
            Edit hero copy, featured articles, popular questions, left categories, and system status for{' '}
            <strong className="text-white">/resources/help</strong>. One saved entry drives the whole page.
          </p>
        </div>
        <Link
          to="/resources/help"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-violet-500/50 bg-violet-600/20 px-3 py-2 text-[11px] font-bold text-violet-100 hover:bg-violet-600/35"
        >
          <FiExternalLink size={13} aria-hidden /> View live Help Center
        </Link>
      </header>

      <div className="rounded-2xl border border-violet-500/35 bg-violet-500/10 px-4 py-3 text-[12px] text-violet-100">
        <strong className="text-white">How it works:</strong> Load defaults (or open the entry) → edit
        Articles / FAQ / Categories / Status tabs → Save. Changes sync to the public Help Center.
        Use <strong className="text-white">Seed DB defaults</strong> if the list is empty.
      </div>

      <FooterCategoryPanel
        pages={HELP_PAGES}
        footerBlock="resources"
        initialCategory="Help Center"
        introNote=""
        deleteConfirm="Delete Help Center CMS entry? /resources/help will fall back to built-in defaults."
        loadError="Could not load Help Center."
        accentClass="bg-violet-600 border-violet-500"
      />
    </div>
  );
}
