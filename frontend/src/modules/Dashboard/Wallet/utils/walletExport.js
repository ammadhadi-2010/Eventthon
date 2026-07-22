import { formatThonAmount, formatTxDate } from './walletFormatters';
import { statusLabel } from './walletTransactionMapper';

function escapeCsv(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function exportTransactionsCsv(rows, filename = 'eventthon-transactions.csv') {
  const header = ['Date', 'Title', 'Description', 'Status', 'Amount (Thon)'];
  const lines = rows.map((tx) => [
    formatTxDate(tx.at),
    tx.title,
    tx.subtitle,
    statusLabel(tx),
    tx.amount,
  ].map(escapeCsv).join(','));
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename);
}

export function exportTransactionsPdf(rows, filename = 'eventthon-transactions.pdf') {
  const htmlRows = rows.map((tx) => `
    <tr>
      <td>${formatTxDate(tx.at)}</td>
      <td>${tx.title}</td>
      <td>${tx.subtitle || ''}</td>
      <td>${statusLabel(tx)}</td>
      <td>${formatThonAmount(tx.amount, { signed: true })}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html><html><head><title>EventThon Transactions</title>
    <style>
      body{font-family:Arial,sans-serif;padding:24px;color:#111}
      h1{font-size:20px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #ddd;padding:8px;text-align:left}
      th{background:#f3f4f6}
    </style></head><body>
    <h1>EventThon Wallet — All Transactions</h1>
    <table><thead><tr><th>Date</th><th>Title</th><th>Description</th><th>Status</th><th>Amount</th></tr></thead>
    <tbody>${htmlRows}</tbody></table></body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  triggerDownload(blob, filename.replace(/\.pdf$/i, '.html'));
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
