import React from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import FooterCategoryPanel from '../FooterResources/FooterCategoryPanel';
import { RESOURCES_FOOTER_PAGES } from '../../../FooterPages/config/resourcesFooterConfig';
import { SHELL_CLASS } from '../FooterResources/footerResourceConstants';

const BLOG_PAGES = RESOURCES_FOOTER_PAGES.filter((page) => page.category === 'Blog');

/**
 * Dedicated Blog writer admin.
 * Uses the same Footer CMS API as other resource pages (standard for this app):
 * admin create/edit → Mongo footer_resources → public /resources/blog.
 */
export default function AdminBlogManagementPage() {
  return (
    <div className={SHELL_CLASS}>
      <header className="w-full flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight">Blog Management</h1>
          <p className="text-xs text-slate-200 mt-1 max-w-2xl">
            Write and publish posts for the public blog. Each saved entry becomes one card on{' '}
            <strong className="text-white">/resources/blog</strong>. Use summary for the card teaser and
            article body for the full post text.
          </p>
        </div>
        <Link
          to="/resources/blog"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-violet-500/50 bg-violet-600/20 px-3 py-2 text-[11px] font-bold text-violet-100 hover:bg-violet-600/35"
        >
          <FiExternalLink size={13} aria-hidden /> View live blog
        </Link>
      </header>

      <div className="rounded-2xl border border-violet-500/35 bg-violet-500/10 px-4 py-3 text-[12px] text-violet-100">
        <strong className="text-white">How it works:</strong> New Post → fill title, summary, category,
        author, cover → Save. Edits sync immediately to the public page. Seed DB fills starter posts if empty.
      </div>

      <FooterCategoryPanel
        pages={BLOG_PAGES}
        footerBlock="resources"
        initialCategory="Blog"
        introNote=""
        deleteConfirm="Delete this blog post? It will disappear from /resources/blog."
        loadError="Could not load blog posts."
        accentClass="bg-violet-600 border-violet-500"
      />
    </div>
  );
}
