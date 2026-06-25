import { useCallback, useEffect, useState } from 'react';
import {
  fetchAdminChatMessages,
  fetchAdminChatThreads,
  sendAdminChatMessage,
} from '../../services/adminChatApi';

export default function useAdminChat() {
  const [channel, setChannel] = useState('company_support');
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeThreadKey, setActiveThreadKey] = useState('');
  const [draft, setDraft] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorText, setErrorText] = useState('');

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true);
    setErrorText('');
    try {
      const rows = await fetchAdminChatThreads(channel);
      setThreads(rows);
      setActiveThreadKey((prev) =>
        rows.some((t) => t.thread_key === prev) ? prev : rows[0]?.thread_key || '',
      );
    } catch (err) {
      setThreads([]);
      setActiveThreadKey('');
      setErrorText(err?.response?.data?.detail || 'Failed to load chat threads.');
    } finally {
      setLoadingThreads(false);
    }
  }, [channel]);

  const loadMessages = useCallback(async () => {
    if (!activeThreadKey) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    try {
      const rows = await fetchAdminChatMessages(channel, activeThreadKey);
      setMessages(rows);
    } catch (err) {
      setMessages([]);
      setErrorText(err?.response?.data?.detail || 'Failed to load messages.');
    } finally {
      setLoadingMessages(false);
    }
  }, [channel, activeThreadKey]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const switchChannel = (nextChannel) => {
    setChannel(nextChannel);
    setActiveThreadKey('');
    setMessages([]);
    setDraft('');
  };

  const selectThread = (threadKey) => {
    setActiveThreadKey(threadKey);
    setDraft('');
  };

  const sendMessage = async () => {
    const body = draft.trim();
    if (!body || !activeThreadKey) return;
    setSending(true);
    setErrorText('');
    try {
      await sendAdminChatMessage(channel, activeThreadKey, body);
      setDraft('');
      await loadMessages();
      await loadThreads();
    } catch (err) {
      setErrorText(err?.response?.data?.detail || 'Send failed.');
    } finally {
      setSending(false);
    }
  };

  const activeThread = threads.find((t) => t.thread_key === activeThreadKey) || null;

  return {
    channel,
    switchChannel,
    threads,
    messages,
    activeThread,
    activeThreadKey,
    selectThread,
    draft,
    setDraft,
    sendMessage,
    loadingThreads,
    loadingMessages,
    sending,
    errorText,
  };
}
