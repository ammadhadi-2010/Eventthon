import API from '../../../api/axiosConfig';

const TIMEOUT_MS = 12000;

export async function fetchAdminChatThreads(channel) {
  const res = await API.get('/api/admin/chat/threads', {
    params: { channel },
    timeout: TIMEOUT_MS,
  });
  return Array.isArray(res?.data?.threads) ? res.data.threads : [];
}

export async function fetchAdminChatMessages(channel, threadKey) {
  const res = await API.get('/api/admin/chat/messages', {
    params: { channel, thread_key: threadKey },
    timeout: TIMEOUT_MS,
  });
  return Array.isArray(res?.data?.messages) ? res.data.messages : [];
}

export async function sendAdminChatMessage(channel, threadKey, body) {
  const res = await API.post(
    '/api/admin/chat/send',
    { channel, thread_key: threadKey, body },
    { timeout: TIMEOUT_MS },
  );
  return res?.data || {};
}
