import React, { useState } from 'react';
import {
  TUTORIAL_CATEGORY_OPTIONS,
  TUTORIAL_LEVELS,
  defaultTutorialFormFields,
} from '../../../FooterPages/utils/tutorialsCmsUtils';
import { TUTORIALS } from '../../../FooterPages/data/tutorialsData';
import {
  FooterField,
  FooterResourceImagePreview,
  FooterTextArea,
  FooterTextInput,
} from './FooterResourceFieldKit';
import FooterMediaSubmitButton from './FooterMediaSubmitButton';
import { LABEL_CLASS } from './footerResourceConstants';

export default function TutorialsAdminFields({ formData, onChange, onMediaUploaded, saving }) {
  const [templateId, setTemplateId] = useState(TUTORIALS[0]?.id || 'first-squad');
  const featured = Number(formData.sidebarOrder ?? 0) < 100;
  const patch = (partial) => onChange({ ...formData, ...partial });

  return (
    <>
      <div className="rounded-xl border border-violet-400/40 bg-violet-500/10 px-4 py-3 text-[12px] text-violet-100 space-y-2">
        <p>
          <strong className="text-white">Tutorials CMS</strong> — one row per video card, live on{' '}
          <a href="/resources/tutorials" target="_blank" rel="noreferrer" className="underline font-bold">
            /resources/tutorials
          </a>
          . Featured (order &lt; 100) shows in the top row; others appear under All Tutorials.
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="fr-select max-w-[220px]"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            aria-label="Tutorial template"
          >
            {TUTORIALS.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => patch({ ...defaultTutorialFormFields(templateId), category: 'Tutorials' })}
            className="rounded-lg border border-violet-500/60 bg-violet-600/25 px-3 py-1.5 text-[11px] font-bold text-white"
          >
            Load template
          </button>
        </div>
      </div>

      <FooterField id="tut-summary" label="Summary" hint="Card description under the title.">
        <FooterTextArea
          id="tut-summary"
          value={formData.content}
          onChange={(e) => patch({ content: e.target.value })}
          placeholder="Create a squad, invite members…"
          maxLength={2000}
          rows={3}
        />
      </FooterField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS} htmlFor="tut-level">Level</label>
          <select
            id="tut-level"
            className="fr-select"
            value={formData.excerpt || 'Beginner'}
            onChange={(e) => patch({ excerpt: e.target.value })}
          >
            {TUTORIAL_LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        <FooterField id="tut-duration" label="Duration" hint="e.g. 14:20">
          <FooterTextInput
            id="tut-duration"
            value={formData.readTime}
            onChange={(e) => patch({ readTime: e.target.value })}
            placeholder="14:20"
            maxLength={40}
          />
        </FooterField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS} htmlFor="tut-category">Category</label>
          <select
            id="tut-category"
            className="fr-select"
            value={formData.pricingLabel || 'getting-started'}
            onChange={(e) => patch({ pricingLabel: e.target.value })}
          >
            {TUTORIAL_CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
        <FooterField id="tut-lessons" label="Lessons" hint="Shown on the card.">
          <FooterTextInput
            id="tut-lessons"
            type="number"
            value={String(formData.pricingPrice ?? 3)}
            onChange={(e) => patch({ pricingPrice: e.target.value })}
            min={0}
            max={99}
          />
        </FooterField>
      </div>

      <FooterField id="tut-video" label="Video URL" hint="YouTube / Vimeo / embed link opened on play.">
        <FooterTextInput
          id="tut-video"
          value={formData.videourl}
          onChange={(e) => patch({ videourl: e.target.value })}
          placeholder="https://youtube.com/watch?v=…"
          maxLength={500}
        />
      </FooterField>

      <FooterField id="tut-thumb" label="Thumbnail image URL" hint="Optional cover for the featured card.">
        <FooterMediaSubmitButton onUploaded={onMediaUploaded} disabled={saving} />
        <FooterTextInput
          id="tut-thumb"
          value={formData.imageurl}
          onChange={(e) => patch({ imageurl: e.target.value })}
          placeholder="https://…"
          maxLength={500}
        />
        <FooterResourceImagePreview imageurl={formData.imageurl} tall />
      </FooterField>

      <FooterField id="tut-order" label="Sort order" hint="Lower first. Use 100+ for list-only (not featured).">
        <FooterTextInput
          id="tut-order"
          type="number"
          value={String(formData.sidebarOrder ?? 0)}
          onChange={(e) => patch({ sidebarOrder: Number(e.target.value) || 0 })}
          min={0}
          max={9999}
        />
      </FooterField>

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
        Featured in top row (unchecked → All Tutorials only)
      </label>

      <div className="rounded-xl border border-slate-700 bg-[#111622] p-3 space-y-2">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">Live card preview</p>
        <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-[#0b1220]">
          <div className="h-20 grid place-items-center bg-gradient-to-br from-violet-700/50 to-slate-900 text-violet-100 text-xs font-bold">
            ▶ {formData.readTime || '10:00'}
          </div>
          <div className="p-3 space-y-1.5">
            <p className="text-sm font-extrabold text-white">{formData.title || 'Tutorial title'}</p>
            <p className="text-[11px] text-slate-200 line-clamp-2">{formData.content || 'Summary…'}</p>
            <p className="text-[11px] font-bold text-slate-300">
              {formData.excerpt || 'Beginner'} · {formData.readTime || '10:00'} · {formData.pricingPrice || 0} lessons
              {featured ? ' · Featured' : ''}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
