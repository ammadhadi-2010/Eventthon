export const formatDateTime = (isoText) => {
  if (!isoText) return 'Unknown time';
  const dt = new Date(isoText);
  if (Number.isNaN(dt.getTime())) return 'Unknown time';
  return dt.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const formatClock = (isoText) => {
  if (!isoText) return '--:--';
  const dt = new Date(isoText);
  if (Number.isNaN(dt.getTime())) return '--:--';
  return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const filterMessages = (messages, activeFilter, query) => {
  const q = String(query || '').trim().toLowerCase();
  return messages.filter((row) => {
    if (activeFilter === 'unread' && String(row.status || '').toLowerCase() !== 'new') return false;
    if (activeFilter === 'mentions' && !String(row.body || '').includes('@')) return false;
    if (!q) return true;
    const hay = `${row.context_title || ''} ${row.body || ''} ${row.from_user_id || ''}`.toLowerCase();
    return hay.includes(q);
  });
};

export const buildThreadFromMessage = (message) => {
  if (!message) return [];
  const title = message.context_title || 'this task';
  const preview = message.body || 'Can we discuss details?';
  const baseThread = [
    {
      id: `${message._id}-seed-1`,
      sender: 'seller',
      text: `Salam, this is the start of your conversation about "${title}".`,
      time: message.created_at,
    },
    {
      id: `${message._id}-seed-2`,
      sender: 'buyer',
      text: 'Great. Please share timeline and deliverables.',
      time: message.created_at,
    },
    {
      id: `${message._id}-seed-3`,
      sender: 'seller',
      text: preview,
      time: message.created_at,
    },
    {
      id: `${message._id}-seed-4`,
      sender: 'buyer',
      text: 'Perfect, I will send complete requirements shortly.',
      time: message.created_at,
    },
  ];
  if (message.body || (Array.isArray(message.attachments) && message.attachments.length > 0)) {
    baseThread.push({
      id: `${message._id}-seed-live`,
      sender: 'seller',
      text: message.body || 'Attachment',
      time: message.created_at,
      attachments: Array.isArray(message.attachments) ? message.attachments : [],
    });
  }
  return baseThread;
};
