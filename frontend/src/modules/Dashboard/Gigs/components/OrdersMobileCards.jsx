import React from 'react';

export function OrdersOrderMobileCard({ row, spotlight }) {
  return (
    <article className={`ord-m-card${spotlight ? ' is-spotlight' : ''}`}>
      <div className="ord-m-top">
        <span className="ord-m-id">{row.orderId}</span>
        <em className={`orders-status ${row.statusClass}`}>{row.status}</em>
      </div>
      <h3 className="ord-m-gig">{row.gig}</h3>
      <div className="ord-m-meta">
        <span><strong>Buyer</strong> {row.buyer}</span>
        <span><strong>Amount</strong> {row.amount}</span>
      </div>
      <p className="ord-m-date">{row.date}</p>
    </article>
  );
}

export function OrdersBuyerMobileCard({ buyer }) {
  const fields = [
    ['Buyer ID', buyer.buyerCode],
    ['Region', buyer.region],
    ['Verification', buyer.verification],
    ['Trust Score', buyer.trustScore],
    ['Total Orders', buyer.totalOrders],
    ['Total Spent', buyer.totalSpent],
  ];

  return (
    <article className="ord-m-card ord-m-card--buyer">
      <h3 className="ord-m-gig">{buyer.buyer}</h3>
      <p className="ord-m-sub">{buyer.orderId}</p>
      <dl className="ord-m-dl">
        {fields.map(([label, value]) => (
          <div key={label} className="ord-m-dl-row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
