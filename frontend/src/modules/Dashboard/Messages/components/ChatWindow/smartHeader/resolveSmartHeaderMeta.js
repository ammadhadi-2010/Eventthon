/** Derive enterprise chat-header fields from inbox row (no DB shape change required). */

const STAGE_LABELS = {
  applied: 'Applied',
  reviewing: 'Reviewing',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview Scheduled',
  technical_test: 'Technical Test',
  offer_sent: 'Offer Sent',
  hired: 'Hired',
  rejected: 'Rejected',
  support: 'Support',
  screening: 'Reviewing',
  interview: 'Interview Scheduled',
};

function pick(...vals) {
  for (const v of vals) {
    const s = String(v || '').trim();
    if (s) return s;
  }
  return '';
}

function avatarFromName(name) {
  const text = encodeURIComponent((name || 'C').slice(0, 2).toUpperCase());
  return `https://ui-avatars.com/api/?name=${text}&background=6366f1&color=fff&size=128`;
}

function resolveStage(message = {}) {
  const raw = pick(
    message.hiring_stage,
    message.hiringStage,
    message.pipeline_stage,
    message.application_status,
  ).toLowerCase().replace(/[\s-]+/g, '_');
  const aliases = {
    interview: 'interview_scheduled',
    technical: 'technical_test',
    offer: 'offer_sent',
    screening: 'reviewing',
  };
  const key = aliases[raw] || raw;
  if (key && STAGE_LABELS[key]) return { key, label: STAGE_LABELS[key] };
  if (String(message.channel || '') === 'admin_support' || message.chat_type === 'admin_support') {
    return { key: 'support', label: 'Support' };
  }
  if (String(message.status || '').toLowerCase() === 'new') {
    return { key: 'applied', label: 'Applied' };
  }
  return { key: 'reviewing', label: 'Reviewing' };
}

function resolveOnline(message = {}) {
  const explicit = pick(message.online_status, message.presence);
  if (explicit === 'online' || explicit === 'offline' || explicit === 'away') return explicit;
  if (message.is_online === true) return 'online';
  if (message.is_online === false) return 'offline';
  return 'offline';
}

function resolveSalary(message = {}) {
  const range = pick(message.salary_range, message.salaryRange, message.pay_range);
  if (range) return range;
  const min = message.salary_min ?? message.salaryMin;
  const max = message.salary_max ?? message.salaryMax;
  if (min != null && max != null) return `${min} – ${max}`;
  if (min != null) return `From ${min}`;
  return 'Salary not listed';
}

export function resolveSmartHeaderMeta(message = {}) {
  const displayName = pick(message.from_user_name, message.from_user_id, 'Candidate');
  const stage = resolveStage(message);
  const jobId = pick(message.job_public_id, message.context_id, message.job_id, '—');
  const jobTitle = pick(message.context_title, message.job_title, 'Linked opportunity');
  const isSupport = stage.key === 'support';

  return {
    displayName,
    avatarUrl: pick(message.from_user_imageurl, message.avatar, message.imageurl) || avatarFromName(displayName),
    isVerified: Boolean(message.is_verified || message.verified || message.from_user_verified),
    onlineStatus: resolveOnline(message),
    stage,
    isSupport,
    job: {
      id: jobId,
      title: jobTitle,
      salaryRange: resolveSalary(message),
      recruiter: pick(
        message.recruiter_name,
        message.recruiterName,
        message.assigned_recruiter,
        isSupport ? 'EventThon Support' : 'Unassigned',
      ),
    },
  };
}
