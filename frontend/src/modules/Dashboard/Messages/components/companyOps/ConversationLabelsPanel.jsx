import React from 'react';
import { CONVERSATION_LABELS } from './conversationOps';

export default function ConversationLabelsPanel({
  labels = [],
  busy = false,
  onToggle,
}) {
  const active = new Set((labels || []).map((x) => String(x).toLowerCase()));
  return (
    <section className="chs-card cops-labels">
      <h5>Labels</h5>
      <div className="cops-labels__grid">
        {CONVERSATION_LABELS.map((item) => {
          const on = active.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              disabled={busy}
              className={`cops-label cops-label--${item.id}${on ? ' is-on' : ''}`}
              onClick={() => onToggle?.(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
