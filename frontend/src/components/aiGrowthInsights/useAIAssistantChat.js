import { useCallback, useEffect, useRef, useState } from 'react';
import { askAiAssistant } from './aiAssistantApi';
import { ASSISTANT_QUICK_CHIPS, ASSISTANT_WELCOME_MESSAGE } from './aiAssistantKnowledge';

function createMessage(role, text, extra = {}) {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    ...extra,
  };
}

export default function useAIAssistantChat(panelOpen) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const requestIdRef = useRef(0);

  const scrollToBottom = useCallback(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, []);

  const requestAssistantReply = useCallback(
    async (promptText) => {
      const cleaned = String(promptText || '').trim();
      if (!cleaned || isLoading) return;

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setMessages((prev) => [...prev, createMessage('user', cleaned)]);
      setDraft('');
      setIsLoading(true);
      scrollToBottom();

      try {
        const answer = await askAiAssistant(cleaned);
        if (requestIdRef.current !== requestId) return;
        setMessages((prev) => [...prev, createMessage('assistant', answer)]);
      } catch (error) {
        if (requestIdRef.current !== requestId) return;
        const detail = error?.response?.data?.detail || error?.message || 'AI request failed.';
        setMessages((prev) => [
          ...prev,
          createMessage('assistant', `Sorry, I could not reach the AI service right now.\n\n${detail}`, {
            isError: true,
          }),
        ]);
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    },
    [isLoading, scrollToBottom],
  );

  const sendUserPrompt = useCallback(
    (promptText) => {
      requestAssistantReply(promptText);
    },
    [requestAssistantReply],
  );

  const sendChipPrompt = useCallback(
    (chipId) => {
      const chip = ASSISTANT_QUICK_CHIPS.find((row) => row.id === chipId);
      if (!chip || isLoading) return;
      requestAssistantReply(chip.label);
    },
    [isLoading, requestAssistantReply],
  );

  useEffect(() => {
    if (!panelOpen) {
      requestIdRef.current += 1;
      setMessages([]);
      setDraft('');
      setIsLoading(false);
      return;
    }
    setMessages((prev) => (prev.length ? prev : [createMessage('assistant', ASSISTANT_WELCOME_MESSAGE)]));
  }, [panelOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  return {
    messages,
    draft,
    setDraft,
    isLoading,
    scrollRef,
    sendUserPrompt,
    sendChipPrompt,
    quickChips: ASSISTANT_QUICK_CHIPS,
  };
}
