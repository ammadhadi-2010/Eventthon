import React, { useMemo, useState } from 'react';
import {
  BLOG_CATEGORY_OPTIONS,
  defaultBlogFormFields,
  parseBlogContent,
  serializeBlogContent,
} from '../../../FooterPages/utils/blogCmsUtils';
import { BLOG_POSTS } from '../../../FooterPages/data/blogData';
import {
  FooterField,
  FooterResourceImagePreview,
  FooterTextArea,
  FooterTextInput,
} from './FooterResourceFieldKit';
import FooterMediaSubmitButton from './FooterMediaSubmitButton';
import { LABEL_CLASS } from './footerResourceConstants';

export default function BlogAdminFields({ formData, onChange, onMediaUploaded, saving }) {
  const [templateId, setTemplateId] = useState(BLOG_POSTS[0]?.id || 'roadmap-2026');
  const parsed = useMemo(() => parseBlogContent(formData.content), [formData.content]);
  const patch = (partial) => onChange({ ...formData, ...partial });
  const writeContent = (summary, body) => {
    patch({ content: serializeBlogContent({ summary, body }) });
  };

  return (
    <>
      <div className="rounded-xl border border-violet-400/40 bg-violet-500/10 px-4 py-3 text-[12px] text-violet-100 space-y-2">
        <p>
          <strong className="text-white">Write a blog post</strong> — Save publishes to{' '}
          <a href="/resources/blog" target="_blank" rel="noreferrer" className="underline font-bold">
            /resources/blog
          </a>
          . Summary shows on the card; Article body is stored for the full post.
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="fr-select max-w-[240px]"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            aria-label="Blog template"
          >
            {BLOG_POSTS.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => patch({ ...defaultBlogFormFields(templateId), category: 'Blog' })}
            className="rounded-lg border border-violet-500/60 bg-violet-600/25 px-3 py-1.5 text-[11px] font-bold text-white"
          >
            Load starter post
          </button>
        </div>
      </div>

      <FooterField id="blog-summary" label="Card summary" hint="Short teaser on the public blog grid (1–2 lines).">
        <FooterTextArea
          id="blog-summary"
          value={parsed.summary}
          onChange={(e) => writeContent(e.target.value, parsed.body)}
          placeholder="A look at squads, gigs, jobs…"
          maxLength={2000}
          rows={3}
        />
      </FooterField>

      <FooterField id="blog-body" label="Article body" hint="Full post text. Use plain paragraphs for now.">
        <FooterTextArea
          id="blog-body"
          value={parsed.body}
          onChange={(e) => writeContent(parsed.summary, e.target.value)}
          placeholder="Write the full article here…"
          maxLength={20000}
          rows={8}
        />
      </FooterField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS} htmlFor="blog-category">Category</label>
          <select
            id="blog-category"
            className="fr-select"
            value={formData.pricingLabel || 'platform-updates'}
            onChange={(e) => {
              const id = e.target.value;
              const opt = BLOG_CATEGORY_OPTIONS.find((c) => c.id === id);
              patch({ pricingLabel: id, excerpt: opt?.label || formData.excerpt });
            }}
          >
            {BLOG_CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
        <FooterField id="blog-cat-label" label="Category label" hint="Tag on the card.">
          <FooterTextInput
            id="blog-cat-label"
            value={formData.excerpt}
            onChange={(e) => patch({ excerpt: e.target.value })}
            placeholder="Platform Updates"
            maxLength={120}
          />
        </FooterField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FooterField id="blog-author" label="Author">
          <FooterTextInput
            id="blog-author"
            value={formData.authorName}
            onChange={(e) => patch({ authorName: e.target.value })}
            placeholder="Hadia Emaan"
            maxLength={120}
          />
        </FooterField>
        <FooterField id="blog-date" label="Publish date">
          <FooterTextInput
            id="blog-date"
            value={formData.policyVersion}
            onChange={(e) => patch({ policyVersion: e.target.value })}
            placeholder="May 18, 2026"
            maxLength={40}
          />
        </FooterField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FooterField id="blog-read" label="Read time">
          <FooterTextInput
            id="blog-read"
            value={formData.readTime}
            onChange={(e) => patch({ readTime: e.target.value })}
            placeholder="6 min read"
            maxLength={40}
          />
        </FooterField>
        <FooterField id="blog-order" label="Sort order" hint="Lower = higher on the grid.">
          <FooterTextInput
            id="blog-order"
            type="number"
            value={String(formData.sidebarOrder ?? 0)}
            onChange={(e) => patch({ sidebarOrder: Number(e.target.value) || 0 })}
            min={0}
            max={9999}
          />
        </FooterField>
      </div>

      <FooterField id="blog-avatar" label="Author avatar URL">
        <FooterTextInput
          id="blog-avatar"
          value={formData.authorAvatarUrl}
          onChange={(e) => patch({ authorAvatarUrl: e.target.value })}
          placeholder="https://…"
          maxLength={500}
        />
        <FooterResourceImagePreview imageurl={formData.authorAvatarUrl} alt="Author" />
      </FooterField>

      <FooterField id="blog-cover" label="Cover image" hint="Upload or paste URL for the card thumbnail.">
        <FooterMediaSubmitButton onUploaded={onMediaUploaded} disabled={saving} />
        <FooterTextInput
          id="blog-cover"
          value={formData.imageurl}
          onChange={(e) => patch({ imageurl: e.target.value })}
          placeholder="https://…"
          maxLength={500}
        />
        <FooterResourceImagePreview imageurl={formData.imageurl} tall />
      </FooterField>

      <div className="rounded-xl border border-slate-700 bg-[#111622] p-3 space-y-2">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">Public card preview</p>
        <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-[#0b1220]">
          <div className="h-16 grid place-items-center bg-gradient-to-br from-violet-700/50 to-slate-900 text-[11px] font-bold text-violet-100">
            Cover
          </div>
          <div className="p-3 space-y-1.5">
            <p className="text-[10px] font-extrabold uppercase text-violet-300">{formData.excerpt || 'Category'}</p>
            <p className="text-sm font-extrabold text-white">{formData.title || 'Post title'}</p>
            <p className="text-[11px] text-slate-200 line-clamp-2">{parsed.summary || 'Summary…'}</p>
            <p className="text-[11px] font-bold text-slate-300">
              {formData.authorName || 'Author'} · {formData.policyVersion || 'Date'} · {formData.readTime || '5 min read'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
