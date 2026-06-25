import API from '../../../../api/axiosConfig';
import { getMessagesSessionHeaders, hasMessagesSession } from '../utils/messagesSession';

const TIMEOUT_MS = 30000;

function headers(extra = {}) {
  return { ...getMessagesSessionHeaders(), ...extra };
}

export async function sendChatMessage(payload) {
  if (!hasMessagesSession()) {
    throw new Error('You must be logged in to send messages');
  }
  const res = await API.post('/api/chat/send-message', payload, {
    headers: { ...headers(), 'Content-Type': 'application/json' },
    timeout: TIMEOUT_MS,
  });
  return res?.data || {};
}

export async function fetchUnifiedInbox(sellerUserId, params = {}) {
  if (!hasMessagesSession()) {
    return { messages: [], counts_by_type: {} };
  }
  const res = await API.get('/api/messages/unified-inbox', {
    headers: headers(),
    timeout: 15000,
    params: {
      seller_user_id: sellerUserId,
      chat_type: 'all',
      limit: 100,
      skip: 0,
      ...params,
    },
  });
  return res?.data || {};
}

export async function deleteChatMessage(messageId, chatType = 'gig') {
  if (!hasMessagesSession()) {
    throw new Error('You must be logged in to delete messages');
  }
  const id = encodeURIComponent(String(messageId || '').trim());
  const type = encodeURIComponent(String(chatType || 'gig').toLowerCase());
  await API.delete(`/api/chat/message/${id}?chat_type=${type}`, {
    headers: headers(),
    timeout: 10000,
  });
}

export async function uploadChatAttachment(file, kind = 'file') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('kind', kind);
  const res = await API.post('/api/messages/upload', formData, {
    headers: headers(),
    timeout: 60000,
  });
  return res?.data?.attachment || null;
}
