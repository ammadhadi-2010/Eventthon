import React, { useMemo, useState } from 'react';
import {
  CASE_CATEGORY_OPTIONS,
  defaultCaseFormFields,
  parseCaseContent,
  serializeCaseContent,
} from '../../../FooterPages/utils/caseStudiesCmsUtils';
import { CASE_STUDIES } from '../../../FooterPages/data/caseStudiesData';
import {
  FooterField,
  FooterResourceImagePreview,
  FooterTextArea,
  FooterTextInput,
} from './FooterResourceFieldKit';
import FooterMediaSubmitButton from './FooterMediaSubmitButton';
import { LABEL_CLASS } from './footerResourceConstants';

function MetricFields({ metrics, onChange }) {
  const rows = [...metrics, ...Array(Math.max(0, 3 - metrics.length)).fill({ value: '', label: '' })].slice(0, 3);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {rows.map((m, index) => (
        <div key={`metric-${index}`} className="grid grid-cols-2 gap-2">
          <FooterTextInput
            id={`cs-m-v-${index}`}
            value={m.value}
            onChange={(e) => {
              const next = rows.map((row, i) => (i === index ? { ...row, value: e.target.value } : row));
              onChange(next.filter((row) => row.value || row.label));
            }}
            placeholder="300%"
            maxLength={20}
          />
          <FooterTextInput
            id={`cs-m-l-${index}`}
            value={m.label}
            onChange={(e) => {
              const next = rows.map((row, i) => (i === index ? { ...row, label: e.target.value } : row));
              onChange(next.filter((row) => row.value || row.label));
            }}
            placeholder="Growth"
            maxLength={40}
          />
        </div>
      ))}
    </div>
  );
}

export default function CaseStudiesAdminFields({ formData, onChange, onMediaUploaded, saving }) {
  const [templateId, setTemplateId] = useState(CASE_STUDIES[0]?.id || 'agency-pro');
  const parsed = useMemo(() => parseCaseContent(formData.content), [formData.content]);
  const featured = Number(formData.sidebarOrder ?? 0) === 0;
  const patch = (partial) => onChange({ ...formData, ...partial });
  const write = (summary, metrics) => patch({ content: serializeCaseContent({ summary, metrics }) });

  return (
    <>
      <div className="rounded-xl border border-violet-400/40 bg-violet-500/10 px-4 py-3 text-[12px] text-violet-100 space-y-2">
        <p>
          <strong className="text-white">Case Study editor</strong> — publishes to{' '}
          <a href="/resources/case-studies" target="_blank" rel="noreferrer" className="underline font-bold">
            /resources/case-studies
          </a>
          . Sort order <strong>0</strong> = Featured strip.
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          <select className="fr-select max-w-[240px]" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            {CASE_STUDIES.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => patch({ ...defaultCaseFormFields(templateId), category: 'Case Studies' })}
            className="rounded-lg border border-violet-500/60 bg-violet-600/25 px-3 py-1.5 text-[11px] font-bold text-white"
          >
            Load starter
          </button>
        </div>
      </div>

      <FooterField id="cs-summary" label="Summary" hint="Card teaser under the title.">
        <FooterTextArea
          id="cs-summary"
          value={parsed.summary}
          onChange={(e) => write(e.target.value, parsed.metrics)}
          placeholder="How one agency unified squads…"
          maxLength={2000}
          rows={3}
        />
      </FooterField>

      <FooterField id="cs-metrics" label="Metrics (up to 3)" hint="Value + label shown on the card.">
        <MetricFields metrics={parsed.metrics} onChange={(metrics) => write(parsed.summary, metrics)} />
      </FooterField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS} htmlFor="cs-category">Category</label>
          <select
            id="cs-category"
            className="fr-select"
            value={formData.pricingLabel || 'business'}
            onChange={(e) => {
              const id = e.target.value;
              const opt = CASE_CATEGORY_OPTIONS.find((c) => c.id === id);
              patch({ pricingLabel: id, excerpt: opt?.label || formData.excerpt });
            }}
          >
            {CASE_CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
        <FooterField id="cs-cat-label" label="Category label">
          <FooterTextInput
            id="cs-cat-label"
            value={formData.excerpt}
            onChange={(e) => patch({ excerpt: e.target.value })}
            placeholder="Business"
            maxLength={120}
          />
        </FooterField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FooterField id="cs-author" label="Author">
          <FooterTextInput
            id="cs-author"
            value={formData.authorName}
            onChange={(e) => patch({ authorName: e.target.value })}
            placeholder="Hadia Emaan"
            maxLength={120}
          />
        </FooterField>
        <FooterField id="cs-date" label="Publish date">
          <FooterTextInput
            id="cs-date"
            value={formData.policyVersion}
            onChange={(e) => patch({ policyVersion: e.target.value })}
            placeholder="May 18, 2026"
            maxLength={40}
          />
        </FooterField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FooterField id="cs-read" label="Read time">
          <FooterTextInput
            id="cs-read"
            value={formData.readTime}
            onChange={(e) => patch({ readTime: e.target.value })}
            placeholder="8 min read"
            maxLength={40}
          />
        </FooterField>
        <FooterField id="cs-order" label="Sort order" hint="0 = Featured.">
          <FooterTextInput
            id="cs-order"
            type="number"
            value={String(formData.sidebarOrder ?? 10)}
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
          onChange={(e) => patch({ sidebarOrder: e.target.checked ? 0 : 10 })}
        />
        Featured case study strip
      </label>

      <FooterField id="cs-avatar" label="Author avatar URL">
        <FooterTextInput
          id="cs-avatar"
          value={formData.authorAvatarUrl}
          onChange={(e) => patch({ authorAvatarUrl: e.target.value })}
          placeholder="https://…"
          maxLength={500}
        />
      </FooterField>

      <FooterField id="cs-cover" label="Cover image">
        <FooterMediaSubmitButton onUploaded={onMediaUploaded} disabled={saving} />
        <FooterTextInput
          id="cs-cover"
          value={formData.imageurl}
          onChange={(e) => patch({ imageurl: e.target.value })}
          placeholder="https://…"
          maxLength={500}
        />
        <FooterResourceImagePreview imageurl={formData.imageurl} tall />
      </FooterField>
    </>
  );
}
