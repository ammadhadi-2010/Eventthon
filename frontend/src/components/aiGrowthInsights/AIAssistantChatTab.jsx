import React from 'react';

export default function AIAssistantChatTab({
  messages,
  draft,
  setDraft,
  isTyping,
  scrollRef,
  quickChips,
  onSendPrompt,
  onChipSelect,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSendPrompt(draft);
  };

  return (
    <div className="et-ai-assistant">
      <div className="et-ai-assistant__chips" aria-label="Onboarding suggestion chips">
        {quickChips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className="et-ai-assistant__chip"
            onClick={() => onChipSelect(chip.id)}
            disabled={isTyping}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="et-ai-assistant__thread" ref={scrollRef} aria-live="polite">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`et-ai-assistant__bubble et-ai-assistant__bubble--${message.role}`}
          >
            <span className="et-ai-assistant__bubble-label">
              {message.role === 'user' ? 'You' : 'AI Assistant'}
            </span>
            <p>{message.text}{message.streaming ? <span className="et-ai-assistant__cursor">▍</span> : null}</p>
          </div>
        ))}
      </div>

      <form className="et-ai-assistant__composer" onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about squads, gigs, jobs, or wallet..."
          disabled={isTyping}
          aria-label="AI assistant message input"
        />
        <button type="submit" disabled={isTyping || !draft.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
