import React from 'react';
import AIAssistantMessageContent from './AIAssistantMessageContent';

export default function AIAssistantChatTab({
  messages,
  draft,
  setDraft,
  isLoading,
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
            disabled={isLoading}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="et-ai-assistant__thread" ref={scrollRef} aria-live="polite">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`et-ai-assistant__bubble et-ai-assistant__bubble--${message.role}${
              message.isError ? ' et-ai-assistant__bubble--error' : ''
            }`}
          >
            <span className="et-ai-assistant__bubble-label">
              {message.role === 'user' ? 'You' : 'AI Assistant'}
            </span>
            <AIAssistantMessageContent text={message.text} />
          </div>
        ))}

        {isLoading ? (
          <div className="et-ai-assistant__bubble et-ai-assistant__bubble--assistant et-ai-assistant__bubble--loading">
            <span className="et-ai-assistant__bubble-label">AI Assistant</span>
            <div className="et-ai-assistant__loading" role="status" aria-live="polite">
              <span className="et-ai-assistant__spinner" aria-hidden="true" />
              <span>Generating response...</span>
            </div>
          </div>
        ) : null}
      </div>

      <form className="et-ai-assistant__composer" onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about squads, gigs, jobs, or wallet..."
          disabled={isLoading}
          aria-label="AI assistant message input"
        />
        <button type="submit" disabled={isLoading || !draft.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
