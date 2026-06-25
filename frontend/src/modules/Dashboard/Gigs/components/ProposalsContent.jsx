import React, { useEffect, useMemo, useState } from 'react';
import API from '../../../../api/axiosConfig';
import { getGigsActorId, getGigsSessionHeaders } from '../utils/gigsSession';
import ProposalsMobileCard from './ProposalsMobileCard';
import { GigsHubSectionHeader } from './GigsHubBackButton';
import '../styles/GigsProposals.css';
import '../styles/gigs-proposals-mobile.css';

const tabs = ['All Proposals', 'Pending', 'Accepted', 'Rejected'];

const isMongoProposalId = (id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);

const ProposalsContent = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('All Proposals');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewRow, setViewRow] = useState(null);

  const userId = useMemo(() => getGigsActorId(), []);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    const run = async () => {
      setLoading(true);
      try {
        const tabStatus = activeTab === 'All Proposals' ? '' : activeTab;
        const res = await API.get('/api/gigs/actions/proposals', {
          headers: getGigsSessionHeaders(),
          params: {
            seller_user_id: userId,
            status: tabStatus,
          },
        });
        if (!alive) return;
        const apiRows = Array.isArray(res?.data?.proposals) ? res.data.proposals : [];
        setRows(apiRows.map((row) => ({
          id: row._id,
          job: row.job_title || 'Job',
          client: row.client_name || 'Client',
          bidAmount: row.bid_amount || '--',
          status: row.status || 'Pending',
          date: row.date_label || '--',
          createdAt: row.created_at || '',
        })));
      } catch {
        if (!alive) return;
        setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [userId, activeTab]);

  useEffect(() => {
    if (!viewRow) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') setViewRow(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewRow]);

  const visibleRows = useMemo(() => (
    activeTab === 'All Proposals'
      ? rows
      : rows.filter((row) => row.status === activeTab)
  ), [activeTab, rows]);

  const handleStatusUpdate = async (row, nextStatus) => {
    if (!row?.id || !nextStatus) return;
    const prevRows = rows;
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: nextStatus } : item)));
    if (!isMongoProposalId(row.id)) return;
    try {
      await API.patch(`/api/gigs/actions/proposals/${row.id}/status`, {
        seller_user_id: userId,
        status: nextStatus,
      }, { headers: getGigsSessionHeaders() });
    } catch {
      setRows(prevRows);
    }
  };

  const handleDelete = async (row) => {
    if (!row?.id) return;
    if (!window.confirm('Remove this proposal from your list? This cannot be undone.')) return;
    const prevRows = rows;
    setRows((prev) => prev.filter((item) => item.id !== row.id));
    if (!isMongoProposalId(row.id)) return;
    try {
      await API.delete(`/api/gigs/actions/proposals/${row.id}`, {
        headers: getGigsSessionHeaders(),
        params: { seller_user_id: userId },
      });
    } catch {
      setRows(prevRows);
    }
  };

  const submittedLabel = (row) => {
    if (row?.createdAt) {
      try {
        return new Date(row.createdAt).toLocaleString();
      } catch {
        return row.date || '--';
      }
    }
    return row?.date || '--';
  };

  return (
    <section className="gigs-card proposals-shell">
      <GigsHubSectionHeader
        title="Proposals"
        subtitle="Track proposals you've submitted."
        onBack={onBack}
        className="proposals-head"
      />

      <div className="proposals-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? 'is-active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="proposals-table proposals-table--desktop">
        <div className="proposals-row proposals-row-head">
          <span>Job</span>
          <span>Client</span>
          <span>Bid Amount</span>
          <span>Status</span>
          <span>Date</span>
        </div>

        {loading ? (
          <div className="proposals-row">
            <span>Loading proposals...</span>
          </div>
        ) : visibleRows.map((row) => (
          <div key={row.id} className="proposals-row">
            <span className="is-job">{row.job}</span>
            <span>{row.client}</span>
            <span>{row.bidAmount}</span>
            <span>
              <em className={`proposal-status is-${row.status.toLowerCase()}`}>{row.status}</em>
              <div className="proposal-actions">
                <button type="button" className="is-view" onClick={() => setViewRow(row)}>View</button>
                <button type="button" className="is-accept" onClick={() => handleStatusUpdate(row, 'Accepted')} disabled={row.status === 'Accepted'}>Accept</button>
                <button type="button" className="is-reject" onClick={() => handleStatusUpdate(row, 'Rejected')} disabled={row.status === 'Rejected'}>Reject</button>
                <button type="button" className="is-delete" onClick={() => handleDelete(row)}>Delete</button>
              </div>
            </span>
            <span>{row.date}</span>
          </div>
        ))}
      </div>

      <div className="proposals-mobile-list" aria-label="Proposals">
        {loading ? (
          <p className="prop-m-empty">Loading proposals…</p>
        ) : visibleRows.length === 0 ? (
          <p className="prop-m-empty">No proposals in this filter.</p>
        ) : (
          visibleRows.map((row) => (
            <ProposalsMobileCard
              key={`m-${row.id}`}
              row={row}
              onView={setViewRow}
              onAccept={(item) => handleStatusUpdate(item, 'Accepted')}
              onReject={(item) => handleStatusUpdate(item, 'Rejected')}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {viewRow ? (
        <div className="proposals-modal-backdrop" role="presentation" onClick={() => setViewRow(null)}>
          <div className="proposals-modal" role="dialog" aria-modal="true" aria-labelledby="proposal-view-title" onClick={(e) => e.stopPropagation()}>
            <h3 id="proposal-view-title">Proposal details</h3>
            <dl className="proposals-modal-dl">
              <div><dt>Job</dt><dd>{viewRow.job}</dd></div>
              <div><dt>Client</dt><dd>{viewRow.client}</dd></div>
              <div><dt>Bid amount</dt><dd>{viewRow.bidAmount}</dd></div>
              <div><dt>Status</dt><dd>{viewRow.status}</dd></div>
              <div><dt>Submitted</dt><dd>{submittedLabel(viewRow)}</dd></div>
            </dl>
            <div className="proposals-modal-actions">
              <button type="button" onClick={() => setViewRow(null)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ProposalsContent;
