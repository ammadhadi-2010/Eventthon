import API from '../../../api/axiosConfig';

const TIMEOUT_MS = 20000;

export async function fetchAdminChatThreads(channel) {
  const res = await API.get('/api/admin/chat/threads', {
    params: { channel },
    timeout: TIMEOUT_MS,
  });
  return {
    threads: Array.isArray(res?.data?.threads) ? res.data.threads : [],
    quickReplies: Array.isArray(res?.data?.quick_replies) ? res.data.quick_replies : [],
  };
}

export async function fetchAdminChatMessages(channel, threadKey) {
  const res = await API.get('/api/admin/chat/messages', {
    params: { channel, thread_key: threadKey },
    timeout: TIMEOUT_MS,
  });
  return {
    messages: Array.isArray(res?.data?.messages) ? res.data.messages : [],
    thread: res?.data?.thread || null,
    quickReplies: Array.isArray(res?.data?.quick_replies) ? res.data.quick_replies : [],
  };
}

export async function sendAdminChatMessage(channel, threadKey, body, attachments = []) {
  const res = await API.post(
    '/api/admin/chat/send',
    { channel, thread_key: threadKey, body, attachments },
    { timeout: TIMEOUT_MS },
  );
  return res?.data || {};
}

export async function uploadAdminChatAttachment(file, kind = 'file') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('kind', kind);
  const res = await API.post('/api/admin/chat/upload', formData, {
    timeout: 60000,
  });
  return res?.data?.attachment || null;
}

export async function likeAdminChatMessage(channel, messageId, liked) {
  const chatType = channel === 'user_candidate' ? 'user_candidate' : 'company_support';
  const headers = {};
  const email = localStorage.getItem('userEmail');
  const mobile = localStorage.getItem('userMobile');
  if (email) headers['X-User-Email'] = email;
  if (mobile) headers['X-User-Mobile'] = mobile;
  const res = await API.post(
    '/api/messages/unified-action',
    {
      message_id: messageId,
      chat_type: chatType,
      action: 'like',
      value: String(Boolean(liked)),
    },
    { headers, timeout: TIMEOUT_MS },
  );
  return res?.data || {};
}
