import { useCallback } from 'react';
import API from '../../../../../api/axiosConfig';
import { deleteChatMessage, uploadChatAttachment } from '../../services/chatApi';
import { getMessagesSessionHeaders } from '../../utils/messagesSession';
import useMessagesInboxSend from './useMessagesInboxSend';
import { isMongoId } from '../utils/inboxHelpers';

export default function useMessagesInboxActions(state) {
  const {
    userId,
    selectedRow,
    selectedId,
    setSelectedId,
    setSendError,
    setRowPatches,
    setHiddenIds,
    setThreadOutbox,
    setRemovedMessageIds,
  } = state;

  const sendHandlers = useMessagesInboxSend(state);

  const handleUpdateDeliveryStatus = useCallback(async (messageId, chatType, deliveryStatus) => {
    const id = String(messageId || '').trim();
    if (!isMongoId(id)) return;
    await API.post(
      '/api/messages/unified-delivery',
      {
        message_id: messageId,
        chat_type: String(chatType || 'gig').toLowerCase(),
        delivery_status: String(deliveryStatus || 'sent').toLowerCase(),
      },
      { headers: getMessagesSessionHeaders() },
    );
    setRowPatches((prev) => ({
      ...prev,
      [messageId]: { ...(prev[messageId] || {}), delivery_status: String(deliveryStatus || 'sent').toLowerCase() },
    }));
  }, [setRowPatches]);

  const handleMenuAction = useCallback((rowId, actionKey) => {
    if (!rowId) return;
    if (actionKey === 'mark_unread') {
      setRowPatches((prev) => ({ ...prev, [rowId]: { ...(prev[rowId] || {}), status: 'new' } }));
      return;
    }
    if (actionKey === 'star') {
      setRowPatches((prev) => {
        const nextStar = !(prev[rowId]?.starred);
        return { ...prev, [rowId]: { ...(prev[rowId] || {}), starred: nextStar } };
      });
      return;
    }
    if (actionKey === 'label_jobs') {
      setRowPatches((prev) => ({
        ...prev,
        [rowId]: { ...(prev[rowId] || {}), chat_type: 'job', chat_tag: 'Job Inquiry' },
      }));
      return;
    }
    if (actionKey === 'move_other') {
      setRowPatches((prev) => ({ ...prev, [rowId]: { ...(prev[rowId] || {}), chat_tag: 'Other' } }));
      return;
    }
    if (actionKey === 'archive' || actionKey === 'hide_report' || actionKey === 'delete') {
      setHiddenIds((prev) => (prev.includes(rowId) ? prev : [...prev, rowId]));
      if (selectedId === rowId) setSelectedId('');
      return;
    }
    if (actionKey === 'why_ad') setSendError('This suggestion is based on recent activity.');
  }, [setRowPatches, setHiddenIds, selectedId, setSelectedId, setSendError]);

  const handleDeleteMessage = useCallback((messageId, chatType) => {
    const id = String(messageId || '').trim();
    if (!isMongoId(id)) return;
    setRemovedMessageIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setThreadOutbox((prev) => prev.filter((row) => row._id !== id));
    void deleteChatMessage(id, chatType).catch((err) => console.error('Chat message delete failed:', err));
  }, [setRemovedMessageIds, setThreadOutbox]);

  const handleMessageAction = useCallback(async (messageId, chatType, action, value = '') => {
    const id = String(messageId || '').trim();
    if (!isMongoId(id)) return null;
    const res = await API.post(
      '/api/messages/unified-action',
      {
        message_id: id,
        chat_type: String(chatType || selectedRow?.chat_type || selectedRow?.channel || 'gig').toLowerCase(),
        action,
        value: String(value ?? ''),
      },
      { headers: getMessagesSessionHeaders() },
    );
    const data = res?.data || {};
    if (action === 'like' && Array.isArray(data.liked_by)) {
      setRowPatches((prev) => ({
        ...prev,
        [id]: {
          ...(prev[id] || {}),
          liked_by: data.liked_by,
          likes: Number(data.likes) || data.liked_by.length,
          liked: Boolean(data.liked),
          chat_type: data.chat_type || chatType,
        },
      }));
    }
    return data;
  }, [selectedRow?.chat_type, selectedRow?.channel, setRowPatches]);

  const fetchConversationPreference = useCallback(async (sellerUserId) => {
    const sellerId = String(sellerUserId || '').trim();
    const viewerId = String(userId || '').trim();
    if (!sellerId || !viewerId) return null;
    const res = await API.get('/api/messages/conversation-preferences', {
      params: { seller_user_id: sellerId, viewer_user_id: viewerId },
    });
    return res?.data?.preferences || null;
  }, [userId]);

  const saveConversationPreference = useCallback(async (sellerUserId, patch = {}) => {
    const sellerId = String(sellerUserId || '').trim();
    const viewerId = String(userId || '').trim();
    if (!sellerId || !viewerId) return null;
    const existing = await fetchConversationPreference(sellerId);
    const res = await API.post('/api/messages/conversation-preferences', {
      seller_user_id: sellerId,
      viewer_user_id: viewerId,
      away_enabled: Boolean(patch.away_enabled ?? existing?.away_enabled ?? false),
      muted: Boolean(patch.muted ?? existing?.muted ?? false),
      blocked: Boolean(patch.blocked ?? existing?.blocked ?? false),
    });
    return res?.data?.preferences || null;
  }, [userId, fetchConversationPreference]);

  const handleConversationPreference = useCallback(
    (sellerUserId, awayEnabled, muted) =>
      saveConversationPreference(sellerUserId, { away_enabled: awayEnabled, muted }),
    [saveConversationPreference],
  );

  const fetchConversationSidebar = useCallback(async (row) => {
    const chatType = String(row?.chat_type || 'gig').toLowerCase();
    if (!['gig', 'job', 'project'].includes(chatType)) return null;
    const sellerId = String(row?.seller_user_id || '').trim();
    const viewerId = String(userId || '').trim();
    if (!sellerId || !viewerId) return null;
    const peerId = String(
      row?.peer_user_id ||
        (String(row?.chat_tag || '').toLowerCase() === 'company' ? row?.seller_user_id : '') ||
        row?.from_user_id ||
        '',
    ).trim();
    try {
      const res = await API.get('/api/messages/conversation-sidebar', {
        params: {
          seller_user_id: sellerId,
          viewer_user_id: viewerId,
          chat_type: chatType,
          context_id: String(row?.context_id || ''),
          context_title: String(row?.context_title || ''),
          peer_user_id: peerId || sellerId,
        },
      });
      return res?.data || null;
    } catch {
      return null;
    }
  }, [userId]);

  return {
    ...sendHandlers,
    handleUpdateDeliveryStatus,
    handleMenuAction,
    handleDeleteMessage,
    handleMessageAction,
    handleUploadAttachment: uploadChatAttachment,
    fetchConversationPreference,
    saveConversationPreference,
    handleConversationPreference,
    fetchConversationSidebar,
  };
}
