import React, { useCallback, useState } from 'react';

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [text]);

  return (
    <button type="button" className="fp-copy-btn" onClick={onCopy}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
