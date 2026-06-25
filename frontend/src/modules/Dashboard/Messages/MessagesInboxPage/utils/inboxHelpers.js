export function isMongoId(value) {
  return /^[a-f\d]{24}$/i.test(String(value || '').trim());
}

export function buildDraftRow(source) {
  if (!source) return null;
  const now = new Date().toISOString();
  return {
    _id: `draft-${Date.now()}`,
    chat_type: source?.chat_type || 'gig',
    chat_tag: source?.chat_tag || 'Gig Inquiry',
    context_title: source?.context_title || 'New Conversation',
    context_id: source?.context_id || '',
    seller_user_id: source?.seller_user_id || '',
    from_user_id: source?.from_user_id || 'New Contact',
    body: source?.body || 'Start typing to continue this conversation.',
    order_id: source?.order_id || '',
    created_at: now,
    status: 'new',
    _isDraft: true,
  };
}
