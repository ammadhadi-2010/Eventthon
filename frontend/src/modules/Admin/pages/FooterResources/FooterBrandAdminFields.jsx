import React, { useMemo } from 'react';
import {
  defaultFooterBrandFormFields,
  FOOTER_SOCIAL_OPTIONS,
  parseFooterBrandContent,
  serializeFooterBrandContent,
} from '../../../FooterPages/utils/footerBrandCmsUtils';
import { FooterField, FooterTextArea, FooterTextInput } from './FooterResourceFieldKit';

const BTN =
  'rounded-lg border border-slate-600 bg-slate-800/80 px-2.5 py-1 text-[11px] font-bold text-slate-100 hover:bg-slate-700';
const DEL =
  'rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[11px] font-bold text-rose-200';

function writeContent(formData, parsed, next) {
  return serializeFooterBrandContent({
    about: next.about ?? parsed.about,
    social: next.social ?? parsed.social,
    newsletter: next.newsletter ?? parsed.newsletter,
    stats: next.stats ?? parsed.stats,
    values: next.values ?? parsed.values,
    payments: next.payments ?? parsed.payments,
    copyright: next.copyright ?? parsed.copyright,
  });
}

export default function FooterBrandAdminFields({ formData, onChange }) {
  const parsed = useMemo(() => parseFooterBrandContent(formData.content), [formData.content]);
  const patch = (partial) => onChange({ ...formData, ...partial });
  const write = (next) => patch({ content: writeContent(formData, parsed, next) });

  const updateSocial = (index, partial) => {
    write({
      social: parsed.social.map((row, i) => (i === index ? { ...row, ...partial } : row)),
    });
  };

  return (
    <>
      <div className="rounded-xl border border-violet-400/40 bg-violet-500/10 px-4 py-3 text-[12px] text-violet-100 space-y-2">
        <p>
          <strong className="text-white">Footer Brand</strong> — full site footer: brand column, socials,
          newsletter, stats, values, payments, and copyright. Public footer reads this entry live.
        </p>
        <button
          type="button"
          onClick={() => patch({ ...defaultFooterBrandFormFields(), category: 'Footer Brand' })}
          className="rounded-lg border border-violet-500/60 bg-violet-600/25 px-3 py-1.5 text-[11px] font-bold text-white"
        >
          Load Footer Brand defaults
        </button>
      </div>

      <FooterField id="fb-tag" label="Tagline" hint="Shown under the logo / brand name (Title above).">
        <FooterTextInput
          id="fb-tag"
          value={formData.excerpt}
          onChange={(e) => patch({ excerpt: e.target.value })}
          placeholder="Connect. Collaborate. Create Impact."
          maxLength={200}
        />
      </FooterField>

      <FooterField id="fb-about" label="Description" hint="Short paragraph under the tagline.">
        <FooterTextArea
          id="fb-about"
          value={parsed.about}
          onChange={(e) => write({ about: e.target.value })}
          placeholder="The all-in-one platform…"
          maxLength={2000}
          rows={4}
        />
      </FooterField>

      <FooterField
        id="fb-social"
        label="Social media channels"
        hint="Paste full EventThon profile URLs. Empty URL rows are ignored on the public footer."
      >
        <div className="space-y-3">
          {parsed.social.map((item, index) => (
            <div key={`soc-${index}`} className="rounded-xl border border-slate-700 bg-[#0b1220] p-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  className="fr-select"
                  value={item.id}
                  onChange={(e) => {
                    const opt = FOOTER_SOCIAL_OPTIONS.find((o) => o.id === e.target.value);
                    updateSocial(index, { id: e.target.value, label: opt?.label || item.label });
                  }}
                  aria-label={`Social channel ${index + 1}`}
                >
                  {FOOTER_SOCIAL_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
                <FooterTextInput
                  id={`fb-l-${index}`}
                  value={item.label || ''}
                  onChange={(e) => updateSocial(index, { label: e.target.value })}
                  placeholder="Label"
                  maxLength={40}
                />
              </div>
              <FooterTextInput
                id={`fb-h-${index}`}
                value={item.href || ''}
                onChange={(e) => updateSocial(index, { href: e.target.value })}
                placeholder="https://…"
                maxLength={500}
              />
              <button
                type="button"
                className={DEL}
                onClick={() => write({ social: parsed.social.filter((_, i) => i !== index) })}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className={BTN}
            onClick={() => write({
              social: [...parsed.social, { id: 'instagram', label: 'Instagram', href: '' }],
            })}
          >
            + Add social channel
          </button>
        </div>
      </FooterField>

      <FooterField id="fb-news-title" label="Newsletter title">
        <FooterTextInput
          id="fb-news-title"
          value={parsed.newsletter.title}
          onChange={(e) => write({
            newsletter: { ...parsed.newsletter, title: e.target.value },
          })}
          placeholder="Stay in the Loop"
          maxLength={80}
        />
      </FooterField>
      <FooterField id="fb-news-desc" label="Newsletter description">
        <FooterTextArea
          id="fb-news-desc"
          value={parsed.newsletter.desc}
          onChange={(e) => write({
            newsletter: { ...parsed.newsletter, desc: e.target.value },
          })}
          placeholder="Subscribe to our newsletter…"
          maxLength={400}
          rows={2}
        />
      </FooterField>
      <FooterField id="fb-news-checks" label="Newsletter bullets" hint="One perk per line.">
        <FooterTextArea
          id="fb-news-checks"
          value={(parsed.newsletter.checks || []).join('\n')}
          onChange={(e) => write({
            newsletter: {
              ...parsed.newsletter,
              checks: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
            },
          })}
          placeholder={'Weekly platform updates\nExclusive tips & resources'}
          maxLength={800}
          rows={3}
        />
      </FooterField>

      <FooterField
        id="fb-stats"
        label="Footer stats"
        hint="One per line: id|value|label|tone (violet|blue|pink)"
      >
        <FooterTextArea
          id="fb-stats"
          value={parsed.stats.map((s) => `${s.id}|${s.value}|${s.label}|${s.tone}`).join('\n')}
          onChange={(e) => write({
            stats: e.target.value
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
              .map((l) => {
                const [id, value, label, tone = 'violet'] = l.split('|').map((p) => p.trim());
                return { id, value, label, tone };
              })
              .filter((s) => s.id && s.value && s.label),
          })}
          maxLength={2000}
          rows={5}
        />
      </FooterField>

      <FooterField
        id="fb-values"
        label="Footer values"
        hint="One per line: id|title|text|tone"
      >
        <FooterTextArea
          id="fb-values"
          value={parsed.values.map((v) => `${v.id}|${v.title}|${v.text}|${v.tone}`).join('\n')}
          onChange={(e) => write({
            values: e.target.value
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
              .map((l) => {
                const [id, title, text, tone = 'violet'] = l.split('|').map((p) => p.trim());
                return { id, title, text, tone };
              })
              .filter((v) => v.id && v.title && v.text),
          })}
          maxLength={4000}
          rows={6}
        />
      </FooterField>

      <FooterField id="fb-pay" label="Payment badges" hint="Pipe-separated: Visa|Mastercard|…">
        <FooterTextInput
          id="fb-pay"
          value={(parsed.payments || []).join('|')}
          onChange={(e) => write({
            payments: e.target.value.split('|').map((p) => p.trim()).filter(Boolean),
          })}
          maxLength={300}
        />
      </FooterField>

      <FooterField id="fb-copy" label="Copyright line">
        <FooterTextInput
          id="fb-copy"
          value={parsed.copyright}
          onChange={(e) => write({ copyright: e.target.value })}
          maxLength={200}
        />
      </FooterField>
    </>
  );
}
