/** Lightweight on-device AI helpers for company chat (no external key required). */

function candidateName(row = {}) {
  return String(row.from_user_name || row.from_user_id || 'the candidate').trim();
}

function jobTitle(row = {}) {
  return String(row.context_title || row.job_title || 'this role').trim();
}

export function buildSuggestedReplies(row = {}) {
  const name = candidateName(row);
  const job = jobTitle(row);
  return [
    `Hi ${name}, thanks for applying to ${job}. Could you share your availability this week for a quick intro call?`,
    `Thanks ${name} — your profile looks strong for ${job}. Please upload an updated resume if you have one.`,
    `Hi ${name}, we shortlisted you for ${job}. Are you open to a technical assessment next?`,
    `Appreciate the update, ${name}. We'll review and get back within 1–2 business days.`,
  ];
}

export function buildConversationSummary(row = {}, thread = []) {
  const name = candidateName(row);
  const job = jobTitle(row);
  const count = Array.isArray(thread) ? thread.length : 0;
  const last = thread?.[thread.length - 1];
  const snippet = String(last?.text || row.body || '').slice(0, 120);
  return [
    `Thread with ${name} about ${job}.`,
    `${count} message${count === 1 ? '' : 's'} so far.`,
    snippet ? `Latest: “${snippet}${snippet.length >= 120 ? '…' : ''}”` : 'No messages yet.',
    `Stage focus: move from screening toward interview if skills match.`,
  ].join(' ');
}

export function buildCandidateSummary(row = {}, profile = {}) {
  const name = profile.name || candidateName(row);
  const skills = (profile.skills || []).slice(0, 5).join(', ') || 'skills not listed';
  const rank = profile.etRank || 'Frontline';
  const loc = profile.location || 'location unknown';
  return `${name} (${rank}) based in ${loc}. Experience: ${profile.experience || '—'}. Key skills: ${skills}. Suitability for ${jobTitle(row)} should be confirmed in interview.`;
}

export function buildInterviewQuestions(row = {}, profile = {}) {
  const job = jobTitle(row);
  const skill = (profile.skills && profile.skills[0]) || 'your core stack';
  return [
    `Walk me through a project most relevant to ${job}.`,
    `How have you used ${skill} in a production setting?`,
    `Tell me about a hiring/collaboration challenge you solved recently.`,
    `How do you handle ambiguous requirements under a deadline?`,
    `What would your 30-60-90 day plan look like in this role?`,
  ].join('\n');
}

export function buildOfferLetter(row = {}, profile = {}) {
  const name = profile.name || candidateName(row);
  const job = jobTitle(row);
  return [
    `Dear ${name},`,
    '',
    `We are pleased to offer you the position of ${job} at our company.`,
    'This offer is contingent on successful completion of remaining hiring steps.',
    'Please reply with your acceptance and preferred start window.',
    '',
    'Best regards,',
    'Recruiting Team',
  ].join('\n');
}

export function improveMessageTone(text = '') {
  const raw = String(text || '').trim();
  if (!raw) {
    return 'Thanks for your note — happy to help move this forward. Let me know a time that works best for you.';
  }
  let out = raw
    .replace(/\bi\b/g, 'I')
    .replace(/\bu\b/gi, 'you')
    .replace(/\bpls\b/gi, 'please')
    .replace(/\btho\b/gi, 'though')
    .replace(/!{2,}/g, '!');
  if (!/[.!?]$/.test(out)) out += '.';
  if (!/^thanks|^hi |^hello |^dear /i.test(out)) {
    out = `Thanks for the update. ${out}`;
  }
  return out;
}
