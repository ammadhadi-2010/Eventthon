import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FooterResourceFormPanel from './FooterResourceFormPanel';
import FooterResourceList from './FooterResourceList';
import {
  createFooterResource,
  deleteFooterResource,
  getFooterResources,
  seedFooterDefaults,
  updateFooterResource,
} from './footerResourceApi';
import { EMPTY_FOOTER_RESOURCE, PANEL_CLASS } from './footerResourceConstants';
import { rowToFooterForm } from '../../../../models/FooterResource';
import {
  normalizeAboutJourneyForSave,
  normalizeAboutTeamForSave,
} from '../../../FooterPages/utils/aboutCmsUtils';
import { normalizeCareersFormPayload } from './careersAdminUtils';
import { defaultPrivacyFormFields } from '../../../FooterPages/utils/privacyCmsUtils';
import { defaultTermsFormFields } from '../../../FooterPages/utils/termsCmsUtils';
import { defaultDocFormForTopic } from '../../../FooterPages/utils/docsCmsUtils';
import { defaultGuideFormFields } from '../../../FooterPages/utils/guidesCmsUtils';
import { defaultTutorialFormFields } from '../../../FooterPages/utils/tutorialsCmsUtils';
import { defaultBlogFormFields } from '../../../FooterPages/utils/blogCmsUtils';
import { defaultCaseFormFields } from '../../../FooterPages/utils/caseStudiesCmsUtils';
import { defaultHelpFormFields } from '../../../FooterPages/utils/helpCmsUtils';
import { defaultCommunityFormFields } from '../../../FooterPages/utils/communityCmsUtils';
import { defaultFooterBrandFormFields } from '../../../FooterPages/utils/footerBrandCmsUtils';
import BlogBroadcastBar from '../BlogManagement/BlogBroadcastBar';

function emptyFormForCategory(category) {
  if (category === 'Careers') {
    return {
      ...EMPTY_FOOTER_RESOURCE,
      category: 'Careers',
      title: '',
      jobTitle: '',
      jobLocation: 'Remote · Worldwide',
      excerpt: 'Engineering',
      content: '',
      externalUrl: '',
      sidebarOrder: 0,
    };
  }
  if (category === 'Privacy Policy') {
    return {
      ...EMPTY_FOOTER_RESOURCE,
      category: 'Privacy Policy',
      ...defaultPrivacyFormFields(),
    };
  }
  if (category === 'Terms of Service') {
    return {
      ...EMPTY_FOOTER_RESOURCE,
      category: 'Terms of Service',
      ...defaultTermsFormFields(),
    };
  }
  if (category === 'Documentation') {
    return {
      ...EMPTY_FOOTER_RESOURCE,
      category: 'Documentation',
      ...defaultDocFormForTopic('getting-started'),
    };
  }
  if (category === 'Guides') {
    return {
      ...EMPTY_FOOTER_RESOURCE,
      category: 'Guides',
      ...defaultGuideFormFields('getting-started'),
    };
  }
  if (category === 'Tutorials') {
    return {
      ...EMPTY_FOOTER_RESOURCE,
      category: 'Tutorials',
      ...defaultTutorialFormFields('first-squad'),
    };
  }
  if (category === 'Blog') {
    return {
      ...EMPTY_FOOTER_RESOURCE,
      category: 'Blog',
      ...defaultBlogFormFields('roadmap-2026'),
    };
  }
  if (category === 'Case Studies') {
    return {
      ...EMPTY_FOOTER_RESOURCE,
      category: 'Case Studies',
      ...defaultCaseFormFields('agency-pro'),
    };
  }
  if (category === 'Help Center') {
    return {
      ...EMPTY_FOOTER_RESOURCE,
      category: 'Help Center',
      ...defaultHelpFormFields(),
    };
  }
  if (category === 'Community') {
    return {
      ...EMPTY_FOOTER_RESOURCE,
      category: 'Community',
      ...defaultCommunityFormFields(),
    };
  }
  if (category === 'Footer Brand') {
    return {
      ...EMPTY_FOOTER_RESOURCE,
      category: 'Footer Brand',
      ...defaultFooterBrandFormFields(),
    };
  }
  return { ...EMPTY_FOOTER_RESOURCE, category, title: category };
}

