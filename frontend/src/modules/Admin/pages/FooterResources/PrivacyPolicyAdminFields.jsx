import React, { useMemo } from 'react';
import {
  DEFAULT_PRIVACY_LINKS,
  defaultPrivacyFormFields,
  emptyPrivacySection,
  normalizePrivacyCard,
  parsePrivacySections,
  serializePrivacySections,
} from '../../../FooterPages/utils/privacyCmsUtils';
import {
  FooterField,
  FooterTextArea,
  FooterTextInput,
} from './FooterResourceFieldKit';

function SectionEditor({ section, index, total, onPatch, onRemove }) {
  const kind = section.kind || 'bullets';
  const contact = kind === 'contact' ? normalizePrivacyCard(section, index) : null;
  const links = contact?.links?.length ? contact.links : DEFAULT_PRIVACY_LINKS;

  return (
    <div className="rounded-lg border border-slate-700/80 bg-[#111622] p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-violet-200">#{index + 1}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-[11px] font-semibold text-rose-300 hover:text-rose-200"
          disabled={total <= 1}
        >
          Remove
        </button>
      </div>

      <FooterField id={`privacy-sec-label-${index}`} label="Section title">
        <FooterTextInput
          id={`privacy-sec-label-${index}`}
          value={section.label}
          onChange={(e) => onPatch({ label: e.target.value })}
          placeholder="Information We Collect"
          maxLength={120}
        />
      </FooterField>

      {kind === 'paragraph' ? (
        <FooterField
          id={`privacy-sec-body-${index}`}
          label="Update notice"
          hint="Shown as a paragraph on card #17 (Updates)."
        >
          <FooterTextArea
            id={`privacy-sec-body-${index}`}
            value={section.body || ''}
            onChange={(e) => onPatch({ body: e.target.value, kind: 'paragraph' })}
            placeholder="We may update this Privacy Policy..."
            maxLength={2000}
            rows={3}
          />
        </FooterField>
      ) : null}

      {kind === 'contact' ? (
        <>
          <FooterField id={`privacy-lead-${index}`} label="Contact lead" hint="Line above the email bar.">
            <FooterTextInput
              id={`privacy-lead-${index}`}
              value={contact.lead}
              onChange={(e) => onPatch({ ...contact, lead: e.target.value, kind: 'contact' })}
              placeholder="For privacy-related questions:"
              maxLength={160}
            />
          </FooterField>
          <FooterField id={`privacy-email-${index}`} label="Privacy email" hint="Purple email bar on card #18.">
            <FooterTextInput
              id={`privacy-email-${index}`}
              value={contact.email}
              onChange={(e) => onPatch({ ...contact, email: e.target.value, kind: 'contact' })}
              placeholder="privacy@eventthon.com"
              maxLength={200}
            />
          </FooterField>
          {links.map((link, li) => (
            <div key={`link-${li}`} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FooterField id={`privacy-link-label-${index}-${li}`} label={`Link ${li + 1} label`}>
                <FooterTextInput
                  id={`privacy-link-label-${index}-${li}`}
                  value={link.label}
                  onChange={(e) => {
                    const next = links.map((row, i) => (i === li ? { ...row, label: e.target.value } : row));
                    onPatch({ ...contact, links: next, kind: 'contact' });
                  }}
                  placeholder="Support Center"
                  maxLength={80}
                />
              </FooterField>
              <FooterField id={`privacy-link-href-${index}-${li}`} label={`Link ${li + 1} URL`}>
                <FooterTextInput
                  id={`privacy-link-href-${index}-${li}`}
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
      ) : null}

      {kind === 'bullets' ? (
        <FooterField id={`privacy-sec-bullets-${index}`} label="Bullets" hint="One item per line.">
          <FooterTextArea
            id={`privacy-sec-bullets-${index}`}
            value={(section.bullets || []).join('\n')}
            onChange={(e) => {
              const bullets = String(e.target.value || '')
                .split('\n')
                .map((line) => line.replace(/^[-*•]\s*/, '').trim())
                .filter((line, i, arr) => line || i === arr.length - 1);
              onPatch({ bullets: bullets.length ? bullets : [''], kind: 'bullets' });
            }}
            placeholder={'Name & username\nEmail address'}
            maxLength={2000}
            rows={4}
          />
        </FooterField>
      ) : null}
    </div>
  );
}

export default function PrivacyPolicyAdminFields({ formData, onChange }) {
  const sections = useMemo(() => {
    const parsed = parsePrivacySections(formData.content);
    return parsed.length ? parsed : [emptyPrivacySection()];
  }, [formData.content]);

  const setField = (key) => (e) => onChange({ ...formData, [key]: e.target.value });

  const writeSections = (next) => {
    onChange({ ...formData, content: serializePrivacySections(next) });
  };

  return (
    <>
      <div className="rounded-xl border border-violet-400/40 bg-violet-500/10 px-4 py-3 text-[12px] text-violet-100 space-y-2">
        <p>
          <strong className="text-white">Privacy Policy CMS</strong> — live on{' '}
          <a href="/company/privacy" target="_blank" rel="noreferrer" className="underline font-bold">
            /company/privacy
          </a>
          . Sections 17–18 use paragraph + email/links layout.
        </p>
        <button
          type="button"
          onClick={() => onChange({ ...formData, ...defaultPrivacyFormFields() })}
          className="rounded-lg border border-violet-500/60 bg-violet-600/25 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-violet-600/40"
        >
          Load default 18 sections
        </button>
      </div>

      <FooterField id="footer-privacy-version" label="Last Updated" hint="Under the page title.">
        <FooterTextInput
          id="footer-privacy-version"
          value={formData.policyVersion}
          onChange={setField('policyVersion')}
          placeholder="May 24, 2026"
          maxLength={40}
        />
      </FooterField>

      <FooterField id="footer-privacy-intro" label="Intro" hint="Welcome paragraph.">
        <FooterTextArea
          id="footer-privacy-intro"
          value={formData.excerpt}
          onChange={setField('excerpt')}
          placeholder="Welcome to EventThon Network..."
          maxLength={2000}
          rows={3}
        />
      </FooterField>

      <div className="w-full rounded-xl border border-slate-800 bg-[#0a1020] p-3 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-white">Policy Sections</p>
            <p className="text-[11px] text-slate-200 mt-0.5">
              #17 = Updates paragraph · #18 = email bar + 3 links.
            </p>
          </div>
          <button
            type="button"
            onClick={() => writeSections([...sections, emptyPrivacySection()])}
            className="rounded-lg border border-violet-500/60 bg-violet-600/20 px-3 py-1.5 text-[11px] font-bold text-violet-100 hover:bg-violet-600/35 self-start"
          >
            + Add section
          </button>
        </div>

        {sections.map((section, index) => (
          <SectionEditor
            key={section.id || `sec-${index}`}
            section={section}
            index={index}
            total={sections.length}
            onPatch={(patch) =>
              writeSections(sections.map((s, i) => (i === index ? { ...s, ...patch } : s)))
            }
            onRemove={() => writeSections(sections.filter((_, i) => i !== index))}
          />
        ))}
      </div>
    </>
  );
}
