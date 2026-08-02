import React, { useMemo } from 'react';
import {
  DOC_TOPIC_OPTIONS,
  defaultDocFormForTopic,
  isQuickStartTopic,
  parseDocTopic,
  parseQuickStart,
  serializeDocTopic,
  serializeQuickStart,
} from '../../../FooterPages/utils/docsCmsUtils';
import { FooterField, FooterTextArea, FooterTextInput } from './FooterResourceFieldKit';
import { LABEL_CLASS } from './footerResourceConstants';

export default function DocumentationAdminFields({ formData, onChange }) {
  const topicId = String(formData.pricingLabel || '').trim() || 'getting-started';
  const quick = isQuickStartTopic(topicId, formData);

  const topic = useMemo(() => parseDocTopic(formData.content), [formData.content]);
  const qs = useMemo(
    () => (quick ? parseQuickStart(formData.content) : null),
    [formData.content, quick],
  );

  const patch = (partial) => onChange({ ...formData, ...partial });

  const onTopicChange = (e) => {
    const nextId = e.target.value;
    patch({ ...defaultDocFormForTopic(nextId), category: 'Documentation' });
  };

  const writeTopic = (next) => patch({ content: serializeDocTopic(next) });
  const writeQuick = (next) => patch({ content: serializeQuickStart({ ...qs, ...next }) });

  return (
    <>
      <div className="rounded-xl border border-blue-400/40 bg-blue-500/10 px-4 py-3 text-[12px] text-blue-100 space-y-2">
        <p>
          <strong className="text-white">Documentation CMS</strong> — one row per topic, live on{' '}
          <a href="/resources/documentation" target="_blank" rel="noreferrer" className="underline font-bold">
            /resources/documentation
          </a>
          . Quick Start has callout, steps, and checks; other topics use intro + body + code.
        </p>
        <button
          type="button"
          onClick={() => patch({ ...defaultDocFormForTopic(topicId), category: 'Documentation' })}
          className="rounded-lg border border-blue-500/60 bg-blue-600/25 px-3 py-1.5 text-[11px] font-bold text-white"
        >
          Load defaults for this topic
        </button>
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="doc-topic-id">Topic</label>
        <select id="doc-topic-id" className="fr-select" value={topicId} onChange={onTopicChange}>
          {DOC_TOPIC_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-slate-200">
          Topic id saved as <code className="text-cyan-200">{topicId}</code> (must match public nav).
        </p>
      </div>

      <FooterField id="doc-updated" label="Last Updated" hint="Shown under the topic title.">
        <FooterTextInput
          id="doc-updated"
          value={formData.readTime}
          onChange={(e) => patch({ readTime: e.target.value })}
          placeholder="May 24, 2026"
          maxLength={40}
        />
      </FooterField>

      <FooterField id="doc-order" label="Nav order" hint="Lower numbers appear higher in the admin list / sort.">
        <FooterTextInput
          id="doc-order"
          type="number"
          value={String(formData.sidebarOrder ?? 0)}
          onChange={(e) => patch({ sidebarOrder: Number(e.target.value) || 0 })}
          maxLength={4}
        />
      </FooterField>

      <FooterField id="doc-intro" label="Intro" hint="Lead paragraph under the title.">
        <FooterTextArea
          id="doc-intro"
          value={formData.excerpt}
          onChange={(e) => patch({ excerpt: e.target.value })}
          maxLength={2000}
          rows={3}
        />
      </FooterField>

      {quick && qs ? (
        <>
          <FooterField id="doc-callout" label="Info callout" hint="Purple tip box on Quick Start.">
            <FooterTextArea
              id="doc-callout"
              value={qs.callout}
              onChange={(e) => writeQuick({ callout: e.target.value })}
              maxLength={1000}
              rows={2}
            />
          </FooterField>
          <FooterField id="doc-what" label="What is EventThon?" hint="Section body copy.">
            <FooterTextArea
              id="doc-what"
              value={qs.whatBody}
              onChange={(e) => writeQuick({ whatBody: e.target.value })}
              maxLength={2000}
              rows={3}
            />
          </FooterField>
          <FooterField id="doc-features" label="Feature chips" hint="One label per line.">
            <FooterTextArea
              id="doc-features"
              value={(qs.features || []).map((f) => f.label || f).join('\n')}
              onChange={(e) =>
                writeQuick({
                  features: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
                })
              }
              maxLength={1000}
              rows={4}
            />
          </FooterField>
          <FooterField id="doc-steps" label="Account steps" hint="One step per line (#1 Create Account).">
            <FooterTextArea
              id="doc-steps"
              value={(qs.accountSteps || []).join('\n')}
              onChange={(e) => writeQuick({ accountSteps: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean) })}
              maxLength={3000}
              rows={4}
            />
          </FooterField>
          <FooterField id="doc-checks" label="Profile checklist" hint="One item per line.">
            <FooterTextArea
              id="doc-checks"
              value={(qs.profileChecks || []).join('\n')}
              onChange={(e) => writeQuick({ profileChecks: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean) })}
              maxLength={2000}
              rows={4}
            />
          </FooterField>
          <FooterField id="doc-next" label="Next steps text">
            <FooterTextArea
              id="doc-next"
              value={qs.nextBody}
              onChange={(e) => writeQuick({ nextBody: e.target.value })}
              maxLength={1000}
              rows={2}
            />
          </FooterField>
        </>
      ) : (
        <>
          <FooterField id="doc-body" label="Body" hint="Main article paragraph(s).">
            <FooterTextArea
              id="doc-body"
              value={topic.body}
              onChange={(e) => writeTopic({ ...topic, body: e.target.value })}
              maxLength={8000}
              rows={6}
            />
          </FooterField>
          <FooterField id="doc-code" label="Code sample" hint="Optional. Shown in the code box.">
            <FooterTextArea
              id="doc-code"
              value={topic.code}
              onChange={(e) => writeTopic({ ...topic, code: e.target.value })}
              placeholder="curl -X GET ..."
              maxLength={4000}
              rows={5}
            />
          </FooterField>
        </>
      )}
    </>
  );
}
