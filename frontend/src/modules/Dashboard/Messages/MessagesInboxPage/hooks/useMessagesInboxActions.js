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
    if (!messageId) return;
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
    if (!id || id.startsWith('local-')) return;
    setRemovedMessageIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setThreadOutbox((prev) => prev.filter((row) => row._id !== id));
    void deleteChatMessage(id, chatType).catch((err) => console.error('Chat message delete failed:', err));
  }, [setRemovedMessageIds, setThreadOutbox]);

  const handleMessageAction = useCallback(async (messageId, chatType, action, value = '') => {
    if (!messageId) return;
    await API.post(
      '/api/messages/unified-action',
      {
        message_id: messageId,
        chat_type: String(chatType || selectedRow?.chat_type || 'gig').toLowerCase(),
        action,
        value: String(value || ''),
      },
      { headers: getMessagesSessionHeaders() },
    );
  }, [selectedRow?.chat_type]);

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
    if (!sellerId || !viewerId || !isMongoId(sellerId) || !isMongoId(viewerId)) return null;
    try {
      const res = await API.get('/api/messages/conversation-sidebar', {
        params: {
          seller_user_id: sellerId,
          viewer_user_id: viewerId,
          chat_type: String(row?.chat_type || 'gig').toLowerCase(),
          context_id: String(row?.context_id || ''),
          context_title: String(row?.context_title || ''),
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
