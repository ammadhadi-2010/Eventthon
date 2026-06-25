import { useCallback, useState } from 'react';

export default function useCopyPublicLink() {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(async (path) => {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  return { copied, copyLink };
}
