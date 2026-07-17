import React from 'react';

function renderInlineMarkdown(line) {
  const parts = String(line).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`b-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={`t-${index}`}>{part}</React.Fragment>;
  });
}

export default function AIAssistantMessageContent({ text }) {
  const lines = String(text || '').split('\n');

  return (
    <div className="et-ai-assistant__content">
      {lines.map((line, index) => (
        <p key={`line-${index}`} className="et-ai-assistant__line">
          {renderInlineMarkdown(line) || '\u00A0'}
        </p>
      ))}
    </div>
  );
}
