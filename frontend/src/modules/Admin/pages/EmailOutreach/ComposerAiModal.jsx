import React, { useState } from 'react';
import { Bot, Sparkles, X } from 'lucide-react';
import { generateOutreachAi } from '../../services/emailOutreachApi';

export default function ComposerAiModal({ open, onClose, to, company, onApply }) {
  const [prompt, setPrompt] = useState('Write a friendly partnership email for EventThon.');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateOutreachAi({ prompt, to, company });
      onApply?.({ subject: result.subject, body: result.body });
      onClose?.();
    } catch (err) {
      window.alert(err?.response?.data?.detail || err?.message || 'AI generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="eo-modal eo-ai-modal" role="dialog" aria-modal="true" aria-labelledby="eo-ai-title">
      <button type="button" className="eo-modal__backdrop" aria-label="Close" onClick={onClose} />
      <div className="eo-modal__card eo-ai-modal__card">
        <header className="eo-ai-modal__head">
          <div className="eo-ai-modal__title-wrap">
            <span className="eo-ai-badge">
              <Bot size={14} aria-hidden />
              AI Assistant
            </span>
            <h3 id="eo-ai-title" className="eo-modal__title">Generate outreach copy</h3>
          </div>
          <button type="button" className="eo-icon-btn" aria-label="Close" onClick={onClose}>
            <X size={14} />
          </button>
        </header>
        <p className="eo-ai-modal__hint">Describe the tone and goal. We will draft a subject line and email body for your composer.</p>
        <label className="eo-field">
          <span className="eo-field__label">Your prompt</span>
          <textarea
            className="eo-field__input eo-ai-modal__textarea"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write a friendly partnership email..."
          />
        </label>
        <footer className="eo-modal__actions">
          <button type="button" className="eo-btn eo-btn--primary" onClick={handleGenerate} disabled={loading}>
            <Sparkles size={14} aria-hidden />
            {loading ? 'Generating…' : 'Generate Email'}
          </button>
          <button type="button" className="eo-btn eo-btn--ghost" onClick={onClose}>Cancel</button>
        </footer>
      </div>
    </div>
  );
}
