export function isMongoId(value) {
  return /^[a-f\d]{24}$/i.test(String(value || '').trim());
}

export function buildDraftRow(source) {
  if (!source) return null;
  const now = new Date().toISOString();
  const peerId = String(source.peer_user_id || source.from_user_id || '').trim();
  const peerName = String(source.peer_user_name || source.from_user_name || peerId || 'New Contact').trim();
  return {
    _id: `draft-${Date.now()}`,
    chat_type: source?.chat_type || 'job',
    chat_tag: source?.chat_tag || 'Message',
    channel: source?.channel || '',
    context_title: source?.context_title || 'New Conversation',
    context_id: source?.context_id || '',
    seller_user_id: source?.seller_user_id || '',
    from_user_id: peerId || source?.from_user_id || 'New Contact',
    from_user_name: peerName,
    from_user_imageurl: source?.from_user_imageurl || source?.imageurl || '',
    candidate_user_id: source?.candidate_user_id || peerId || '',
    peer_user_id: peerId,
    peer_user_name: peerName,
    body: source?.body || 'Start typing to continue this conversation.',
    order_id: source?.order_id || '',
    created_at: now,
    status: 'new',
    _isDraft: true,
    _isTeamMember: Boolean(source?._isTeamMember),
  };
}

/** Map a company team member into a new-message recipient / draft source. */
export function teamMemberToRecipient(member, employerId) {
  if (!member) return null;
  const peerId = String(member.email || member.userId || member.id || '').trim();
  if (!peerId) return null;
  const peerName = String(member.name || member.email || peerId).trim();
  return {
    peer_user_id: peerId,
    peer_user_name: peerName,
    from_user_id: peerId,
    from_user_name: peerName,
    from_user_imageurl: member.imageurl || '',
    candidate_user_id: peerId,
    seller_user_id: employerId || '',
    chat_type: 'job',
    chat_tag: 'Team Member',
    channel: 'candidate',
    context_title: `Team · ${member.roleLabel || member.role || 'Member'}`,
    context_id: `team-${member.userId || member.id || peerId}`,
    body: 'Start typing to message this team member.',
    _isTeamMember: true,
  };
}

export function resolveConversationPeerId(row, viewerId) {
  if (!row) return '';
  const self = String(viewerId || '').trim().toLowerCase();
  const candidate = String(row.candidate_user_id || '').trim();
  const peer = String(row.peer_user_id || '').trim();
  const from = String(row.from_user_id || '').trim();
  const seller = String(row.seller_user_id || '').trim();

  const pick = (...vals) => {
    for (const v of vals) {
      const t = String(v || '').trim();
      if (!t) continue;
      if (self && t.toLowerCase() === self) continue;
      return t;
    }
    return '';
  };

  // Prefer explicit peer, then non-self candidate/from/seller
  return pick(peer, candidate, from, seller);
}

/** Hide threads that are only "me" (outbound/self), same rule for public + company. */
export function isSelfConversation(row, viewerId) {
  if (!row) return false;
  const self = String(viewerId || '').trim().toLowerCase();
  if (!self) return false;
  const channel = String(row.channel || row.chat_type || '').toLowerCase();
  if (channel === 'admin_support') return false;
  const peer = resolveConversationPeerId(row, viewerId);
  if (!peer) return true;
  return peer.toLowerCase() === self;
}

/** @deprecated use isSelfConversation — kept for older imports */
export function isCompanySelfConversation(row, employerId) {
  return isSelfConversation(row, employerId);
}
