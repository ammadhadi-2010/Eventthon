import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCpu,
  FiFileText,
  FiMessageCircle,
  FiStar,
  FiUser,
} from 'react-icons/fi';
import {
  buildCandidateSummary,
  buildConversationSummary,
  buildInterviewQuestions,
  buildOfferLetter,
  buildSuggestedReplies,
  improveMessageTone,
} from './aiAssist';

const ACTIONS = [
  { id: 'replies', label: 'Suggested Replies', icon: FiMessageCircle },
  { id: 'thread', label: 'Conversation Summary', icon: FiFileText },
  { id: 'candidate', label: 'Candidate Summary', icon: FiUser },
  { id: 'questions', label: 'Interview Questions', icon: FiStar },
  { id: 'offer', label: 'Offer Letter', icon: FiFileText },
  { id: 'tone', label: 'Improve Message Tone', icon: FiCpu },
];

export default function CompanyAiPanel({
  selectedMessage,
  thread = [],
  profile = null,
  draft = '',
  onInsertText,
  open = false,
}) {
  const [active, setActive] = useState('replies');
  const [output, setOutput] = useState('');
  const replies = useMemo(() => buildSuggestedReplies(selectedMessage), [selectedMessage]);

  const run = (id) => {
    setActive(id);
    if (id === 'replies') {
      setOutput(replies.join('\n\n'));
      return;
    }
    if (id === 'thread') {
      setOutput(buildConversationSummary(selectedMessage, thread));
      return;
    }
    if (id === 'candidate') {
      setOutput(buildCandidateSummary(selectedMessage, profile || {}));
      return;
    }
    if (id === 'questions') {
      setOutput(buildInterviewQuestions(selectedMessage, profile || {}));
      return;
    }
    if (id === 'offer') {
      setOutput(buildOfferLetter(selectedMessage, profile || {}));
      return;
    }
    if (id === 'tone') {
      setOutput(improveMessageTone(draft));
    }
  };

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.section
          className="cc-ai cc-ai--header"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="cc-ai__body">
            <div className="cc-ai__actions">
              {ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    className={active === action.id ? 'is-active' : ''}
                    onClick={() => run(action.id)}
                  >
                    <Icon size={12} aria-hidden />
                    {action.label}
                  </button>
                );
              })}
            </div>

            {active === 'replies' ? (
              <div className="cc-ai__replies">
                {replies.map((text) => (
                  <button key={text.slice(0, 24)} type="button" onClick={() => onInsertText?.(text)}>
                    {text}
                  </button>
                ))}
              </div>
            ) : (
              <div className="cc-ai__output">
                <pre>{output || 'Choose an AI action to generate content.'}</pre>
                {output ? (
                  <button type="button" onClick={() => onInsertText?.(output)}>
                    Insert into message
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
