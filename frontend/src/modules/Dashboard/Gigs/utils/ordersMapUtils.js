export function formatOrderDate(iso) {
  try {
    if (!iso) return '—';
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
  } catch {
    return '—';
  }
}

export function normalizeUiStatus(raw) {
  const s = String(raw || '').trim();
  const low = s.toLowerCase();
  if (!low) return { label: 'Pending', cls: 'pending' };
  if (low === 'completed') return { label: 'Completed', cls: 'completed' };
  if (low === 'pending') return { label: 'Pending', cls: 'pending' };
  if (low.includes('beta')) return { label: 'In Progress (Beta)', cls: 'progress' };
  if (low.includes('progress')) return { label: 'In Progress', cls: 'progress' };
  if (low.includes('cancel')) return { label: 'Cancelled', cls: 'pending' };
  return { label: s.slice(0, 14), cls: 'pending' };
}

export function mapLiveOrderRow(o, idx) {
  const { label, cls } = normalizeUiStatus(o.status);
  const amt = Number(o.amount ?? 0);
  return {
    id: String(o._id || idx),
    mongoId: String(o._id || ''),
    orderId: `#${String(o._id || '').slice(-6).toUpperCase()}`,
    gig: String(o.gig_title || '').trim() || 'Gig',
    buyer: String(o.buyer?.name || o.buyer_user_id || '').trim() || 'Buyer',
    buyerUid: String(o.buyer_user_id || '').trim(),
    status: label,
    statusClass: cls,
    amount: `$${Number.isFinite(amt) ? (Number.isInteger(amt) ? String(amt) : amt.toFixed(2)) : '0'}`,
    date: formatOrderDate(o.created_at),
  };
}

export function buildBuyerRows(rows, buyerEnrichMap, buyerFallback) {
  return rows.map((row) => {
    const enrich = row.buyerUid ? buyerEnrichMap[row.buyerUid] : null;
    const detail = enrich
      ? {
          buyerCode: enrich.buyer_user_id?.slice(-8) ? `…${String(enrich.buyer_user_id).slice(-6)}` : '-',
          region: enrich.buyer_country || '-',
          verification: enrich.buyer_phone ? 'Phone on file' : 'Member',
          trustScore: '—',
          totalOrders: '-',
          totalSpent: `$${Number(enrich.amount || 0).toFixed(0)}`,
        }
      : (buyerFallback[row.buyer] || {});
    return {
      orderId: row.orderId,
      buyer: row.buyer,
      buyerCode: detail.buyerCode || '-',
      region: detail.region || '-',
      verification: detail.verification || '-',
      trustScore: detail.trustScore || '-',
      totalOrders: detail.totalOrders ?? '-',
      totalSpent: detail.totalSpent || row.amount,
    };
  });
}
