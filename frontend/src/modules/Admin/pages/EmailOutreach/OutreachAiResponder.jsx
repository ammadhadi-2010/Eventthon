import React from 'react';
import { Bot, Save } from 'lucide-react';
import useOutreachAiResponder from './useOutreachAiResponder';

export default function OutreachAiResponder() {
  const ai = useOutreachAiResponder();

  return (
    <section className="eo-ai-responder">
      <header className="eo-ai-responder__head">
        <div className="eo-ai-responder__title-wrap">
          <Bot size={22} aria-hidden />
          <div>
            <h2 className="eo-ai-responder__title">AI Auto-Responder</h2>
            <p className="eo-ai-responder__sub">
              Local Ollama replies automatically when new inbox messages arrive at eventthon@gmail.com.
            </p>
          </div>
        </div>
      </header>

      {ai.loading ? <p className="eo-ai-responder__status">Loading settings…</p> : null}
      {ai.error ? <p className="eo-ai-responder__status eo-ai-responder__status--error">{ai.error}</p> : null}
      {ai.notice ? <p className="eo-ai-responder__status eo-ai-responder__status--ok">{ai.notice}</p> : null}

      <div className="eo-panel eo-ai-responder__card">
        <label className="eo-ai-responder__toggle">
          <input
            type="checkbox"
            checked={ai.autoPilotEnabled}
            onChange={(e) => ai.setAutoPilotEnabled(e.target.checked)}
            disabled={ai.loading || ai.saving}
          />
          <span className="eo-ai-responder__toggle-ui" aria-hidden />
          <span>
            <strong>Enable AI Auto-Pilot</strong>
            <small>Automatically reply to new inbox messages using your local LLM.</small>
          </span>
        </label>

        <label className="eo-field eo-ai-responder__prompt">
          <span className="eo-field__label">System Prompt</span>
          <textarea
            className="eo-field__input eo-ai-responder__textarea"
            rows={10}
            value={ai.systemPrompt}
            onChange={(e) => ai.setSystemPrompt(e.target.value)}
            placeholder="You are the EventThon AI Agent..."
            disabled={ai.loading || ai.saving}
          />
        </label>

        <footer className="eo-ai-responder__actions">
          <button type="button" className="eo-btn eo-btn--purple" onClick={ai.save} disabled={ai.loading || ai.saving}>
            <Save size={15} aria-hidden />
            {ai.saving ? 'Saving…' : 'Save Settings'}
          </button>
        </footer>
      </div>
    </section>
  );
}
