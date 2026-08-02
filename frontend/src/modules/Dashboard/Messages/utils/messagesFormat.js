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

const sameCalendarDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const formatDaySeparator = (isoText) => {
  if (!isoText) return '';
  const dt = new Date(isoText);
  if (Number.isNaN(dt.getTime())) return '';
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (sameCalendarDay(dt, today)) return 'Today';
  if (sameCalendarDay(dt, yesterday)) return 'Yesterday';
  return dt.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
};

export const filterMessages = (messages, activeFilter, query, advanced = null) => {
  const q = String(query || '').trim().toLowerCase();
  const stage = String(advanced?.stage || '').trim().toLowerCase();
  const skillsQ = String(advanced?.skills || '').trim().toLowerCase();
  const dateKey = String(advanced?.date || '').trim();
  const labels = Array.isArray(advanced?.labels) ? advanced.labels.map((x) => String(x).toLowerCase()) : [];

  return messages.filter((row) => {
    if (activeFilter === 'unread' && String(row.status || '').toLowerCase() !== 'new') return false;
    if (activeFilter === 'mentions' && !String(row.body || '').includes('@')) return false;

    if (stage) {
      const rowStage = String(row.hiring_stage || '').toLowerCase();
      if (rowStage !== stage) return false;
    }
    if (labels.length) {
      const rowLabels = Array.isArray(row.labels) ? row.labels.map((x) => String(x).toLowerCase()) : [];
      if (!labels.every((lab) => rowLabels.includes(lab))) return false;
    }
    if (skillsQ) {
      const skills = Array.isArray(row.candidate_skills) ? row.candidate_skills.join(' ') : '';
      if (!`${skills}`.toLowerCase().includes(skillsQ)) return false;
    }
    if (dateKey) {
      const created = row.created_at ? new Date(row.created_at) : null;
      if (!created || Number.isNaN(created.getTime())) return false;
      const iso = created.toISOString().slice(0, 10);
      if (iso !== dateKey) return false;
    }

    if (!q) return true;
    const hay = [
      row.context_title,
      row.body,
      row.from_user_id,
      row.from_user_name,
      ...(Array.isArray(row.candidate_skills) ? row.candidate_skills : []),
      ...(Array.isArray(row.labels) ? row.labels : []),
      row.hiring_stage,
    ]
      .join(' ')
      .toLowerCase();
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
