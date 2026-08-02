import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL } from '../../../../../api/axiosConfig';
import { navigateFromChatGigContext } from '../../../Gigs/utils/navigateGigSurfaces';
import { buildThreadFromMessage } from '../../utils/messagesFormat';
import { isMongoId } from '../../MessagesInboxPage/utils/inboxHelpers';

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

  const normalizeAttachments = useCallback((raw) => {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((att) => {
        const url = String(att?.imageurl || att?.url || att?.src || '').trim();
        const type = String(att?.type || att?.kind || '').trim().toLowerCase() || 'file';
        return {
          ...att,
          name: String(att?.name || 'attachment').trim(),
          url,
          imageurl: url,
          type,
          kind: type,
        };
      })
      .filter((att) => att.url || att.name);
  }, []);

  const syncedThread = useMemo(() => {
    if (!selectedMessage || !Array.isArray(allMessages) || allMessages.length === 0) return [];
    const sellerId = String(selectedMessage.seller_user_id || '').trim().toLowerCase();
    const ctxId = String(selectedMessage.context_id || '').trim();
    const ctxTitle = String(selectedMessage.context_title || '').trim();
    const chatType = String(selectedMessage.chat_type || '').trim().toLowerCase();
    const channel = String(selectedMessage.channel || '').trim().toLowerCase();
    const isSupport = chatType === 'admin_support' || channel === 'admin_support';
    const userId = String(currentUserId || '').trim().toLowerCase();
    const userEmail = String(localStorage.getItem('userEmail') || '').trim().toLowerCase();

    const rows = allMessages
      .filter((row) => {
        if (row?.deleted) return false;
        const rowType = String(row?.chat_type || '').trim().toLowerCase();
        const rowChannel = String(row?.channel || '').trim().toLowerCase();
        if (isSupport) {
          const supportRow = rowType === 'admin_support' || rowChannel === 'admin_support';
          if (!supportRow) return false;
          const rowSeller = String(row?.seller_user_id || '').trim().toLowerCase();
          const rowCtx = String(row?.context_id || '').trim();
          if (ctxId && rowCtx && rowCtx !== ctxId) return false;
          if (sellerId && rowSeller && rowSeller !== sellerId) return false;
          return true;
        }
        const rowSeller = String(row?.seller_user_id || '').trim().toLowerCase();
        if (sellerId && rowSeller && rowSeller !== sellerId) return false;
        if (rowType && chatType && rowType !== chatType) return false;
        const rowCtx = String(row?.context_id || '').trim();
        const rowTitle = String(row?.context_title || '').trim();
        const selectedPeer = String(
          selectedMessage.candidate_user_id || selectedMessage.peer_user_id || selectedMessage.from_user_id || '',
        )
          .trim()
          .toLowerCase();
        const rowPeer = String(row?.candidate_user_id || row?.peer_user_id || '').trim().toLowerCase();
        const rowFrom = String(row?.from_user_id || '').trim().toLowerCase();
        // Company team/candidate threads: keep all messages for this peer + context
        if (selectedPeer) {
          const touchesPeer =
            rowPeer === selectedPeer ||
            rowFrom === selectedPeer ||
            (rowPeer && selectedPeer && rowPeer === selectedPeer);
          if (touchesPeer) {
            if (ctxId) return !rowCtx || rowCtx === ctxId;
            return true;
          }
        }
        if (ctxId) return rowCtx === ctxId;
        return rowTitle === ctxTitle;
      })
      .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());

    const myIds = new Set(
      [userId, userEmail, currentUserId]
        .map((v) => String(v || '').trim().toLowerCase())
        .filter(Boolean),
    );
    return rows.map((row) => {
      const fromId = String(row.from_user_id || '').trim().toLowerCase();
      const mine = fromId && (myIds.has(fromId));
      const likedBy = Array.isArray(row.liked_by)
        ? row.liked_by.map((v) => String(v || '').trim().toLowerCase()).filter(Boolean)
        : [];
      const liked = likedBy.some((id) => myIds.has(id)) || Boolean(row.liked);
      const likes = Math.max(Number(row.likes) || 0, likedBy.length);
      return {
        id: String(row._id || `row-${Math.random()}`),
        chat_type: String(row.chat_type || row.channel || selectedMessage?.chat_type || selectedMessage?.channel || '').toLowerCase(),
        sender: mine ? 'buyer' : 'seller',
        text: row.body || (normalizeAttachments(row.attachments).length ? 'Attachment' : ''),
        time: row.created_at,
        delivery: row.delivery_status || 'sent',
        reaction: row.reaction || '',
        starred: Boolean(row.starred),
        liked,
        likes,
        liked_by: likedBy,
        attachments: normalizeAttachments(row.attachments),
      };
    });
  }, [selectedMessage, allMessages, currentUserId, normalizeAttachments]);

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
      rows.map((msg) => ({
        ...msg,
        delivery:
          msg.delivery || (msg.sender === 'buyer' ? (selectedMessage?.delivery_status || 'sent') : 'delivered'),
        liked: Boolean(msg.liked),
        likes: Number(msg.likes) || 0,
        liked_by: Array.isArray(msg.liked_by) ? msg.liked_by : [],
        starred: Boolean(msg.starred),
        reaction: msg.reaction || '',
        attachments: normalizeAttachments(msg.attachments),
      })),
    [selectedMessage?.delivery_status, normalizeAttachments],
  );

  // Full reset only when switching conversations
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- conversation switch only
  }, [selectedMessage?._id]);

  // Merge inbox/outbox updates without wiping local attachment messages
  useEffect(() => {
    if (!selectedMessage?._id) return;
    const incoming = syncedThread.length > 0 ? syncedThread : seedThread;
    if (!incoming.length) return;
    const deliveryRank = { failed: 0, sending: 1, sent: 2, delivered: 3, read: 4, seen: 4 };
    setThread((prev) => {
      const prevById = new Map(prev.map((m) => [String(m.id), m]));
      const merged = incoming.map((msg) => {
        const old = prevById.get(String(msg.id));
        const incomingAtts = normalizeAttachments(msg.attachments);
        const oldAtts = normalizeAttachments(old?.attachments);
        const oldD = String(old?.delivery || '').toLowerCase();
        const newD = String(msg.delivery || '').toLowerCase();
        const pickDelivery =
          oldD === 'failed' || oldD === 'sending'
            ? oldD
            : ((deliveryRank[newD] || 0) >= (deliveryRank[oldD] || 0) ? (newD || oldD || 'sent') : (oldD || newD || 'sent'));
        const serverLikes = Number(msg.likes);
        const hasServerLike = Array.isArray(msg.liked_by) || Number.isFinite(serverLikes);
        return {
          ...msg,
          delivery: pickDelivery,
          attachments: incomingAtts.length ? incomingAtts : oldAtts,
          liked: hasServerLike ? Boolean(msg.liked) : Boolean(old?.liked),
          likes: hasServerLike
            ? (Number.isFinite(serverLikes) ? serverLikes : (msg.liked_by?.length || 0))
            : (old?.likes || 0),
          liked_by: Array.isArray(msg.liked_by) ? msg.liked_by : (old?.liked_by || []),
          reaction: msg.reaction || old?.reaction || '',
          starred: Boolean(msg.starred || old?.starred),
          replyTo: old?.replyTo || msg.replyTo || null,
        };
      });
      // Keep optimistic/sent messages not yet present in inbox snapshot
      const mergedIds = new Set(merged.map((m) => String(m.id)));
      prev.forEach((m) => {
        const id = String(m.id || '');
        if (!id || mergedIds.has(id)) return;
        const hasAtts = normalizeAttachments(m.attachments).length > 0;
        if (
          id.startsWith('local-') ||
          hasAtts ||
          m.delivery === 'sending' ||
          m.delivery === 'sent' ||
          m.delivery === 'failed'
        ) {
          merged.push(m);
          mergedIds.add(id);
        }
      });
      merged.sort((a, b) => new Date(a.time || 0).getTime() - new Date(b.time || 0).getTime());
      return merged;
    });
  }, [syncedThread, seedThread, selectedMessage?._id, normalizeAttachments]);

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
      if (event.target?.closest?.('.sch-more__menu')) return;
      setMenuState((prev) => ({ ...prev, open: false }));
      setEmojiPickerFor('');
      setComposerEmojiOpen(false);
      setHeaderMenuOpen(false);
    };
    window.addEventListener('mousedown', closeMenus);
    window.addEventListener('touchstart', closeMenus, { passive: true });
    return () => {
      window.removeEventListener('mousedown', closeMenus);
      window.removeEventListener('touchstart', closeMenus);
    };
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
    if (key === 'close') {
      setHeaderMenuOpen(false);
      return;
    }
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
    } else if (key === 'view_profile') {
      const handle = String(selectedMessage?.from_user_id || '').trim();
      if (handle) {
        navigate(`/profile/${encodeURIComponent(handle)}`);
      } else {
        showNotice('Candidate profile is not linked yet.');
      }
    }
    setHeaderMenuOpen(false);
  };

  const toggleLike = (id) => {
    const target = thread.find((msg) => String(msg.id) === String(id));
    if (!target) return;
    const nextLiked = !target.liked;
    const prevSnapshot = { liked: target.liked, likes: target.likes || 0, liked_by: target.liked_by || [] };
    setThread((prev) => prev.map((msg) => {
      if (String(msg.id) !== String(id)) return msg;
      return {
        ...msg,
        liked: nextLiked,
        likes: Math.max(0, (msg.likes || 0) + (nextLiked ? 1 : -1)),
      };
    }));
    if (!isMongoId(id)) {
      showNotice('Like saved only after message sync.');
      return;
    }
    const chatType = target.chat_type || selectedMessage?.chat_type || selectedMessage?.channel || 'gig';
    Promise.resolve(onMessageAction?.(id, chatType, 'like', String(nextLiked)))
      .then((data) => {
        if (!data || !Array.isArray(data.liked_by)) return;
        const likedBy = data.liked_by.map((v) => String(v || '').trim().toLowerCase()).filter(Boolean);
        setThread((prev) => prev.map((msg) => {
          if (String(msg.id) !== String(id)) return msg;
          return {
            ...msg,
            liked: Boolean(data.liked),
            likes: Number(data.likes) || likedBy.length,
            liked_by: likedBy,
            chat_type: data.chat_type || msg.chat_type,
          };
        }));
      })
      .catch(() => {
        setThread((prev) => prev.map((msg) => (
          String(msg.id) === String(id) ? { ...msg, ...prevSnapshot } : msg
        )));
        showNotice('Like sync failed.');
      });
  };

  const setReaction = (id, emoji) => {
    const target = thread.find((msg) => String(msg.id) === String(id));
    setThread((prev) => prev.map((msg) => (msg.id === id ? { ...msg, reaction: emoji || '' } : msg)));
    if (!isMongoId(id)) return;
    const chatType = target?.chat_type || selectedMessage?.chat_type || selectedMessage?.channel || 'gig';
    Promise.resolve(onMessageAction?.(id, chatType, 'react', emoji || '')).catch(() => {
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
    if (!isMongoId(id)) return;
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
    if (!isMongoId(messageId)) return;
    Promise.resolve(onMessageAction?.(messageId, selectedMessage?.chat_type, 'star', String(nextStar))).catch(() => {
      showNotice('Star sync failed.');
    });
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
    const sendAttachments = normalizeAttachments(pendingAttachments);
    setThread((prev) => [
      ...prev,
      {
        id: tempId,
        sender: 'buyer',
        text: body || (sendAttachments.length ? 'Attachment' : ''),
        time: now,
        delivery: 'sending',
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
      if (!res) {
        throw new Error('Send returned empty');
      }
      const persistedId = String(res?.id || tempId);
      const peerOnline =
        String(selectedMessage?.online_status || '').toLowerCase() === 'online' ||
        selectedMessage?.is_online === true;
      // sent = 1 tick; delivered (peer online) = 2 grey; read set when they open chat
      const nextDelivery = peerOnline ? 'delivered' : 'sent';
      const persistedAtts = Array.isArray(res?.message?.attachments) && res.message.attachments.length
        ? res.message.attachments.map((att) => ({
          ...att,
          url: att?.imageurl || att?.url || '',
          imageurl: att?.imageurl || att?.url || '',
        }))
        : sendAttachments;
      setThread((prev) => prev.map((msg) => (
        msg.id === tempId
          ? { ...msg, id: persistedId, delivery: nextDelivery, attachments: persistedAtts }
          : msg
      )));
      const chatType = String(selectedMessage?.chat_type || '').toLowerCase();
      if (peerOnline && persistedId && persistedId !== tempId && chatType !== 'admin_support') {
        onUpdateDeliveryStatus?.(persistedId, selectedMessage?.chat_type, 'delivered').catch(() => {});
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
    const files = Array.from(event?.target?.files || []);
    if (!files.length) return;
    try {
      for (const file of files) {
        const uploaded = await onUploadAttachment?.(file, kind);
        if (uploaded) {
          setPendingAttachments((prev) => [...prev, uploaded]);
          showNotice(`${uploaded.type || kind} uploaded: ${uploaded.name || file.name}`);
        }
      }
    } catch {
      showNotice(`${kind} upload failed.`);
    } finally {
      event.target.value = '';
    }
  };

  const handleDropFiles = async (files = []) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    try {
      for (const file of list) {
        const mime = String(file.type || '');
        const kind = mime.startsWith('image/') ? 'image' : mime.startsWith('video/') ? 'video' : 'file';
        const uploaded = await onUploadAttachment?.(file, kind);
        if (uploaded) {
          setPendingAttachments((prev) => [...prev, uploaded]);
        }
      }
      showNotice(`${list.length} file(s) attached.`);
    } catch {
      showNotice('Attachment upload failed.');
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
    handleDropFiles,
    handleOpenComposerEmoji,
    handleInsertCode,
    toggleRecording,
    tryOpenGigSurfaceFromChat,
    openRelatedGigSurfaceFromModal,
  };
};

export default useChatWindowState;
