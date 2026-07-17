import React, { useState } from 'react';
import { Bot, Clock, LayoutTemplate, Send } from 'lucide-react';
import ComposerToolbar from './ComposerToolbar';
import ComposerQuickActions from './ComposerQuickActions';
import ComposerAiModal from './ComposerAiModal';
import ComposerCtaModal from './ComposerCtaModal';
import ComposerScheduleModal from './ComposerScheduleModal';
import useEmailComposer from './useEmailComposer';
import { buildCtaButtonHtml, insertHtmlAtCursor, runEditorCommand } from './composerEditorCommands';

export default function EmailComposer({ draft = {}, onSent, onSelectTemplate }) {
  const editorRef = React.useRef(null);
  const seeded = React.useRef('');
  const [aiOpen, setAiOpen] = useState(false);
  const [ctaOpen, setCtaOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const composer = useEmailComposer(draft);

  React.useEffect(() => {
    if (!editorRef.current) return;
    const key = `${draft.templateTs || ''}|${draft.leadId || ''}|${draft.to || ''}|${draft.subject || ''}|${draft.body || ''}`;
    if (seeded.current === key) return;
    editorRef.current.innerHTML = (composer.body || '').replace(/\n/g, '<br />');
    seeded.current = key;
  }, [composer.body, draft.body, draft.leadId, draft.subject, draft.to, draft.templateTs]);

  const syncBody = () => {
    if (editorRef.current) composer.setBody(editorRef.current.innerHTML);
  };

  const runCommand = (cmd, value = null) => {
    runEditorCommand(editorRef.current, cmd, value);
    syncBody();
  };

  const applyContent = ({ subject, body }) => {
    if (subject !== undefined) composer.setSubject(subject);
    if (body !== undefined) {
      composer.setBody(body);
      if (editorRef.current) editorRef.current.innerHTML = body.replace(/\n/g, '<br />');
      seeded.current = `${Date.now()}|applied`;
    }
  };

  const insertCta = ({ text, link }) => {
    const html = buildCtaButtonHtml(text, link);
    insertHtmlAtCursor(editorRef.current, html);
    syncBody();
  };

  const handleSend = async () => {
    syncBody();
    const html = editorRef.current?.innerHTML || composer.body;
    const ok = await composer.sendEmail(html);
    if (ok) onSent?.();
  };

  const handleSchedule = async (sendAtIso) => {
    syncBody();
    const html = editorRef.current?.innerHTML || composer.body;
    const ok = await composer.scheduleEmail(html, sendAtIso);
    if (ok) {
      setScheduleOpen(false);
      onSent?.();
    }
  };

  return (
    <>
      <section className="eo-composer">
        <header className="eo-composer__head">
          <div className="eo-composer__title-row">
            <h2 className="eo-composer__title">Email Composer</h2>
            <button type="button" className="eo-ai-badge eo-ai-badge--btn" onClick={() => setAiOpen(true)}>
              <Bot size={13} aria-hidden />
              AI Assistant
            </button>
          </div>
          <button type="button" className="eo-btn eo-btn--ghost eo-btn--sm" onClick={() => onSelectTemplate?.()}>
            <LayoutTemplate size={14} aria-hidden />
            Use Template
          </button>
        </header>

        <div className="eo-composer__fields">
          <label className="eo-field">
            <span className="eo-field__label">To</span>
            <div className="eo-field__inline">
              <input type="email" className="eo-field__input" placeholder="recipient@company.com" value={composer.to} onChange={(e) => composer.setTo(e.target.value)} />
              <div className="eo-field__toggles">
                <button type="button" className="eo-text-link" onClick={() => composer.setShowCc((v) => !v)}>CC</button>
                <button type="button" className="eo-text-link" onClick={() => composer.setShowBcc((v) => !v)}>BCC</button>
              </div>
            </div>
          </label>
          {composer.showCc ? (
            <label className="eo-field"><span className="eo-field__label">CC</span><input type="email" className="eo-field__input" value={composer.cc} onChange={(e) => composer.setCc(e.target.value)} /></label>
          ) : null}
          {composer.showBcc ? (
            <label className="eo-field"><span className="eo-field__label">BCC</span><input type="email" className="eo-field__input" value={composer.bcc} onChange={(e) => composer.setBcc(e.target.value)} /></label>
          ) : null}
          <label className="eo-field">
            <span className="eo-field__label">Subject</span>
            <input type="text" className="eo-field__input" placeholder="Email subject" value={composer.subject} onChange={(e) => composer.setSubject(e.target.value)} />
          </label>
        </div>

        <div className="eo-composer__editor">
          <ComposerToolbar onCommand={runCommand} />
          <div ref={editorRef} className="eo-editor-body" contentEditable suppressContentEditableWarning onInput={syncBody} />
        </div>

        <ComposerQuickActions onInsertTemplate={onSelectTemplate} onAddButton={() => setCtaOpen(true)} />

        <footer className="eo-composer__footer">
          <button type="button" className="eo-btn eo-btn--primary eo-btn--send" onClick={handleSend} disabled={composer.sending}>
            <Send size={16} aria-hidden />
            {composer.sending ? 'Sending…' : 'Send Email'}
          </button>
          <button type="button" className="eo-btn eo-btn--ghost eo-btn--schedule" onClick={() => setScheduleOpen(true)}>
            <Clock size={16} aria-hidden />
            Schedule
          </button>
        </footer>
      </section>

      <ComposerAiModal open={aiOpen} onClose={() => setAiOpen(false)} to={composer.to} company="" onApply={applyContent} />
      <ComposerCtaModal open={ctaOpen} onClose={() => setCtaOpen(false)} onInsert={insertCta} />
      <ComposerScheduleModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} onSchedule={handleSchedule} saving={composer.scheduling} />
    </>
  );
}
