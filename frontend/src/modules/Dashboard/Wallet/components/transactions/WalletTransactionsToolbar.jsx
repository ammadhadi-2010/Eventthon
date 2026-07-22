import React from 'react';
import { FiDownload, FiFileText, FiSearch } from 'react-icons/fi';
import { TX_STATUS_OPTIONS, TX_TYPE_TABS } from '../../data/walletSubpagesData';
import { exportTransactionsCsv, exportTransactionsPdf } from '../../utils/walletExport';

export default function WalletTransactionsToolbar({
  query, setQuery,
  typeTab, setTypeTab,
  statusFilter, setStatusFilter,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  rows,
}) {
  return (
    <section className="wallet-card wallet-sub-toolbar">
      <div className="wallet-sub-toolbar__row">
        <label className="wallet-search">
          <FiSearch size={16} aria-hidden />
          <input
            type="search"
            placeholder="Search transactions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="wallet-export-btns">
          <button type="button" className="wallet-btn wallet-btn--outline" onClick={() => exportTransactionsCsv(rows)}>
            <FiDownload size={14} /> CSV
          </button>
          <button type="button" className="wallet-btn wallet-btn--outline" onClick={() => exportTransactionsPdf(rows)}>
            <FiFileText size={14} /> PDF
          </button>
        </div>
      </div>

      <div className="wallet-tx-tabs wallet-tx-tabs--wide" role="tablist">
        {TX_TYPE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={typeTab === tab.id}
            className={`wallet-tx-tab${typeTab === tab.id ? ' is-active' : ''}`}
            onClick={() => setTypeTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="wallet-sub-filters">
        <label>
          <span>From</span>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </label>
        <label>
          <span>To</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </label>
        <label>
          <span>Status</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {TX_STATUS_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
