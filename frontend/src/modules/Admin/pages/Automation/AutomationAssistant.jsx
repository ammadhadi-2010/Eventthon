import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';

export default function AutomationAssistant({ busy, onGenerate }) {
  const [prompt, setPrompt] = useState('');

  const handleGenerate = async () => {
    const text = prompt.trim() || 'EventThon platform update for social media';
    const caption = await onGenerate(text);
    if (caption) setPrompt(caption);
  };

  return (
    <section className="auto-assistant-banner">
      <div className="auto-assistant-copy">
        <div className="auto-assistant-avatar">
          <Bot size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h3>Automation Assistant</h3>
          <p>AI helps you optimize your posts for better engagement across all platforms.</p>
          <textarea
            className="auto-assistant-input"
            value={prompt}
            placeholder="Describe your post idea or paste a draft caption…"
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
      </div>
      <button
        type="button"
        className="um-btn um-btn--primary auto-assistant-btn"
        disabled={busy}
        onClick={handleGenerate}
      >
        <Sparkles size={14} /> Generate with AI
      </button>
    </section>
  );
}
