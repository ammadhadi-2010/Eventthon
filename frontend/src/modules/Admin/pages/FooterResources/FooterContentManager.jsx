import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import CompanyFooterPanel from './CompanyFooterPanel';
import ResourcesFooterPanel from './ResourcesFooterPanel';
import { RESOURCES_FOOTER_PAGES } from '../../../FooterPages/config/resourcesFooterConfig';
import { COMPANY_FOOTER_PAGES } from '../../../FooterPages/config/companyFooterConfig';
import { SHELL_CLASS } from './footerResourceConstants';

const RESOURCE_CATS = new Set(RESOURCES_FOOTER_PAGES.map((p) => p.category));
const COMPANY_CATS = new Set(COMPANY_FOOTER_PAGES.map((p) => p.category));

const HUB_TABS = [
  {
    id: 'resources',
    label: 'Resources Pages',
    hint: 'Documentation, Guides, Tutorials, Blog, Help Center…',
  },
  {
    id: 'company',
    label: 'Company Pages',
    hint: 'About Us (Journey & Team), Pricing, Careers, Contact, Legal…',
  },
];

export default function FooterContentManager() {
  const [searchParams, setSearchParams] = useSearchParams();
  const hubTab = searchParams.get('hub') === 'company' ? 'company' : 'resources';
  const initialCategory = searchParams.get('category') || '';

  const setHubTab = useCallback(
    (tab) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('hub', tab);
          const cat = next.get('category') || '';
          if (tab === 'resources') {
            if (!RESOURCE_CATS.has(cat)) next.set('category', 'Documentation');
          } else if (!COMPANY_CATS.has(cat)) {
            next.set('category', 'About Us');
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const onCategoryChange = useCallback(
    (category) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('hub', hubTab);
          next.set('category', category);
          return next;
        },
        { replace: true },
      );
    },
    [hubTab, setSearchParams],
  );

  return (
    <div className={SHELL_CLASS}>
      <header className="w-full flex flex-col gap-1">
        <h1 className="text-lg font-extrabold text-white tracking-tight">Footer Content Manager</h1>
        <p className="text-xs text-slate-200">
          Manage public footer pages. Tutorials, Guides, and Docs live under Resources.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {HUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setHubTab(tab.id)}
            className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
              hubTab === tab.id
                ? tab.id === 'company'
                  ? 'bg-violet-600/90 border-violet-400 text-white'
                  : 'bg-blue-600 border-blue-500 text-white'
                : 'bg-[#111622] border-slate-800 text-slate-200 hover:border-slate-600'
            }`}
          >
            <span className="block text-sm font-bold">{tab.label}</span>
            <span className={`mt-1 block text-[11px] ${hubTab === tab.id ? 'text-white/85' : 'text-slate-400'}`}>
              {tab.hint}
            </span>
          </button>
        ))}
      </div>

      {hubTab === 'resources' ? (
        <div className="rounded-2xl border border-blue-500/35 bg-blue-500/10 px-4 py-3 text-[12px] text-blue-100">
          <strong>Tutorials</strong> — video cards for{' '}
          <a href="/resources/tutorials" target="_blank" rel="noreferrer" className="underline font-bold">
            /resources/tutorials
          </a>
          . Pick the Tutorials chip below, load a template, set video URL, then Save.
        </div>
      ) : null}

      {hubTab === 'company' ? (
        <CompanyFooterPanel
          initialCategory={initialCategory}
          onCategoryChange={onCategoryChange}
        />
      ) : (
        <ResourcesFooterPanel
          initialCategory={RESOURCE_CATS.has(initialCategory) ? initialCategory : 'Documentation'}
          onCategoryChange={onCategoryChange}
        />
      )}
    </div>
  );
}
