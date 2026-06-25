import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiBarChart2, FiCheckCircle, FiClock, FiDollarSign } from 'react-icons/fi';
import API from '../../../../api/axiosConfig';
import { ordersBuyerDetails, ordersRows, ordersTabs } from '../data/gigsData';
import { buildBuyerRows, mapLiveOrderRow } from '../utils/ordersMapUtils';
import { OrdersBuyerMobileCard, OrdersOrderMobileCard } from './OrdersMobileCards';
import { GigsHubSectionHeader } from './GigsHubBackButton';
import '../styles/gigs-orders-mobile.css';

const buyerFallback = ordersBuyerDetails.reduce((acc, item) => {
  acc[item.buyer] = item;
  return acc;
}, {});

const OrdersContent = ({ spotlightOrderId = '', onConsumedSpotlight, onBack }) => {
  const rowRefs = useRef({});
  const [activeTab, setActiveTab] = useState('All Orders');
  const [liveRows, setLiveRows] = useState(null);
  const [statsLive, setStatsLive] = useState(null);
  const [buyerEnrichMap, setBuyerEnrichMap] = useState({});
  const [loadingOrders, setLoadingOrders] = useState(false);
  const userId = typeof window !== 'undefined' ? (localStorage.getItem('userId') || '').trim() : '';

  useEffect(() => {
    if (!userId) {
      setLiveRows(null);
      setStatsLive(null);
      setBuyerEnrichMap({});
      setLoadingOrders(false);
      return undefined;
    }
    let cancelled = false;
    const load = async () => {
      setLoadingOrders(true);
      try {
        const [ordersRes, statsRes, buyerRes] = await Promise.all([
          API.get('/api/gigs/orders/', { params: { seller_user_id: userId, limit: 100 } }),
          API.get('/api/gigs/orders/stats', { params: { seller_user_id: userId } }),
          API.get('/api/gigs/orders/buyers', { params: { seller_user_id: userId } }),
        ]);
        if (cancelled) return;
        const rawOrders = Array.isArray(ordersRes?.data?.orders) ? ordersRes.data.orders : [];
        setLiveRows(rawOrders.map(mapLiveOrderRow));
        setStatsLive(statsRes?.data?.stats || null);
        const bm = {};
        (Array.isArray(buyerRes?.data?.buyers) ? buyerRes.data.buyers : []).forEach((b) => {
          const uid = String(b.buyer_user_id || '').trim();
          if (uid) bm[uid] = b;
        });
        setBuyerEnrichMap(bm);
      } catch {
        if (!cancelled) {
          setLiveRows([]);
          setStatsLive(null);
          setBuyerEnrichMap({});
        }
      } finally {
        if (!cancelled) setLoadingOrders(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const rows = useMemo(() => {
    const base = userId && liveRows !== null
      ? liveRows
      : !userId
        ? ordersRows.map((r) => ({ ...r, mongoId: String(r.orderId || r.id || ''), buyerUid: '' }))
        : [];
    return activeTab === 'All Orders' ? base : base.filter((row) => row.status === activeTab);
  }, [activeTab, liveRows, userId]);

  const summary = useMemo(() => {
    if (statsLive) {
      return {
        total: statsLive.total_orders ?? 0,
        pending: statsLive.pending_orders ?? 0,
        completed: statsLive.completed_orders ?? 0,
        revenue: `$${Number(statsLive.total_revenue ?? 0).toFixed(0)}`,
      };
    }
    if (userId) return { total: 0, pending: 0, completed: 0, revenue: '$0' };
    const pendingFallback = ordersRows.filter((r) => r.status === 'Pending').length;
    return {
      total: ordersRows.length,
      pending: pendingFallback,
      completed: ordersRows.filter((r) => r.status === 'Completed').length,
      revenue: '$650',
    };
  }, [statsLive, userId]);

  const buyerRows = useMemo(
    () => buildBuyerRows(rows, buyerEnrichMap, buyerFallback),
    [rows, buyerEnrichMap],
  );

  useEffect(() => {
    const oid = String(spotlightOrderId || '').trim();
    if (!oid || !rows.some((r) => r.mongoId === oid)) return undefined;
    const t = window.setTimeout(() => {
      rowRefs.current[oid]?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
      onConsumedSpotlight?.();
    }, 120);
    return () => window.clearTimeout(t);
  }, [spotlightOrderId, rows, onConsumedSpotlight]);

  const emptyOrders = !loadingOrders && !rows.length;

  return (
    <section className="gigs-main-stack">
      <div className="gigs-card orders-card">
        <GigsHubSectionHeader
          title="Orders"
          subtitle={!userId ? 'Sign in as a seller to load live orders.' : 'Orders where you are the gig seller.'}
          onBack={onBack}
          className="orders-head"
        />

        <div className="orders-summary-grid">
          <div className="orders-summary-card blue">
            <span className="orders-summary-icon"><FiBarChart2 size={14} /></span>
            <h4>{summary.total}</h4>
            <p>Total Orders</p>
          </div>
          <div className="orders-summary-card amber">
            <span className="orders-summary-icon"><FiClock size={14} /></span>
            <h4>{summary.pending}</h4>
            <p>Pending</p>
          </div>
          <div className="orders-summary-card green">
            <span className="orders-summary-icon"><FiCheckCircle size={14} /></span>
            <h4>{summary.completed}</h4>
            <p>Completed</p>
          </div>
          <div className="orders-summary-card violet">
            <span className="orders-summary-icon"><FiDollarSign size={14} /></span>
            <h4>{summary.revenue}</h4>
            <p>Revenue (seller)</p>
          </div>
        </div>

        <div className="orders-tabs">
          {ordersTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`orders-tab${activeTab === tab ? ' is-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="orders-table-wrap orders-table-wrap--desktop">
          <div className="orders-table-head">
            <span>Order ID</span><span>Gig</span><span>Buyer</span><span>Status</span><span>Amount</span><span>Date</span>
          </div>
          {rows.map((row) => (
            <div
              key={row.id}
              ref={(el) => { rowRefs.current[row.mongoId] = el; }}
              className={`orders-table-row${spotlightOrderId && row.mongoId === spotlightOrderId ? ' is-spotlight' : ''}`}
            >
              <span className="orders-id">{row.orderId}</span>
              <span>{row.gig}</span>
              <span>{row.buyer}</span>
              <span><em className={`orders-status ${row.statusClass}`}>{row.status}</em></span>
              <span>{row.amount}</span>
              <span>{row.date}</span>
            </div>
          ))}
          {loadingOrders ? <p className="orders-empty-panel">Loading orders…</p> : null}
          {emptyOrders ? <p className="orders-empty-panel">No orders in this view yet.</p> : null}
        </div>

        <div className="orders-mobile-stack" aria-label="Orders">
          {loadingOrders ? (
            <p className="orders-empty-panel">Loading orders…</p>
          ) : emptyOrders ? (
            <p className="orders-empty-panel">No orders in this view yet.</p>
          ) : (
            rows.map((row) => (
              <OrdersOrderMobileCard
                key={`m-${row.id}`}
                row={row}
                spotlight={Boolean(spotlightOrderId && row.mongoId === spotlightOrderId)}
              />
            ))
          )}
        </div>

        <div className="orders-detail-head">
          <h3>Buyer Details</h3>
          <p>Buyer info from gig orders API</p>
        </div>

        <div className="orders-table-wrap orders-buyer-table orders-table-wrap--desktop">
          <div className="orders-table-head orders-buyer-head">
            <span>Buyer</span><span>Buyer ID</span><span>Region</span><span>Verification</span>
            <span>Trust Score</span><span>Total Orders</span><span>Total Spent</span>
          </div>
          {buyerRows.map((buyer) => (
            <div key={`${buyer.orderId}-${buyer.buyer}`} className="orders-table-row orders-buyer-row">
              <span className="orders-id">{buyer.buyer}</span>
              <span>{buyer.buyerCode}</span><span>{buyer.region}</span><span>{buyer.verification}</span>
              <span>{buyer.trustScore}</span><span>{buyer.totalOrders}</span><span>{buyer.totalSpent}</span>
            </div>
          ))}
        </div>

        <div className="orders-mobile-stack orders-mobile-stack--buyers" aria-label="Buyer details">
          {!buyerRows.length ? (
            <p className="orders-empty-panel">No buyer details for this view yet.</p>
          ) : (
            buyerRows.map((buyer) => (
              <OrdersBuyerMobileCard key={`mb-${buyer.orderId}-${buyer.buyer}`} buyer={buyer} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default OrdersContent;
