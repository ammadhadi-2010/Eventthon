import React from 'react';
import CopyButton from './CopyButton';

export default function CodeSnippetBox({ code, title }) {
  return (
    <div className="fp-snippet" style={{ marginBottom: 14 }}>
      {title ? <p style={{ margin: '0 0 8px', fontSize: 12, color: '#94a3b8' }}>{title}</p> : null}
      <CopyButton text={code} />
      <pre>{code}</pre>
    </div>
  );
}
