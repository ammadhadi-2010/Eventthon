import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeadphones, FiMessageSquare } from 'react-icons/fi';

export default function FooterCtaAside({ variant }) {
  const helpTo = variant === 'company' ? '/company/contact' : '/resources/help';

  return (
    <div className="fp-card">
      <h3 style={{ margin: '0 0 8px', fontSize: 15, color: '#f8fafc' }}>Need assistance?</h3>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
        Our support team responds within one business day for all workspace accounts.
      </p>
      <Link
        to={helpTo}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          borderRadius: 10,
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        <FiHeadphones size={14} /> Contact Support
      </Link>
      <Link
        to="/messages"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 10,
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid rgba(148,163,184,0.25)',
          color: '#cbd5e1',
          fontSize: 12,
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        <FiMessageSquare size={14} /> Open Messages
      </Link>
    </div>
  );
}
