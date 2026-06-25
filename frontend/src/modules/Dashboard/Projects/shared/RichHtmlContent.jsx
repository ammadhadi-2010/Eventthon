import React, { useMemo } from 'react';
import '../styles/project-detail-view.css';

function sanitizeHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

export default function RichHtmlContent({ html, className = '', emptyLabel = 'No detailed description yet.' }) {
  const safe = useMemo(() => sanitizeHtml(html), [html]);
  const isEmpty = !safe.replace(/<[^>]+>/g, '').trim();

  if (isEmpty) {
    return <p className={`pdv-rich-empty ${className}`.trim()}>{emptyLabel}</p>;
  }

  return (
    <div
      className={`pdv-rich-html ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
