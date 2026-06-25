import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL } from '../../../../../api/axiosConfig';
import { navigateFromChatGigContext } from '../../../Gigs/utils/navigateGigSurfaces';
import { buildThreadFromMessage } from '../../utils/messagesFormat';

const useChatWindowState = ({
  selectedMessage,
  allMessages,
  currentUserId,
  onSendMessage,
  onUpdateDeliveryStatus,
  onUploadAttachment,
  onMessageAction,
  onDeleteMessage,
  onConversationPreference,
  onFetchConversationPreference,
  sending,
  navigate,
}) => {
  const [draft, setDraft] = useState('');
  const [thread, setThread] = useState([]);
  const [chatNotice, setChatNotice] = useState('');
  const [menuState, setMenuState] = useState({ open: false, x: 0, y: 0, messageId: '' });
  const [emojiPickerFor, setEmojiPickerFor] = useState('');
  const [emojiAnchor, setEmojiAnchor] = useState({ x: 0, y: 0 });
  const [replyTo, setReplyTo] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [composerEmojiOpen, setComposerEmojiOpen] = useState(false);
  const [composerEmojiAnchor, setComposerEmojiAnchor] = useState({ x: 0, y: 0 });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSecs, setRecordingSecs] = useState(0);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [callModalType, setCallModalType] = useState('');
  const [awayEnabled, setAwayEnabled] = useState(false);
  const [chatMuted, setChatMuted] = useState(false);

  const menuRef = useRef(null);
  const pickerRef = useRef(null);
  const composerPickerRef = useRef(null);
  const composerToolsRef = useRef(null);
  const headerMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const seedThread = useMemo(() => buildThreadFromMessage(selectedMessage), [selectedMessage]);
  const syncedThread = useMemo(() => {
    if (!selectedMessage || !Array.isArray(allMessages) || allMessages.length === 0) return [];
    const sellerId = String(selectedMessage.seller_user_id || '').trim();
    const ctxId = String(selectedMessage.context_id || '').trim();
    const ctxTitle = String(selectedMessage.context_title || '').trim();
    const chatType = String(selectedMessage.chat_type || '').trim().toLowerCase();
    const userId = String(currentUserId || '').trim();

    const rows = allMessages
      .filter((row) => {
        if (row?.deleted) return false;
        if (String(row?.seller_user_id || '').trim() !== sellerId) return false;
        if (String(row?.chat_type || '').trim().toLowerCase() !== chatType) return false;
        const rowCtx = String(row?.context_id || '').trim();
        const rowTitle = String(row?.context_title || '').trim();
        if (ctxId) return rowCtx === ctxId;
        return rowTitle === ctxTitle;
      })
      .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());

    return rows.map((row) => ({
      id: String(row._id || `row-${Math.random()}`),
      sender: String(row.from_user_id || '').trim() === userId ? 'buyer' : 'seller',
      text: row.body || 'Attachment',
      time: row.created_at,
      delivery: row.delivery_status || 'sent',
      reaction: row.reaction || '',
      starred: Boolean(row.starred),
      liked: false,
      likes: 0,
      attachments: (Array.isArray(row.attachments) ? row.attachments : []).map((att) => ({
        ...att,
        url: att?.imageurl || att?.url || '',
        imageurl: att?.imageurl || att?.url || '',
      })),
    }));
  }, [selectedMessage, allMessages, currentUserId]);

  const isDraftConversation = Boolean(selectedMessage?._isDraft);
  const orderInfo = useMemo(() => {
    const rawContext = String(selectedMessage?.context_id || '').trim();
    const rawOrder = String(selectedMessage?.order_id || '').trim();
    const chatType = String(selectedMessage?.chat_type || '').toLowerCase();
    const title = String(selectedMessage?.context_title || '').trim() || 'Conversation';
    const derived = rawOrder || rawContext;
    const hasOrder = !isDraftConversation && (chatType === 'gig' || Boolean(derived));
    return {
      hasOrder,
      orderId: hasOrder ? (derived || '#ORD-12548') : '',
      title,
    };
  }, [selectedMessage?.chat_type, selectedMessage?.context_id, selectedMessage?.context_title, selectedMessage?.order_id, isDraftConversation]);

  const normalizeThreadRows = useCallback(
    (rows) =>
      rows.map((msg, idx) => ({
        ...msg,
        delivery:
          msg.delivery || (msg.sender === 'buyer' ? (selectedMessage?.delivery_status || 'sent') : 'delivered'),
        liked: Boolean(msg.liked),
        likes: msg.likes || (idx === 2 ? 1 : 0),
        starred: Boolean(msg.starred),
        reaction: msg.reaction || '',
        attachments: Array.isArray(msg.attachments) ? msg.attachments : [],
      })),
    [selectedMessage?.delivery_status],
  );

  useEffect(() => {
    setDraft('');
    const base = syncedThread.length > 0 ? syncedThread : seedThread;
    setThread(normalizeThreadRows(base));
    setReplyTo(null);
    setOrderModalOpen(false);
    setPendingAttachments([]);
    setHeaderMenuOpen(false);
    setCallModalType('');
    setAwayEnabled(false);
    setChatMuted(false);
  }, [selectedMessage?._id, seedThread, syncedThread, normalizeThreadRows]);

  useEffect(() => {
    if (!selectedMessage?.seller_user_id) return;
    let isAlive = true;
    Promise.resolve(onFetchConversationPreference?.(selectedMessage.seller_user_id))
      .then((pref) => {
        if (!isAlive || !pref) return;
        setAwayEnabled(Boolean(pref.away_enabled));
        setChatMuted(Boolean(pref.muted));
      })
      .catch(() => {
        // keep defaults if fetch fails
      });
    return () => {
      isAlive = false;
    };
  }, [selectedMessage?.seller_user_id, onFetchConversationPreference]);

  useEffect(() => {
    if (!selectedMessage?._id || syncedThread.length === 0) return;
    const hasLocalOrPersisted = thread.some((msg) => {
      const id = String(msg.id || '');
      return id.startsWith('local-') || (!id.includes('-seed-') && !id.includes('-seed-live'));
    });
    if (hasLocalOrPersisted) return;
    setThread(normalizeThreadRows(syncedThread));
  }, [selectedMessage?._id, syncedThread, thread, normalizeThreadRows]);

  useEffect(() => {
    if (!chatNotice) return undefined;
    const timer = window.setTimeout(() => setChatNotice(''), 2200);
    return () => window.clearTimeout(timer);
  }, [chatNotice]);

  useEffect(() => () => {
    if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
  }, []);

  useEffect(() => {
    if (!menuState.open && !emojiPickerFor && !composerEmojiOpen && !headerMenuOpen) return undefined;
    const closeMenus = (event) => {
      if (menuRef.current && menuRef.current.contains(event.target)) return;
      if (pickerRef.current && pickerRef.current.contains(event.target)) return;
      if (composerPickerRef.current && composerPickerRef.current.contains(event.target)) return;
      if (composerToolsRef.current && composerToolsRef.current.contains(event.target)) return;
      if (headerMenuRef.current && headerMenuRef.current.contains(event.target)) return;
      setMenuState((prev) => ({ ...prev, open: false }));
      setEmojiPickerFor('');
      setComposerEmojiOpen(false);
      setHeaderMenuOpen(false);
    };
    window.addEventListener('mousedown', closeMenus);
    return () => window.removeEventListener('mousedown', closeMenus);
  }, [menuState.open, emojiPickerFor, composerEmojiOpen, headerMenuOpen]);

  const showNotice = (text) => setChatNotice(text);

  const tryOpenGigSurfaceFromChat = () => {
    if (typeof navigate !== 'function') return false;
    return navigateFromChatGigContext(navigate, selectedMessage);
  };

  const openRelatedGigSurfaceFromModal = () => {
    if (tryOpenGigSurfaceFromChat()) {
      setOrderModalOpen(false);
      return;
    }
    showNotice('No linked order yet — open the gig from Gigs Explorer instead.');
  };

  const callRoom = useMemo(() => {
    const seller = String(selectedMessage?.seller_user_id || selectedMessage?.from_user_id || 'seller').replace(/\W+/g, '-');
    const context = String(selectedMessage?.context_id || selectedMessage?._id || Date.now()).replace(/\W+/g, '-');
    return `eventthon-${seller}-${context}`.toLowerCase();
  }, [selectedMessage?._id, selectedMessage?.seller_user_id, selectedMessage?.from_user_id, selectedMessage?.context_id]);

  const startBrowserCall = (type = 'audio') => {
    const audioOnly = type === 'audio';
    const url = `https://meet.jit.si/${callRoom}${audioOnly ? '#config.startWithVideoMuted=true' : ''}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setCallModalType('');
    showNotice(`${audioOnly ? 'Voice' : 'Video'} call link opened.`);
  };

  const copyCallLink = async (type = 'audio') => {
    const audioOnly = type === 'audio';
    const url = `https://meet.jit.si/${callRoom}${audioOnly ? '#config.startWithVideoMuted=true' : ''}`;
    try {
      await navigator.clipboard.writeText(url);
      showNotice(`${audioOnly ? 'Voice' : 'Video'} call link copied.`);
    } catch {
      showNotice('Copy link failed.');
    }
  };

  const handleHeaderMenuAction = async (key) => {
    if (key === 'manage_conversations') {
      try {
        const pref = await onFetchConversationPreference?.(selectedMessage?.seller_user_id);
        if (pref) {
          const nextAway = Boolean(pref.away_enabled);
          const nextMuted = Boolean(pref.muted);
          setAwayEnabled(nextAway);
          setChatMuted(nextMuted);
          showNotice(`Conversation preferences loaded (away: ${nextAway ? 'on' : 'off'}, mute: ${nextMuted ? 'on' : 'off'}).`);
        } else {
          showNotice('Conversation preferences loaded.');
        }
      } catch {
        showNotice('Failed to load conversation preferences.');
      }
    } else if (key === 'away_message') {
      const nextAway = !awayEnabled;
      setAwayEnabled(nextAway);
      try {
        await onConversationPreference?.(selectedMessage?.seller_user_id, nextAway, chatMuted);
      } catch {
        // keep local UX responsive even if backend save fails
      }
      showNotice(nextAway ? 'Away message enabled.' : 'Away message disabled.');
    } else if (key === 'manage_settings') {
      const nextMuted = !chatMuted;
      setChatMuted(nextMuted);
      try {
        await onConversationPreference?.(selectedMessage?.seller_user_id, awayEnabled, nextMuted);
      } catch {
        // keep local UX responsive even if backend save fails
      }
      showNotice(nextMuted ? 'Conversation muted.' : 'Conversation unmuted.');
    }
    setHeaderMenuOpen(false);
  };

  const toggleLike = (id) => {
    setThread((prev) => prev.map((msg) => {
      if (msg.id !== id) return msg;
      const nextLiked = !msg.liked;
      return { ...msg, liked: nextLiked, likes: Math.max(0, (msg.likes || 0) + (nextLiked ? 1 : -1)) };
    }));
  };

  const setReaction = (id, emoji) => {
    setThread((prev) => prev.map((msg) => (msg.id === id ? { ...msg, reaction: emoji || '' } : msg)));
    if (String(id || '').startsWith('local-')) return;
    Promise.resolve(onMessageAction?.(id, selectedMessage?.chat_type, 'react', emoji || '')).catch(() => {
      showNotice('Reaction save failed.');
    });
  };

  const openMessageMenuAt = (event, messageId) => {
    event.preventDefault();
    event.stopPropagation();
    const menuWidth = 190;
    const menuHeight = 290;
    const pad = 10;
    const x = Math.min(Math.max(pad, event.clientX), window.innerWidth - menuWidth - pad);
    const hasBottomSpace = window.innerHeight - event.clientY > menuHeight;
    const y = hasBottomSpace ? event.clientY : Math.max(pad, event.clientY - menuHeight);
    setMenuState({ open: true, x, y, messageId });
    setEmojiPickerFor('');
  };

  const handleContextAction = (label) => {
    showNotice(`${label} option selected.`);
    setMenuState((prev) => ({ ...prev, open: false }));
    setEmojiPickerFor('');
  };

  const handleCopyMessage = async (messageId) => {
    const msg = thread.find((row) => row.id === messageId);
    if (!msg?.text) return;
    try {
      await navigator.clipboard.writeText(msg.text);
      showNotice('Message copied.');
    } catch {
      showNotice('Copy failed.');
    }
    setMenuState((prev) => ({ ...prev, open: false }));
    setEmojiPickerFor('');
  };

  const handleDeleteMessage = (messageId) => {
    const id = String(messageId || '').trim();
    if (!id) return;
    setMenuState((prev) => ({ ...prev, open: false }));
    setEmojiPickerFor('');
    if (replyTo?.id === id) setReplyTo(null);
    setThread((prev) => prev.filter((row) => row.id !== id));
    if (id.startsWith('local-')) return;
    const chatType = selectedMessage?.chat_type || 'gig';
    void Promise.resolve(onDeleteMessage?.(id, chatType)).catch((err) => {
      console.error('Chat message delete failed:', err);
    });
  };

  const handleStarMessage = (messageId) => {
    let nextStar = false;
    setThread((prev) => prev.map((row) => {
      if (row.id !== messageId) return row;
      nextStar = !row.starred;
      return { ...row, starred: nextStar };
    }));
    setMenuState((prev) => ({ ...prev, open: false }));
    setEmojiPickerFor('');
    showNotice('Message starred.');
    if (!String(messageId || '').startsWith('local-')) {
      Promise.resolve(onMessageAction?.(messageId, selectedMessage?.chat_type, 'star', String(nextStar))).catch(() => {
        showNotice('Star sync failed.');
      });
    }
  };

  const handleReplyToMessage = (messageId) => {
    const msg = thread.find((row) => row.id === messageId);
    if (!msg) return;
    setReplyTo({ id: msg.id, text: msg.text, sender: msg.sender });
    setDraft((prev) => (prev ? prev : `Reply: "${msg.text.slice(0, 42)}${msg.text.length > 42 ? '...' : ''}" `));
    setMenuState((prev) => ({ ...prev, open: false }));
    setEmojiPickerFor('');
  };

  const handleSend = async () => {
    const body = draft.trim();
    if ((!body && pendingAttachments.length === 0) || sending) return;
    const tempId = `local-${Date.now()}`;
    const now = new Date().toISOString();
    const sendAttachments = [...pendingAttachments];
    setThread((prev) => [
      ...prev,
      {
        id: tempId,
        sender: 'buyer',
        text: body || 'Attachment',
        time: now,
        delivery: 'sent',
        likes: 0,
        liked: false,
        starred: false,
        reaction: '',
        attachments: sendAttachments,
        replyTo: replyTo ? { ...replyTo } : null,
      },
    ]);
    setDraft('');
    setReplyTo(null);

    let sentOk = false;
    try {
      const messageType = pendingAttachments.length ? 'attachment' : 'text';
      const res = await onSendMessage?.(body, {
        attachments: sendAttachments,
        reply_to_id: replyTo?.id || '',
        message_type: messageType,
      });
      const persistedId = String(res?.id || tempId);
      const backendDelivery = String(res?.delivery_status || 'sent');
      setThread((prev) => prev.map((msg) => (
        msg.id === tempId ? { ...msg, id: persistedId, delivery: backendDelivery } : msg
      )));
      if (persistedId && persistedId !== tempId) {
        setTimeout(async () => {
          try {
            await onUpdateDeliveryStatus?.(persistedId, selectedMessage?.chat_type, 'delivered');
            setThread((prev) => prev.map((msg) => (msg.id === persistedId ? { ...msg, delivery: 'delivered' } : msg)));
          } catch {}
        }, 800);
      }
      sentOk = true;
    } catch {
      setThread((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, delivery: 'failed' } : msg)));
      showNotice('Send failed.');
    } finally {
      if (sentOk) setPendingAttachments([]);
    }
  };

  const appendToDraft = (value) => {
    setDraft((prev) => `${prev}${prev ? ' ' : ''}${value}`);
  };

  const toAbsoluteUrl = (url) => {
    const raw = String(url || '').trim();
    if (!raw) return '';
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    return `${String(API_BASE_URL || '').replace(/\/+$/, '')}/${raw.replace(/^\/+/, '')}`;
  };

  const handlePickFile = async (event, kind = 'file') => {
    const file = event?.target?.files?.[0];
    if (!file) return;
    try {
      const uploaded = await onUploadAttachment?.(file, kind);
      if (uploaded) {
        setPendingAttachments((prev) => [...prev, uploaded]);
        appendToDraft(`[${kind}: ${uploaded.name || file.name}]`);
        showNotice(`${kind} uploaded: ${uploaded.name || file.name}`);
      }
    } catch {
      showNotice(`${kind} upload failed.`);
    } finally {
      event.target.value = '';
    }
  };

  const handleOpenComposerEmoji = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setComposerEmojiAnchor({ x: rect.left, y: rect.top - 368 });
    setComposerEmojiOpen((prev) => !prev);
  };

  const handleInsertCode = () => {
    setDraft((prev) => `${prev}\n\`\`\`\n\n\`\`\``.trimStart());
    showNotice('Code block inserted.');
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = null;
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      mediaChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data?.size) mediaChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const seconds = recordingSecs || 0;
        const blob = new Blob(mediaChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
        onUploadAttachment?.(file, 'audio')
          .then((uploaded) => {
            if (uploaded) {
              setPendingAttachments((prev) => [...prev, uploaded]);
              appendToDraft(`[Voice note ${seconds}s]`);
              showNotice('Voice note uploaded.');
            }
          })
          .catch(() => showNotice('Voice upload failed.'));
        setRecordingSecs(0);
      };
      recorder.start();
      setIsRecording(true);
      setRecordingSecs(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSecs((prev) => prev + 1);
      }, 1000);
    } catch {
      showNotice('Mic permission required for audio note.');
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    await startRecording();
  };

  return {
    draft,
    setDraft,
    thread,
    chatNotice,
    menuState,
    setMenuState,
    emojiPickerFor,
    setEmojiPickerFor,
    emojiAnchor,
    setEmojiAnchor,
    replyTo,
    setReplyTo,
    orderModalOpen,
    setOrderModalOpen,
    composerEmojiOpen,
    setComposerEmojiOpen,
    composerEmojiAnchor,
    isRecording,
    recordingSecs,
    pendingAttachments,
    setPendingAttachments,
    headerMenuOpen,
    setHeaderMenuOpen,
    callModalType,
    setCallModalType,
    isDraftConversation,
    orderInfo,
    menuRef,
    pickerRef,
    composerPickerRef,
    composerToolsRef,
    headerMenuRef,
    fileInputRef,
    imageInputRef,
    showNotice,
    startBrowserCall,
    copyCallLink,
    handleHeaderMenuAction,
    toggleLike,
    setReaction,
    openMessageMenuAt,
    handleContextAction,
    handleCopyMessage,
    handleDeleteMessage,
    handleStarMessage,
    handleReplyToMessage,
    handleSend,
    appendToDraft,
    toAbsoluteUrl,
    handlePickFile,
    handleOpenComposerEmoji,
    handleInsertCode,
    toggleRecording,
    tryOpenGigSurfaceFromChat,
    openRelatedGigSurfaceFromModal,
  };
};

export default useChatWindowState;
