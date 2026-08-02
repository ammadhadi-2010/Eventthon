import { useCallback } from 'react';
import API from '../../../../../api/axiosConfig';
import { sendChatMessage } from '../../services/chatApi';
import { buildDraftRow, isMongoId, resolveConversationPeerId } from '../utils/inboxHelpers';
import { getMessagesSenderId } from '../../utils/messagesSession';
import { readStoredUserStub } from '../../../../../utils/storedUser';

export default function useMessagesInboxSend(state) {
  const {
    companyMode,
    squadMode = false,
    userId,
    selectedRow,
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
    const sessionSender =
      getMessagesSenderId(readStoredUserStub()) ||
      localStorage.getItem('userEmail') ||
      localStorage.getItem('userMobile') ||
      localStorage.getItem('user_id') ||
      userId ||
      '';
    const employerId = sessionSender;
    const isAdminSupport =
      companyMode &&
      (selectedRow.channel === 'admin_support' || selectedRow.chat_type === 'admin_support');
    const chatType = String(selectedRow.chat_type || 'job').toLowerCase();
    const peerId = resolveConversationPeerId(selectedRow, sessionSender);
    // Company/squad threads: seller = viewer account for outbound.
    let sellerId = String(selectedRow.seller_user_id || '').trim();
    if (!sellerId && (companyMode || squadMode)) sellerId = employerId;
    if (!sellerId && !companyMode && !squadMode) {
      // Outbound to a peer who is seller, or company peer stored as peer_user_id
      const tag = String(selectedRow.chat_tag || '').toLowerCase();
      if (tag === 'company' || String(selectedRow.context_id || '').startsWith('team-')) {
        sellerId = peerId || String(selectedRow.peer_user_id || '').trim();
      } else {
        sellerId = String(selectedRow.seller_user_id || peerId || '').trim();
      }
    }
    if (!sellerId && !isAdminSupport) {
      setSendError('Recipient context is missing. Select a conversation first.');
      throw new Error('Missing seller id');
    }
    if (!isAdminSupport && !['gig', 'job', 'project'].includes(chatType)) {
      setSendError('Open the squad hub to continue this invitation conversation.');
      throw new Error('Unsupported chat type');
    }
    if (!isAdminSupport && companyMode && !sellerId) {
      setSendError('Company identity is missing. Please sign in again.');
      throw new Error('Missing company identity');
    }
    if (!sessionSender) {
      setSendError('Sender ID is missing. Please sign in again.');
      throw new Error('Missing sender id');
    }
    if (
      (companyMode || squadMode) &&
      !isAdminSupport &&
      (!peerId || peerId.toLowerCase() === String(sessionSender).toLowerCase())
    ) {
      setSendError(
        squadMode
          ? 'Pick a squad member before sending.'
          : 'Pick a team member or candidate before sending.',
      );
      throw new Error('Missing peer');
    }

    setSending(true);
    setSendError('');
    try {
      if (isAdminSupport) {
        const attachments = (Array.isArray(meta.attachments) ? meta.attachments : [])
          .map((att) => ({
            name: String(att?.name || 'attachment'),
            url: String(att?.imageurl || att?.url || ''),
            imageurl: String(att?.imageurl || att?.url || ''),
            type: String(att?.type || att?.kind || 'file').toLowerCase(),
            size: Number(att?.size || 0),
          }))
          .filter((att) => att.url);
        const res = await API.post('/api/messages/company-support-send', {
          employer_user_id: employerId || sellerId,
          body: payloadBody,
          attachments,
        });
        const newId = String(res?.data?.id || selectedRow._id);
        const persisted = res?.data?.message
          ? {
              ...res.data.message,
              attachments: Array.isArray(res.data.message.attachments) && res.data.message.attachments.length
                ? res.data.message.attachments
                : attachments,
            }
          : {
              _id: newId,
              chat_type: 'admin_support',
              channel: 'admin_support',
              context_id: selectedRow.context_id,
              context_title: selectedRow.context_title,
              seller_user_id: selectedRow.seller_user_id || employerId || sellerId,
              from_user_id: employerId || sellerId,
              body: payloadBody,
              attachments,
              delivery_status: 'sent',
              created_at: new Date().toISOString(),
            };
        setThreadOutbox((prev) => [...prev, persisted]);
        setRowPatches((prev) => ({
          ...prev,
          [selectedRow._id]: {
            ...(prev[selectedRow._id] || {}),
            body: payloadBody,
            created_at: persisted.created_at,
            delivery_status: 'sent',
            status: 'new',
          },
        }));
        window.setTimeout(() => {
          loadInbox(true).catch(() => {});
        }, 400);
        return { id: newId, delivery_status: 'sent', message: persisted };
      }

      const senderId =
        companyMode || squadMode ? employerId || sellerId || sessionSender : sessionSender;
      const existingCandidate = String(selectedRow.candidate_user_id || '').trim();
      const isCompanyThread =
        String(selectedRow.chat_tag || '').toLowerCase() === 'company' ||
        String(selectedRow.context_id || '').startsWith('team-') ||
        Boolean(existingCandidate);
      const candidateToSend =
        companyMode || squadMode
          ? peerId
          : existingCandidate || (isCompanyThread ? String(sessionSender).trim() : '');

      // Prefer mongo reply ids only — local temp ids must not be sent
      const replyRaw = String(meta.reply_to_id || '').trim();
      const replyToId = isMongoId(replyRaw) ? replyRaw : '';

      const res = await sendChatMessage({
        seller_user_id: sellerId,
        from_user_id: senderId,
        chat_type: chatType || 'job',
        context_title: selectedRow.context_title || 'New Conversation',
        context_id: selectedRow.context_id || '',
        body: payloadBody,
        attachments: Array.isArray(meta.attachments) ? meta.attachments : [],
        reply_to_id: replyToId,
        message_type: String(meta.message_type || 'text'),
        ...(candidateToSend ? { candidate_user_id: candidateToSend } : {}),
      });
      if (!res?.id && !res?.message) {
        throw new Error('Message was not saved.');
      }
      const newId = String(res?.id || selectedRow._id);
      const persisted = res?.message
        ? {
            ...res.message,
            candidate_user_id: candidateToSend || res.message.candidate_user_id || '',
            peer_user_id: peerId || selectedRow.peer_user_id || '',
            peer_user_name: selectedRow.peer_user_name || selectedRow.from_user_name || '',
            from_user_imageurl: selectedRow.from_user_imageurl || res.message.from_user_imageurl || '',
            channel: selectedRow.channel || res.message.channel || (companyMode ? 'candidate' : ''),
            chat_tag: selectedRow.chat_tag || res.message.chat_tag,
          }
        : null;
      const now = new Date().toISOString();
      const deliveryStatus = String(persisted?.delivery_status || 'sent');
      if (persisted) setThreadOutbox((prev) => [...prev, persisted]);
      if (selectedRow._isDraft) {
        setDraftConversations((prev) => prev.filter((row) => row._id !== selectedRow._id));
      }
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
      try {
        await loadInbox(true);
      } catch {
        /* ignore */
      }
      if (companyMode && peerId) {
        window.setTimeout(() => {
          try {
            window.dispatchEvent(
              new CustomEvent('msgx:select-peer', {
                detail: { peerId: peerId.toLowerCase(), contextId: selectedRow.context_id },
              }),
            );
          } catch {
            /* ignore */
          }
        }, 80);
      } else if (selectedRow._isDraft) {
        setSelectedId(newId);
      }
      return { id: newId, delivery_status: deliveryStatus, message: persisted };
    } catch (error) {
      const detail = error?.response?.data?.detail;
      setSendError(typeof detail === 'string' ? detail : (error?.message || 'Message send failed.'));
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
