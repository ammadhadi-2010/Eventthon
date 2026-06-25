/** Navigate from Messages when user taps “View Order”. Only `order_id` on the thread is trusted as an order Mongo id — sidebar context id is usually a gig id. */

export function isMongoObjectId(value) {
  return /^[a-f\d]{24}$/i.test(String(value || '').trim());
}

export function navigateFromChatGigContext(navigate, selectedMessage = {}) {
  const rawOrderMsg = String(selectedMessage.order_id || '').trim();
  const rawCtx = String(selectedMessage.context_id || '').trim();
  const chatType = String(selectedMessage.chat_type || '').toLowerCase();

  const orderMongo = isMongoObjectId(rawOrderMsg) ? rawOrderMsg : '';

  const ctxMongo =
    rawCtx && isMongoObjectId(rawCtx)
      ? rawCtx
      : '';

  if (orderMongo) {
    navigate('/gigs', { state: { gigsSection: 'Orders', gigOrderId: orderMongo } });
    return true;
  }
  if (ctxMongo && chatType === 'gig') {
    navigate(`/gigs/explorer?gig=${encodeURIComponent(ctxMongo)}`);
    return true;
  }
  return false;
}
