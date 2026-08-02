import React, { useMemo, useState } from 'react';
import {
  GUIDE_CATEGORY_OPTIONS,
  GUIDE_ICON_OPTIONS,
  GUIDE_LEVELS,
  defaultGuideFormFields,
  parseGuideContent,
  serializeGuideContent,
} from '../../../FooterPages/utils/guidesCmsUtils';
import { GUIDES } from '../../../FooterPages/data/guidesData';
import { FooterField, FooterTextArea, FooterTextInput } from './FooterResourceFieldKit';
import { LABEL_CLASS } from './footerResourceConstants';

export default function GuidesAdminFields({ formData, onChange }) {
  const [templateId, setTemplateId] = useState(GUIDES[0]?.id || 'getting-started');
  const parsed = useMemo(() => parseGuideContent(formData.content), [formData.content]);
  const featured = Number(formData.sidebarOrder ?? 0) < 100;

  const patch = (partial) => onChange({ ...formData, ...partial });

  const writeSummaryProgress = (summary, progress) => {
    patch({ content: serializeGuideContent({ summary, progress }) });
  };

  return (
    <>
      <div className="rounded-xl border border-blue-400/40 bg-blue-500/10 px-4 py-3 text-[12px] text-blue-100 space-y-2">
        <p>
          <strong className="text-white">Guides CMS</strong> — one row per guide card, live on{' '}
          <a href="/resources/guides" target="_blank" rel="noreferrer" className="underline font-bold">
            /resources/guides
          </a>
          . Featured (order &lt; 100) shows in the grid; others appear in the list below.
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="fr-select max-w-[220px]"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            aria-label="Guide template"
          >
            {GUIDES.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => patch({ ...defaultGuideFormFields(templateId), category: 'Guides' })}
            className="rounded-lg border border-blue-500/60 bg-blue-600/25 px-3 py-1.5 text-[11px] font-bold text-white"
          >
            Load template
          </button>
        </div>
      </div>

      <FooterField id="guide-summary" label="Summary" hint="Card description under the title.">
        <FooterTextArea
          id="guide-summary"
          value={parsed.summary}
          onChange={(e) => writeSummaryProgress(e.target.value, parsed.progress)}
          placeholder="Create your account, verify email…"
          maxLength={2000}
          rows={3}
        />
      </FooterField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS} htmlFor="guide-level">Level</label>
          <select
            id="guide-level"
            className="fr-select"
            value={formData.excerpt || 'Beginner'}
            onChange={(e) => patch({ excerpt: e.target.value })}
          >
            {GUIDE_LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        <FooterField id="guide-time" label="Read time" hint="e.g. 7 min">
          <FooterTextInput
            id="guide-time"
            value={formData.readTime}
            onChange={(e) => patch({ readTime: e.target.value })}
            placeholder="7 min"
            maxLength={40}
          />
        </FooterField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS} htmlFor="guide-category">Category</label>
          <select
            id="guide-category"
            className="fr-select"
            value={formData.pricingLabel || 'getting-started'}
            onChange={(e) => patch({ pricingLabel: e.target.value })}
          >
            {GUIDE_CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="guide-icon">Icon</label>
          <select
            id="guide-icon"
            className="fr-select"
            value={formData.jobTitle || 'rocket'}
            onChange={(e) => patch({ jobTitle: e.target.value })}
          >
            {GUIDE_ICON_OPTIONS.map((icon) => (
              <option key={icon} value={icon}>{icon}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FooterField id="guide-steps" label="Steps" hint="Shown on the card.">
          <FooterTextInput
            id="guide-steps"
            type="number"
            value={String(formData.pricingPrice ?? 0)}
            onChange={(e) => patch({ pricingPrice: e.target.value })}
            min={0}
            max={99}
          />
        </FooterField>
        <FooterField id="guide-progress" label="Progress %" hint="0–100 completion bar.">
          <FooterTextInput
            id="guide-progress"
            type="number"
            value={String(parsed.progress)}
            onChange={(e) => writeSummaryProgress(parsed.summary, e.target.value)}
            min={0}
            max={100}
          />
        </FooterField>
        <FooterField id="guide-order" label="Sort order" hint="Lower first. Use 100+ for list-only.">
          <FooterTextInput
            id="guide-order"
            type="number"
            value={String(formData.sidebarOrder ?? 0)}
            onChange={(e) => patch({ sidebarOrder: Number(e.target.value) || 0 })}
            min={0}
            max={9999}
          />
        </FooterField>
      </div>

      <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => {
            const on = e.target.checked;
            const order = Number(formData.sidebarOrder ?? 0);
            patch({
              sidebarOrder: on
                ? (order >= 100 ? order - 100 : order)
                : (order < 100 ? order + 100 : order),
            });
          }}
        />
        Featured in grid (unchecked → list section)
      </label>
    </>
  );
}
