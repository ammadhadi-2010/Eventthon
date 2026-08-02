import API from '../../../../api/axiosConfig';

export async function broadcastBlogMessage({
  resourceId = '',
  title = '',
  message,
  audience = 'all',
  sendChat = true,
  sendAlert = true,
}) {
  const res = await API.post(
    '/api/admin/blog/broadcast',
    {
      resource_id: resourceId || null,
      title,
      message,
      audience,
      send_chat: sendChat,
      send_alert: sendAlert,
    },
    { timeout: 120000 },
  );
  return res?.data || {};
}
