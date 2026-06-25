import { useCallback } from 'react';
import API from '../../../../../api/axiosConfig';
import { sendChatMessage } from '../../services/chatApi';
import { buildDraftRow, isMongoId } from '../utils/inboxHelpers';

export default function useMessagesInboxSend(state) {
  const {
    companyMode,
    userId,
    selectedRow,
    selectedId,
    setSelectedId,
    setDraftConversations,
    setActiveFilter,
    setQuery,
    setSendError,
    setSending,
    setRowPatches,
    setThreadOutbox,
    loadInbox,
  } = state;

  const createDraftFromSource = useCallback((source) => {
    const newRow = buildDraftRow(source);
    if (!newRow) return;
    setDraftConversations((prev) => [newRow, ...prev]);
    setActiveFilter('all');
    setQuery('');
    setSelectedId(newRow._id);
    setSendError('');
  }, [setDraftConversations, setActiveFilter, setQuery, setSelectedId, setSendError]);

  const handleNewMessage = useCallback(() => {
    state.setNewMsgOpen(true);
    state.setNewMsgQuery('');
  }, [state]);

  const handleSendMessage = useCallback(async (text, meta = {}) => {
    if (!selectedRow) return;
    const body = String(text || '').trim();
    const hasAttachments = Array.isArray(meta.attachments) && meta.attachments.length > 0;
    if (!body && !hasAttachments) return;
    const payloadBody = body || 'Attachment';
    const employerId =
      localStorage.getItem('userEmail') ||
      localStorage.getItem('userMobile') ||
      localStorage.getItem('user_id') ||
      '';
    const isAdminSupport =
      companyMode &&
      (selectedRow.channel === 'admin_support' || selectedRow.chat_type === 'admin_support');
    const chatType = String(selectedRow.chat_type || 'gig').toLowerCase();
    const sellerId = String(selectedRow.seller_user_id || employerId || '').trim();
    if (!sellerId && !isAdminSupport) {
      setSendError('Recipient context is missing. Select a conversation first.');
      throw new Error('Missing seller id');
    }
    if (!isAdminSupport && !['gig', 'job', 'project'].includes(chatType)) {
      setSendError('Open the squad hub to continue this invitation conversation.');
      return null;
    }
    if (!isAdminSupport && (!isMongoId(sellerId) || (!companyMode && !isMongoId(userId)))) {
      setSendError('This conversation is missing a valid recipient. Start a new message from the member profile.');
      return null;
    }
    if (!userId && !companyMode) {
      setSendError('Sender ID is missing. Please sign in again.');
      throw new Error('Missing sender id');
    }
    setSending(true);
    setSendError('');
    try {
      if (isAdminSupport) {
        const res = await API.post('/api/messages/company-support-send', {
          employer_user_id: employerId || sellerId,
          body: payloadBody,
        });
        const newId = String(res?.data?.id || selectedRow._id);
        const now = new Date().toISOString();
        setRowPatches((prev) => ({
          ...prev,
          [selectedRow._id]: {
            ...(prev[selectedRow._id] || {}),
            body: payloadBody,
            created_at: now,
            delivery_status: 'sent',
            status: 'new',
          },
        }));
        await loadInbox(true);
        return { id: newId, delivery_status: 'sent' };
      }
      const res = await sendChatMessage({
        seller_user_id: sellerId,
        from_user_id: userId,
        chat_type: selectedRow.chat_type || 'gig',
        context_title: selectedRow.context_title || 'New Conversation',
        context_id: selectedRow.context_id || '',
        body: payloadBody,
        attachments: Array.isArray(meta.attachments) ? meta.attachments : [],
        reply_to_id: String(meta.reply_to_id || ''),
        message_type: String(meta.message_type || 'text'),
      });
      const newId = String(res?.id || selectedRow._id);
      const persisted = res?.message || null;
      const now = new Date().toISOString();
      const deliveryStatus = String(persisted?.delivery_status || 'sent');
      if (persisted) setThreadOutbox((prev) => [...prev, persisted]);
      if (selectedRow._isDraft) {
        setDraftConversations((prev) => prev.map((row) => (
          row._id === selectedRow._id
            ? { ...row, _id: newId, _isDraft: false, body: payloadBody, created_at: now, status: 'new', delivery_status: deliveryStatus }
            : row
        )));
        setSelectedId(newId);
      } else {
        setRowPatches((prev) => ({
          ...prev,
          [selectedRow._id]: {
            ...(prev[selectedRow._id] || {}),
            body: payloadBody,
            created_at: now,
            delivery_status: deliveryStatus,
            status: 'new',
          },
        }));
      }
      loadInbox(true).catch(() => {});
      return { id: newId, delivery_status: deliveryStatus, message: persisted };
    } catch (error) {
      const detail = error?.response?.data?.detail;
      setSendError(typeof detail === 'string' ? detail : 'Message send failed.');
      throw error;
    } finally {
      setSending(false);
    }
  }, [
    selectedRow, userId, companyMode, setSendError, setSending, setRowPatches,
    setThreadOutbox, setDraftConversations, setSelectedId, loadInbox,
  ]);

  return { createDraftFromSource, handleNewMessage, handleSendMessage };
}
