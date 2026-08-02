import React, { useMemo } from 'react';
import { TERMS_COMMITMENT } from '../../../FooterPages/data/termsData';
import {
  DEFAULT_TERMS_LINKS,
  defaultTermsFormFields,
  emptyTermsSection,
  normalizeTermsCard,
  parseTermsSections,
  resolveTermsKind,
  serializeTermsSections,
} from '../../../FooterPages/utils/termsCmsUtils';
import { FooterField, FooterTextArea, FooterTextInput } from './FooterResourceFieldKit';

function layoutHint(index) {
  if (index === 16) return 'Public #17 · full-width bottom row (Governing Law)';
  if (index === 17) return 'Public #18 · full-width Contact card (mailto + 3 links)';
  if (index < 16) return `Public #${index + 1} · 3-column grid card`;
  return `Public #${index + 1}`;
}

function SectionEditor({ section, index, total, onPatch, onRemove }) {
  const kind = resolveTermsKind(section, index);
  const contact = kind === 'contact' ? normalizeTermsCard(section, index) : null;
  const links = contact?.links?.length ? contact.links : DEFAULT_TERMS_LINKS;

  return (
    <div id={`tos-admin-sec-${index}`} className="rounded-lg border border-slate-700/80 bg-[#111622] p-3 space-y-2 scroll-mt-24">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold text-sky-200">#{index + 1}</span>
          <p className="text-[10px] text-slate-300 mt-0.5">{layoutHint(index)}</p>
        </div>
        <button type="button" onClick={onRemove} disabled={total <= 1} className="text-[11px] font-semibold text-rose-300">
          Remove
        </button>
      </div>

      <FooterField id={`tos-label-${index}`} label="Section title">
        <FooterTextInput
          id={`tos-label-${index}`}
          value={section.label}
          onChange={(e) => onPatch({ label: e.target.value, kind })}
          placeholder={kind === 'contact' ? 'Contact Us' : 'Acceptance of Terms'}
          maxLength={120}
        />
      </FooterField>

      {kind === 'paragraph' ? (
        <FooterField id={`tos-body-${index}`} label="Body text" hint="Paragraph on the public card (bright text).">
          <FooterTextArea
            id={`tos-body-${index}`}
            value={section.body || ''}
            onChange={(e) => onPatch({ body: e.target.value, kind: 'paragraph' })}
            placeholder="By accessing or using EventThon..."
            maxLength={2000}
            rows={3}
          />
        </FooterField>
      ) : (
        <>
          <FooterField id={`tos-lead-${index}`} label="Contact lead" hint="Line above the email bar.">
            <FooterTextInput
              id={`tos-lead-${index}`}
              value={contact.lead}
              onChange={(e) => onPatch({ ...contact, lead: e.target.value, kind: 'contact' })}
              placeholder="For legal questions about these Terms:"
              maxLength={160}
            />
          </FooterField>
          <FooterField id={`tos-email-${index}`} label="Legal email" hint="Clickable mailto on /company/terms.">
            <FooterTextInput
              id={`tos-email-${index}`}
              value={contact.email}
              onChange={(e) => onPatch({ ...contact, email: e.target.value, kind: 'contact' })}
              placeholder="legal@eventthon.com"
              maxLength={200}
            />
          </FooterField>
          {links.map((link, li) => (
            <div key={`tl-${li}`} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FooterField id={`tos-ll-${index}-${li}`} label={`Link ${li + 1} label`}>
                <FooterTextInput
                  id={`tos-ll-${index}-${li}`}
                  value={link.label}
                  onChange={(e) => {
                    const next = links.map((row, i) => (i === li ? { ...row, label: e.target.value } : row));
                    onPatch({ ...contact, links: next, kind: 'contact' });
                  }}
                  placeholder="Support Center"
                  maxLength={80}
                />
              </FooterField>
              <FooterField id={`tos-lh-${index}-${li}`} label={`Link ${li + 1} URL`}>
                <FooterTextInput
                  id={`tos-lh-${index}-${li}`}
                  value={link.href}
                  onChange={(e) => {
                    const next = links.map((row, i) => (i === li ? { ...row, href: e.target.value } : row));
                    onPatch({ ...contact, links: next, kind: 'contact' });
                  }}
                  placeholder="/company/contact"
                  maxLength={300}
                />
              </FooterField>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default function TermsOfServiceAdminFields({ formData, onChange }) {
  const sections = useMemo(() => {
    const parsed = parseTermsSections(formData.content);
    return parsed.length ? parsed : [emptyTermsSection()];
  }, [formData.content]);

  const setField = (key) => (e) => onChange({ ...formData, [key]: e.target.value });
  const writeSections = (next) => onChange({ ...formData, content: serializeTermsSections(next) });

  return (
    <>
      <div className="rounded-xl border border-sky-400/40 bg-sky-500/10 px-4 py-3 text-[12px] text-sky-100 space-y-2">
        <p>
          <strong className="text-white">Terms of Service CMS</strong> — matches public{' '}
          <a href="/company/terms" target="_blank" rel="noreferrer" className="underline font-bold">/company/terms</a>
          : intro, 16 grid cards, full-width #17–18, commitment banner.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...formData, ...defaultTermsFormFields() })}
            className="rounded-lg border border-sky-500/60 bg-sky-600/25 px-3 py-1.5 text-[11px] font-bold text-white"
          >
            Load default 18 sections
          </button>
          <a href="#tos-admin-sec-16" className="rounded-lg border border-slate-600 px-3 py-1.5 text-[11px] font-bold text-slate-100">
            Jump to #17
          </a>
          <a href="#tos-admin-sec-17" className="rounded-lg border border-slate-600 px-3 py-1.5 text-[11px] font-bold text-slate-100">
            Jump to #18 Contact
          </a>
        </div>
      </div>

      <FooterField id="footer-tos-version" label="Last Updated" hint="Under the Terms title on the public page.">
        <FooterTextInput id="footer-tos-version" value={formData.policyVersion} onChange={setField('policyVersion')} placeholder="May 24, 2026" maxLength={40} />
      </FooterField>

      <FooterField id="footer-tos-intro" label="Intro" hint="Welcome paragraph under Last Updated.">
        <FooterTextArea id="footer-tos-intro" value={formData.excerpt} onChange={setField('excerpt')} maxLength={2000} rows={3} />
      </FooterField>

      <FooterField
        id="footer-tos-commitment"
        label="Our Commitment banner"
        hint="Purple banner at the bottom of /company/terms."
      >
        <FooterTextArea
          id="footer-tos-commitment"
          value={formData.contactHours || TERMS_COMMITMENT}
          onChange={setField('contactHours')}
          placeholder={TERMS_COMMITMENT}
          maxLength={1000}
          rows={3}
        />
      </FooterField>

      <div className="w-full rounded-xl border border-slate-800 bg-[#0a1020] p-3 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-white">Terms Sections ({sections.length})</p>
            <p className="text-[11px] text-slate-200 mt-0.5">#1–16 grid · #17 Governing · #18 Contact email/links</p>
          </div>
          <button
            type="button"
            onClick={() => writeSections([...sections, emptyTermsSection()])}
            className="rounded-lg border border-sky-500/60 bg-sky-600/20 px-3 py-1.5 text-[11px] font-bold text-sky-100"
          >
            + Add section
          </button>
        </div>
        {sections.map((section, index) => (
          <SectionEditor
            key={section.id || `tos-${index}`}
            section={section}
            index={index}
            total={sections.length}
            onPatch={(patch) => writeSections(sections.map((s, i) => (i === index ? { ...s, ...patch } : s)))}
            onRemove={() => writeSections(sections.filter((_, i) => i !== index))}
          />
        ))}
      </div>
    </>
  );
}