function resolveInitialCategory(pages, initialCategory) {
  if (initialCategory && pages.some((page) => page.category === initialCategory)) {
    return initialCategory;
  }
  return pages[0]?.category || '';
}

export default function FooterCategoryPanel({
  pages,
  footerBlock,
  introNote,
  initialCategory = '',
  onCategoryChange,
  deleteConfirm = 'Delete this entry?',
  loadError = 'Could not load footer content.',
  accentClass = 'bg-violet-600 border-violet-500',
}) {
  const [activeCategory, setActiveCategory] = useState(() => resolveInitialCategory(pages, initialCategory));
  const [allRows, setAllRows] = useState([]);
  const [formData, setFormData] = useState(() => emptyFormForCategory(pages[0]?.category || 'Documentation'));
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const hydratedRef = useRef(false);
  const formPanelRef = useRef(null);

  const activePage = useMemo(
    () => pages.find((p) => p.category === activeCategory) || pages[0],
    [pages, activeCategory],
  );

  const categoryRows = useMemo(
    () => allRows.filter((row) => row.category === activeCategory),
    [allRows, activeCategory],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { rows } = await getFooterResources('', footerBlock);
      setAllRows(rows.filter((row) => row.footerBlock === footerBlock));
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || loadError);
    } finally {
      setLoading(false);
    }
  }, [footerBlock, loadError]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!initialCategory) return;
    const next = resolveInitialCategory(pages, initialCategory);
    setActiveCategory(next);
    setEditingId('');
    setFormData(emptyFormForCategory(next));
    setStatus('');
    setError('');
  }, [initialCategory, pages]);

  useEffect(() => {
    hydratedRef.current = false;
  }, [activeCategory]);

  useEffect(() => {
    if (!activePage?.singleEntry || editingId || loading || hydratedRef.current) return;
    const first = categoryRows[0];
    if (!first) return;
    hydratedRef.current = true;
    setEditingId(first.id);
    setFormData(rowToFooterForm(first));
  }, [activePage, categoryRows, editingId, loading, activeCategory]);

  const resetForm = useCallback(() => {
    const first = categoryRows[0];
    if (activePage?.singleEntry && first) {
      hydratedRef.current = true;
      setEditingId(first.id);
      setFormData(rowToFooterForm(first));
    } else {
      setFormData(emptyFormForCategory(activeCategory));
      setEditingId('');
    }
  }, [activeCategory, activePage, categoryRows]);

  const onSelectCategory = (category) => {
    setActiveCategory(category);
    setEditingId('');
    setFormData(emptyFormForCategory(category));
    setStatus('');
    setError('');
    onCategoryChange?.(category);
  };

  const startEdit = (row) => {
    hydratedRef.current = true;
    setEditingId(row.id);
    setFormData(rowToFooterForm(row));
    setStatus('');
    setError('');
    window.requestAnimationFrame(() => {
      formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const onSubmit = async () => {
    let payload = {
      ...formData,
      category: activeCategory,
      aboutJourney: normalizeAboutJourneyForSave(formData.aboutJourney),
      aboutTeam: normalizeAboutTeamForSave(formData.aboutTeam),
    };

    if (activeCategory === 'Careers') {
      payload = normalizeCareersFormPayload(payload);
      if (!payload.jobTitle || payload.jobTitle.length < 2) {
        setError('Role Title is required (e.g. Frontend Engineer).');
        return;
      }
    } else if (!String(payload.title || '').trim()) {
      setError('Title is required.');
      return;
    }

    setSaving(true);
    setError('');
    setStatus('');
    try {
      if (editingId) {
        const updated = await updateFooterResource(editingId, payload);
        if (updated) {
          setFormData(rowToFooterForm(updated));
        }
        setStatus(
          activeCategory === 'Careers'
            ? `EventThon role saved · live on ${activePage.route}`
            : `${activeCategory} entry updated.`,
        );
      } else {
        const created = await createFooterResource(payload);
        if (created?.id) {
          setEditingId(created.id);
          setFormData(rowToFooterForm(created));
          hydratedRef.current = true;
        }
        setStatus(
          activeCategory === 'Careers'
            ? `EventThon role created · live on ${activePage.route}`
            : `${activeCategory} entry created.`,
        );
      }
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm(deleteConfirm)) return;
    setError('');
    try {
      await deleteFooterResource(id);
      if (editingId === id) resetForm();
      setStatus('Entry deleted.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Delete failed.');
    }
  };

  const showDbSeed = [
    'Privacy Policy',
    'Terms of Service',
    'Documentation',
    'Guides',
    'Tutorials',
    'Blog',
    'Case Studies',
    'Help Center',
    'Community',
    'Footer Brand',
  ].includes(activeCategory);

  const onSeedDbDefaults = async () => {
    const force = window.confirm(
      'Seed missing Privacy / Terms / Docs / Guides / Tutorials / Blog into the database?\n\nOK = only missing rows\nCancel = abort',
    );
    if (!force) return;
    setSaving(true);
    setError('');
    setStatus('');
    try {
      const result = await seedFooterDefaults(false);
      const created = result?.createdCount ?? 0;
      const skipped = result?.skippedCount ?? 0;
      setStatus(`DB seed done · created ${created}, skipped ${skipped} (already present).`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Seed failed.');
    } finally {
      setSaving(false);
    }
  };

  if (!activePage) return null;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full flex flex-col gap-2">
        {introNote ? <p className="text-xs text-slate-200">{introNote}</p> : null}
        <div className="flex flex-wrap gap-2">
          {pages.map((page) => (
            <button
              key={page.category}
              type="button"
              onClick={() => onSelectCategory(page.category)}
              className={`rounded-xl px-3 py-2 text-[11px] font-bold border transition-colors ${
                activeCategory === page.category
                  ? `${accentClass} text-white`
                  : 'bg-[#111622] border-slate-800 text-slate-200 hover:border-slate-600'
              }`}
            >
              {page.title}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-cyan-200/90">
          Public page:{' '}
          <a href={activePage.route} target="_blank" rel="noreferrer" className="underline">
            {activePage.route}
          </a>
          {' · '}
          {activePage.hint}
        </p>
        {activeCategory === 'Contact Us' ? (
          <p className="text-[11px] text-cyan-200/90 rounded-xl border border-cyan-500/30 bg-cyan-600/10 px-3 py-2">
            Synced live to{' '}
            <a href="/company/contact" target="_blank" rel="noreferrer" className="underline font-bold">
              /company/contact
            </a>
            . Fill email, phone, location, hours, Contact Intro, and Contact Context — all appear on the public page.
          </p>
        ) : null}
        {activeCategory === 'Privacy Policy' ? (
          <p className="text-[11px] text-cyan-200/90 rounded-xl border border-cyan-500/30 bg-cyan-600/10 px-3 py-2">
            Synced live to{' '}
            <a href="/company/privacy" target="_blank" rel="noreferrer" className="underline font-bold">
              /company/privacy
            </a>
            . Edit Last Updated, Intro, and section cards — Save to publish. Use “Load default 18 sections” for the starter copy.
          </p>
        ) : null}
        {activeCategory === 'Terms of Service' ? (
          <>
            <p className="text-[11px] text-sky-200/90 rounded-xl border border-sky-500/30 bg-sky-600/10 px-3 py-2">
              Synced live to{' '}
              <a href="/company/terms" target="_blank" rel="noreferrer" className="underline font-bold">
                /company/terms
              </a>
              . Same layout as public: Intro, 18 cards (#17–18 full width), Contact mailto, Commitment banner. Use “Load default 18 sections” then Save.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="#tos-admin-sec-16"
                className="rounded-lg border border-sky-500/50 bg-sky-600/15 px-3 py-1.5 text-[11px] font-bold text-sky-100 hover:bg-sky-600/30"
              >
                Jump to #17 Governing
              </a>
              <a
                href="#tos-admin-sec-17"
                className="rounded-lg border border-sky-500/50 bg-sky-600/15 px-3 py-1.5 text-[11px] font-bold text-sky-100 hover:bg-sky-600/30"
              >
                Jump to #18 Contact
              </a>
            </div>
          </>
        ) : null}
        {activeCategory === 'Careers' ? (
          <p className="text-[11px] text-violet-200/90 rounded-xl border border-violet-500/30 bg-violet-600/10 px-3 py-2">
            EventThon company hiring only. Each entry is one role on{' '}
            <a href="/company/careers" target="_blank" rel="noreferrer" className="underline font-bold">
              /company/careers
            </a>
            {' '}(e.g. Frontend Engineer @ EventThon). Not for marketplace or client jobs.
          </p>
        ) : null}
        {activeCategory === 'Documentation' ? (
          <p className="text-[11px] text-blue-200/90 rounded-xl border border-blue-500/30 bg-blue-600/10 px-3 py-2">
            Synced live to{' '}
            <a href="/resources/documentation" target="_blank" rel="noreferrer" className="underline font-bold">
              /resources/documentation
            </a>
            . One entry = one topic. Pick Topic, edit Intro / body (or Quick Start callout + steps), Save. Use “Load defaults for this topic”.
          </p>
        ) : null}
        {activeCategory === 'Guides' ? (
          <p className="text-[11px] text-blue-200/90 rounded-xl border border-blue-500/30 bg-blue-600/10 px-3 py-2">
            Synced live to{' '}
            <a href="/resources/guides" target="_blank" rel="noreferrer" className="underline font-bold">
              /resources/guides
            </a>
            . One entry = one guide card. Set level, category, steps, progress, and Featured. Use “Load template” for starter copy.
          </p>
        ) : null}
        {activeCategory === 'Tutorials' ? (
          <p className="text-[11px] text-violet-200/90 rounded-xl border border-violet-500/30 bg-violet-600/10 px-3 py-2">
            Synced live to{' '}
            <a href="/resources/tutorials" target="_blank" rel="noreferrer" className="underline font-bold">
              /resources/tutorials
            </a>
            . One entry = one video card. Set level, duration, lessons, category, video URL, and Featured. Use “Load template”.
          </p>
        ) : null}
        {activeCategory === 'Blog' ? (
          <p className="text-[11px] text-violet-200/90 rounded-xl border border-violet-500/30 bg-violet-600/10 px-3 py-2">
            Synced live to{' '}
            <a href="/resources/blog" target="_blank" rel="noreferrer" className="underline font-bold">
              /resources/blog
            </a>
            . One entry = one post card. Set category, summary, author, date, read time, and cover. Use “Load template”.
          </p>
        ) : null}
        {activeCategory === 'Case Studies' ? (
          <p className="text-[11px] text-violet-200/90 rounded-xl border border-violet-500/30 bg-violet-600/10 px-3 py-2">
            Synced live to{' '}
            <a href="/resources/case-studies" target="_blank" rel="noreferrer" className="underline font-bold">
              /resources/case-studies
            </a>
            . One entry = one case card. Metrics + Featured (order 0). Prefer Admin → Case Studies.
          </p>
        ) : null}
        {activeCategory === 'Help Center' ? (
          <p className="text-[11px] text-violet-200/90 rounded-xl border border-violet-500/30 bg-violet-600/10 px-3 py-2">
            Synced live to{' '}
            <a href="/resources/help" target="_blank" rel="noreferrer" className="underline font-bold">
              /resources/help
            </a>
            . One entry drives categories, featured articles, FAQ, and status. Prefer Admin → Help Center.
          </p>
        ) : null}
        {activeCategory === 'Community' ? (
          <p className="text-[11px] text-violet-200/90 rounded-xl border border-violet-500/30 bg-violet-600/10 px-3 py-2">
            Synced live to{' '}
            <a href="/resources/community" target="_blank" rel="noreferrer" className="underline font-bold">
              /resources/community
            </a>
            . One entry drives discussions, events, members, Discord. Prefer Admin → Community Management.
          </p>
        ) : null}
        {activeCategory === 'Footer Brand' ? (
          <p className="text-[11px] text-violet-200/90 rounded-xl border border-violet-500/30 bg-violet-600/10 px-3 py-2">
            Synced live to the site footer brand column. Title = brand name, Tagline + Description + social
            URLs. Prefer Admin → Footer Brand & Social.
          </p>
        ) : null}
        {showDbSeed ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              disabled={saving}
              onClick={onSeedDbDefaults}
              className="rounded-lg border border-emerald-500/50 bg-emerald-600/20 px-3 py-1.5 text-[11px] font-bold text-emerald-100 hover:bg-emerald-600/35 disabled:opacity-50"
            >
              Seed DB defaults
            </button>
          </div>
        ) : null}
        {activeCategory === 'About Us' ? (
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href="#about-cms-journey"
              className="rounded-lg border border-violet-500/50 bg-violet-600/15 px-3 py-1.5 text-[11px] font-bold text-violet-100 hover:bg-violet-600/30"
            >
              Jump to Our Journey
            </a>
            <a
              href="#about-cms-team"
              className="rounded-lg border border-violet-500/50 bg-violet-600/15 px-3 py-1.5 text-[11px] font-bold text-violet-100 hover:bg-violet-600/30"
            >
              Jump to Leadership Team
            </a>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-xs font-semibold text-rose-300">{error}</p> : null}
      {status ? <p className="text-xs font-semibold text-emerald-300">{status}</p> : null}

      {activeCategory === 'Blog' ? (
        <BlogBroadcastBar
          editingId={editingId}
          postTitle={formData?.title || ''}
          postExcerpt={formData?.excerpt || ''}
        />
      ) : null}

      <FooterResourceFormPanel
        formPanelRef={formPanelRef}
        formData={formData}
        onChange={setFormData}
        onSubmit={onSubmit}
        onReset={resetForm}
        saving={saving}
        editingId={editingId}
        lockCategory={activeCategory}
        formTitle={editingId ? `Edit ${activePage.title}` : `Add ${activePage.title} content`}
      />

      <section className={PANEL_CLASS}>
        <h2 className="text-sm font-bold text-white tracking-tight">
          {activePage.title} entries ({categoryRows.length})
        </h2>
        {activePage.singleEntry && categoryRows.length > 1 ? (
          <p className="text-[11px] text-amber-200">
            This page works best with one entry; the first saved row is shown on the public page.
          </p>
        ) : null}
        <FooterResourceList
          rows={categoryRows}
          loading={loading}
          editingId={editingId}
          onEdit={startEdit}
          onDelete={onDelete}
          emptyHint={
            activeCategory === 'Careers'
              ? 'No EventThon roles yet. Add Frontend Engineer, Backend Engineer, UI/UX Designer, etc. — they sync live to /company/careers.'
              : activeCategory === 'Privacy Policy'
                ? 'No Privacy Policy entry yet. Fill Intro + sections below (or Load defaults) and Save — live on /company/privacy.'
                : activeCategory === 'Terms of Service'
                  ? 'No Terms entry yet. Load defaults or write sections, then Save — live on /company/terms.'
                  : activeCategory === 'Documentation'
                    ? 'No doc topics yet. Add Getting Started (Quick Start) first, then other topics — live on /resources/documentation.'
                    : activeCategory === 'Guides'
                      ? 'No guides yet. Load a template (Getting Started, Squads…) and Save — live on /resources/guides.'
                      : activeCategory === 'Tutorials'
                        ? 'No tutorials yet. Load a template and Save — live on /resources/tutorials.'
                        : activeCategory === 'Blog'
                          ? 'No blog posts yet. Load a template and Save — live on /resources/blog.'
                          : activeCategory === 'Case Studies'
                            ? 'No case studies yet. Load a starter and Save — live on /resources/case-studies.'
                            : activeCategory === 'Help Center'
                              ? 'No Help Center entry yet. Load defaults and Save — live on /resources/help.'
                              : activeCategory === 'Community'
                                ? 'No Community entry yet. Load defaults and Save — live on /resources/community.'
                                : activeCategory === 'Footer Brand'
                                  ? 'No Footer Brand entry yet. Load defaults, set social URLs, and Save — live on the site footer.'
                              : undefined
          }
        />
      </section>
    </div>
  );
}
