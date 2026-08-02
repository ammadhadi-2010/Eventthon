import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchAdminChatMessages,
  fetchAdminChatThreads,
  likeAdminChatMessage,
  sendAdminChatMessage,
  uploadAdminChatAttachment,
} from '../../services/adminChatApi';

const POLL_MS = 8000;

function sessionLikeIds() {
  return new Set(
    [
      localStorage.getItem('userEmail'),
      localStorage.getItem('userMobile'),
      localStorage.getItem('userId'),
      localStorage.getItem('user_id'),
    ]
      .map((v) => String(v || '').trim().toLowerCase())
      .filter(Boolean),
  );
}

function withViewerLikes(rows = []) {
  const myIds = sessionLikeIds();
  return (rows || []).map((msg) => {
    const likedBy = Array.isArray(msg.liked_by)
      ? msg.liked_by.map((v) => String(v || '').trim().toLowerCase()).filter(Boolean)
      : [];
    return {
      ...msg,
      liked_by: likedBy,
      likes: Math.max(Number(msg.likes) || 0, likedBy.length),
      liked: likedBy.some((id) => myIds.has(id)) || Boolean(msg.liked),
    };
  });
}

export default function useAdminChat() {
  const [channel, setChannel] = useState('company_support');
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeThreadKey, setActiveThreadKey] = useState('');
  const [threadMeta, setThreadMeta] = useState(null);
  const [draft, setDraft] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [query, setQuery] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const pollRef = useRef(null);

  const loadThreads = useCallback(async (silent = false) => {
    if (!silent) setLoadingThreads(true);
    setErrorText('');
    try {
      const data = await fetchAdminChatThreads(channel);
      const rows = data.threads || [];
      setThreads(rows);
      if (data.quickReplies?.length) setQuickReplies(data.quickReplies);
      setActiveThreadKey((prev) => {
        if (!prev) return rows[0]?.thread_key || '';
        const prevLow = String(prev).toLowerCase();
        const hit = rows.find((t) => {
          if (t.thread_key === prev) return true;
          if (String(t.canonical_key || '').toLowerCase() === prevLow) return true;
          return (t.identity_keys || []).some((k) => String(k).toLowerCase() === prevLow);
        });
        return hit?.thread_key || rows[0]?.thread_key || '';
      });
    } catch (err) {
      if (!silent) {
        setThreads([]);
        setActiveThreadKey('');
        setErrorText(err?.response?.data?.detail || 'Failed to load chat threads.');
      }
    } finally {
      if (!silent) setLoadingThreads(false);
    }
  }, [channel]);

  const loadMessages = useCallback(async (silent = false) => {
    if (!activeThreadKey) {
      setMessages([]);
      setThreadMeta(null);
      return;
    }
    if (!silent) setLoadingMessages(true);
    try {
      const data = await fetchAdminChatMessages(channel, activeThreadKey);
      setMessages(withViewerLikes(data.messages || []));
      if (data.thread) setThreadMeta(data.thread);
      if (data.quickReplies?.length) setQuickReplies(data.quickReplies);
    } catch (err) {
      if (!silent) {
        setMessages([]);
        setErrorText(err?.response?.data?.detail || 'Failed to load messages.');
      }
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, [channel, activeThreadKey]);

  useEffect(() => {
    loadThreads(false);
  }, [loadThreads]);

  useEffect(() => {
    loadMessages(false);
  }, [loadMessages]);

  useEffect(() => {
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(() => {
      loadThreads(true);
      loadMessages(true);
    }, POLL_MS);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [loadThreads, loadMessages]);

  const switchChannel = (nextChannel) => {
    setChannel(nextChannel);
    setActiveThreadKey('');
    setMessages([]);
    setThreadMeta(null);
    setDraft('');
    setPendingAttachments([]);
    setQuery('');
  };

  const selectThread = (threadKey) => {
    setActiveThreadKey(threadKey);
    setDraft('');
    setPendingAttachments([]);
  };

  const removePendingAttachment = (idx) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const pickFiles = async (fileList, kind = 'file') => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setUploading(true);
    setErrorText('');
    try {
      const uploaded = [];
      for (const file of files) {
        const att = await uploadAdminChatAttachment(file, kind);
        if (att) uploaded.push(att);
      }
      if (uploaded.length) {
        setPendingAttachments((prev) => [...prev, ...uploaded]);
      }
    } catch (err) {
      setErrorText(err?.response?.data?.detail || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (overrideBody) => {
    const body = String(overrideBody ?? draft).trim();
    const attachments = [...pendingAttachments];
    if ((!body && !attachments.length) || !activeThreadKey) return;
    setSending(true);
    setErrorText('');
    const tempId = `local-${Date.now()}`;
    const peerImage = activeThread?.imageurl || '';
    const optimistic = {
      id: tempId,
      body: body || (attachments.length ? 'Attachment' : ''),
      direction: 'outgoing',
      from_user_name: 'EventThon Admin',
      from_user_imageurl: '/assets/eventthon-logo.png',
      to_user_imageurl: peerImage,
      peer_imageurl: peerImage,
      attachments,
      created_at: new Date().toISOString(),
      delivery_status: 'sending',
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft('');
    setPendingAttachments([]);
    try {
      const res = await sendAdminChatMessage(channel, activeThreadKey, body, attachments);
      const saved = res?.message
        ? { ...res.message, delivery_status: res.message.delivery_status || 'sent' }
        : { ...optimistic, id: tempId, delivery_status: 'sent' };
      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
      await loadMessages(true);
      await loadThreads(true);
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, delivery_status: 'failed' } : m)),
      );
      setErrorText(err?.response?.data?.detail || 'Send failed.');
    } finally {
      setSending(false);
    }
  };

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads.filter((t) => {
      if (onlineOnly && !(t.is_online || t.online_status === 'online')) return false;
      if (unreadOnly && !(Number(t.unread_count) > 0)) return false;
      if (!q) return true;
      const hay = `${t.entity_name || ''} ${t.profile_name || ''} ${t.company_name || ''} ${t.email || ''} ${t.preview || ''} ${t.thread_key || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [threads, query, onlineOnly, unreadOnly]);

  const activeThread = useMemo(() => {
    const keyLow = String(activeThreadKey || '').toLowerCase();
    const fromList =
      threads.find((t) => {
        if (t.thread_key === activeThreadKey) return true;
        if (String(t.canonical_key || '').toLowerCase() === keyLow) return true;
        return (t.identity_keys || []).some((k) => String(k).toLowerCase() === keyLow);
      }) || null;
    if (!fromList && !threadMeta) return null;
    return { ...(fromList || {}), ...(threadMeta || {}) };
  }, [threads, activeThreadKey, threadMeta]);

  const copyEmail = async () => {
    const email = String(activeThread?.email || activeThread?.thread_key || '').trim();
    if (!email) return false;
    try {
      await navigator.clipboard.writeText(email);
      return true;
    } catch {
      return false;
    }
  };

  const toggleLike = async (messageId) => {
    const id = String(messageId || '').trim();
    if (!/^[a-f\d]{24}$/i.test(id)) return;
    const target = messages.find((m) => String(m.id) === id);
    if (!target) return;
    const nextLiked = !target.liked;
    const prev = { liked: target.liked, likes: target.likes || 0, liked_by: target.liked_by || [] };
    setMessages((rows) => rows.map((m) => (
      String(m.id) === id
        ? { ...m, liked: nextLiked, likes: Math.max(0, (m.likes || 0) + (nextLiked ? 1 : -1)) }
        : m
    )));
    try {
      const data = await likeAdminChatMessage(channel, id, nextLiked);
      const likedBy = Array.isArray(data.liked_by)
        ? data.liked_by.map((v) => String(v || '').trim().toLowerCase()).filter(Boolean)
        : [];
      setMessages((rows) => rows.map((m) => (
        String(m.id) === id
          ? {
            ...m,
            liked: Boolean(data.liked),
            likes: Number(data.likes) || likedBy.length,
            liked_by: likedBy,
          }
          : m
      )));
    } catch (err) {
      setMessages((rows) => rows.map((m) => (String(m.id) === id ? { ...m, ...prev } : m)));
      setErrorText(err?.response?.data?.detail || 'Like sync failed.');
    }
  };

  return {
    channel,
    switchChannel,
    threads: filteredThreads,
    allThreadCount: threads.length,
    messages,
    activeThread,
    activeThreadKey,
    selectThread,
    draft,
    setDraft,
    pendingAttachments,
    pickFiles,
    removePendingAttachment,
    uploading,
    toggleLike,
    query,
    setQuery,
    onlineOnly,
    setOnlineOnly,
    unreadOnly,
    setUnreadOnly,
    quickReplies,
    sendMessage,
    copyEmail,
    refresh: async () => {
      await loadThreads(false);
      await loadMessages(false);
    },
    loadingThreads,
    loadingMessages,
    sending,
    errorText,
  };
}
