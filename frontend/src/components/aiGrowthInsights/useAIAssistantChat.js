import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ASSISTANT_QUICK_CHIPS,
  ASSISTANT_WELCOME_MESSAGE,
  resolveAssistantReply,
  resolveChipReply,
} from './aiAssistantKnowledge';
import { startStreamReply, stopStreamReply } from './aiAssistantStreamReply';

function createMessage(role, text, streaming = false) {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    streaming,
  };
}

export default function useAIAssistantChat(panelOpen) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const streamTimerRef = useRef(null);
  const scrollRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, []);

  const streamAssistantReply = useCallback(
    (fullText) => {
      setIsTyping(true);
      const assistantMessage = createMessage('assistant', '', true);
      setMessages((prev) => [...prev, assistantMessage]);
      stopStreamReply(streamTimerRef.current);

      streamTimerRef.current = startStreamReply({
        fullText,
        onTick: (nextText, streaming) => {
          setMessages((prev) =>
            prev.map((row) =>
              row.id === assistantMessage.id ? { ...row, text: nextText, streaming } : row,
            ),
          );
          scrollToBottom();
        },
        onComplete: () => {
          streamTimerRef.current = null;
          setIsTyping(false);
        },
      });
    },
    [scrollToBottom],
  );

  const sendUserPrompt = useCallback(
    (promptText) => {
      const cleaned = String(promptText || '').trim();
      if (!cleaned || isTyping) return;
      console.log('AI Assistant prompt received:', cleaned);
      setMessages((prev) => [...prev, createMessage('user', cleaned)]);
      setDraft('');
      scrollToBottom();
      streamAssistantReply(resolveAssistantReply(cleaned));
    },
    [isTyping, scrollToBottom, streamAssistantReply],
  );

  const sendChipPrompt = useCallback(
    (chipId) => {
      const chip = ASSISTANT_QUICK_CHIPS.find((row) => row.id === chipId);
      if (!chip || isTyping) return;
      console.log('AI Assistant chip selected:', chip.label);
      setMessages((prev) => [...prev, createMessage('user', chip.label)]);
      scrollToBottom();
      streamAssistantReply(resolveChipReply(chipId));
    },
    [isTyping, scrollToBottom, streamAssistantReply],
  );

  useEffect(() => {
    if (!panelOpen) {
      setMessages([]);
      setDraft('');
      setIsTyping(false);
      stopStreamReply(streamTimerRef.current);
      streamTimerRef.current = null;
      return;
    }
    setMessages((prev) => (prev.length ? prev : [createMessage('assistant', ASSISTANT_WELCOME_MESSAGE)]));
  }, [panelOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => () => stopStreamReply(streamTimerRef.current), []);

  return {
    messages,
    draft,
    setDraft,
    isTyping,
    scrollRef,
    sendUserPrompt,
    sendChipPrompt,
    quickChips: ASSISTANT_QUICK_CHIPS,
  };
}
