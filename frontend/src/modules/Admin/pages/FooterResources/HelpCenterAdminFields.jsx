import React, { useMemo, useState } from 'react';
import {
  defaultHelpFormFields,
  parseHelpContent,
  serializeHelpContent,
} from '../../../FooterPages/utils/helpCmsUtils';
import { FooterField, FooterTextInput } from './FooterResourceFieldKit';
import {
  HelpCategoriesEditor,
  HelpFaqEditor,
  HelpFeaturedEditor,
  HelpStatusEditor,
} from './HelpCenterAdminLists';

const TABS = [
  { id: 'featured', label: 'Articles' },
  { id: 'faq', label: 'FAQ' },
  { id: 'categories', label: 'Categories' },
  { id: 'status', label: 'Status' },
];

export default function HelpCenterAdminFields({ formData, onChange }) {
  const [tab, setTab] = useState('featured');
  const parsed = useMemo(() => parseHelpContent(formData.content), [formData.content]);
  const patch = (partial) => onChange({ ...formData, ...partial });

  const write = (next) => {
    patch({
      content: serializeHelpContent({
        categories: next.categories ?? parsed.categories,
        featured: next.featured ?? parsed.featured,
        faq: next.faq ?? parsed.faq,
        status: next.status ?? parsed.status,
      }),
    });
  };

  return (
    <>
      <div className="rounded-xl border border-violet-400/40 bg-violet-500/10 px-4 py-3 text-[12px] text-violet-100 space-y-2">
        <p>
          <strong className="text-white">Help Center editor</strong> — one CMS entry powers{' '}
          <a href="/resources/help" target="_blank" rel="noreferrer" className="underline font-bold">
            /resources/help
          </a>
          . Edit articles, FAQ, categories, and status below, then Save.
        </p>
        <button
          type="button"
          onClick={() => patch({ ...defaultHelpFormFields(), category: 'Help Center' })}
          className="rounded-lg border border-violet-500/60 bg-violet-600/25 px-3 py-1.5 text-[11px] font-bold text-white"
        >
          Load full Help Center defaults
        </button>
      </div>

      <FooterField id="help-hero" label="Hero title" hint="Shown under the Help Center heading.">
        <FooterTextInput
          id="help-hero"
          value={formData.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="How can we help you?"
          maxLength={160}
        />
      </FooterField>

      <FooterField id="help-sub" label="Subtitle">
        <FooterTextInput
          id="help-sub"
          value={formData.excerpt}
          onChange={(e) => patch({ excerpt: e.target.value })}
          placeholder="Find answers for account, squads…"
          maxLength={2000}
        />
      </FooterField>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold border ${
              tab === item.id
                ? 'border-violet-400 bg-violet-600/40 text-white'
                : 'border-slate-600 bg-slate-800/60 text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'featured' ? (
        <FooterField id="help-feat" label="Featured articles" hint="Shown in the main feed for each category.">
          <HelpFeaturedEditor items={parsed.featured} onChange={(featured) => write({ featured })} />
        </FooterField>
      ) : null}

      {tab === 'faq' ? (
        <FooterField id="help-faq" label="Popular questions" hint="Category id filters FAQ by left sidebar.">
          <HelpFaqEditor items={parsed.faq} onChange={(faq) => write({ faq })} />
        </FooterField>
      ) : null}

      {tab === 'categories' ? (
        <FooterField id="help-cats" label="Left sidebar categories" hint="icon: zap, user, users, heart… · to: public path">
          <HelpCategoriesEditor items={parsed.categories} onChange={(categories) => write({ categories })} />
        </FooterField>
      ) : null}

      {tab === 'status' ? (
        <FooterField id="help-status" label="System status rows">
          <HelpStatusEditor items={parsed.status} onChange={(status) => write({ status })} />
        </FooterField>
      ) : null}
    </>
  );
}
