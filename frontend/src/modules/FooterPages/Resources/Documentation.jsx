import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FooterPageShell from '../components/FooterPageShell';
import DocsSideNav from '../components/DocsSideNav';
import DocsRightRail from '../components/DocsRightRail';
import DocsQuickStart, { DocsTopicArticle } from '../components/DocsQuickStart';
import useResourcesFooterContent from '../hooks/useResourcesFooterContent';
import { DOC_NAV_GROUPS, DOC_PAGES, DOC_TOC } from '../data/documentationData';
import { buildDocsCrumbs } from '../utils/footerBreadcrumbs';
import '../styles/documentation.css';

export default function Documentation() {
  const { data, loading } = useResourcesFooterContent('Documentation');
  const [searchParams, setSearchParams] = useSearchParams();
  const topicFromUrl = searchParams.get('topic') || 'getting-started';
  const [topicId, setTopicId] = useState(topicFromUrl);
  const [query, setQuery] = useState('');
  const [tocId, setTocId] = useState(DOC_TOC[0]?.id || 'what');

  useEffect(() => {
    setTopicId(topicFromUrl);
  }, [topicFromUrl]);

  const pages = data?.pages || DOC_PAGES;
  const page = pages[topicId] || pages['getting-started'] || DOC_PAGES['getting-started'];
  const isQuickStart = page?.kind === 'quickstart';
  const crumbs = useMemo(() => buildDocsCrumbs(topicId, page), [topicId, page]);

  const onSelect = useCallback(
    (id) => {
      setTopicId(id);
      setTocId(DOC_TOC[0]?.id || 'what');
      setSearchParams(id === 'getting-started' ? { topic: id } : { topic: id });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setSearchParams],
  );

  const onTocClick = useCallback((id) => {
    setTocId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    const hit = DOC_NAV_GROUPS.flatMap((g) => g.items).find(
      (item) => !item.to && item.label.toLowerCase().includes(q),
    );
    if (hit) onSelect(hit.id);
  }, [query, onSelect]);

  return (
    <FooterPageShell
      variant="resources"
      breadcrumbs={crumbs}
      leftSlot={
        <DocsSideNav
          activeId={topicId}
          onSelect={onSelect}
          query={query}
          onQueryChange={setQuery}
        />
      }
      rightSlot={
        <DocsRightRail activeTocId={tocId} onTocClick={onTocClick} showToc={isQuickStart} />
      }
    >
      <div className="docs-page">
        {loading ? <p className="docs-article__meta">Loading documentation…</p> : null}
        {isQuickStart ? <DocsQuickStart page={page} /> : <DocsTopicArticle page={page} />}
      </div>
    </FooterPageShell>
  );
}
