import React from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import FooterCategoryPanel from '../FooterResources/FooterCategoryPanel';
import { SHELL_CLASS } from '../FooterResources/footerResourceConstants';

const FOOTER_BRAND_PAGES = [
  {
    category: 'Footer Brand',
    route: '/',
    slug: 'footer-brand',
    title: 'Footer Brand',
    singleEntry: true,
    hint: 'Left footer brand column + social media links for EventThon channels.',
  },
];

export default function AdminFooterBrandPage() {
  return (
    <div className={SHELL_CLASS}>
      <header className="w-full flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight">Footer Brand & Social</h1>
          <p className="text-xs text-slate-200 mt-1 max-w-2xl">
            Full site footer CMS: brand, socials, newsletter copy, stats, values, payments, and copyright.
            Newsletter emails save to the backend. Social icons open EventThon channels in a new tab.
          </p>
        </div>
        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-violet-500/50 bg-violet-600/20 px-3 py-2 text-[11px] font-bold text-violet-100 hover:bg-violet-600/35"
        >
          <FiExternalLink size={13} aria-hidden /> View site footer
        </Link>
      </header>

      <div className="rounded-2xl border border-violet-500/35 bg-violet-500/10 px-4 py-3 text-[12px] text-violet-100">
        <strong className="text-white">How it works:</strong> Load defaults → set Facebook / X / LinkedIn /
        Discord / YouTube / Instagram URLs → Save. Use Seed DB defaults if the list is empty.
      </div>

      <FooterCategoryPanel
        pages={FOOTER_BRAND_PAGES}
        footerBlock="company"
        initialCategory="Footer Brand"
        introNote=""
        deleteConfirm="Delete Footer Brand CMS entry? Footer will fall back to built-in defaults."
        loadError="Could not load Footer Brand."
        accentClass="bg-violet-600 border-violet-500"
      />
    </div>
  );
}
