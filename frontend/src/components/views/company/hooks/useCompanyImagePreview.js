import { useEffect, useState } from 'react';
import { resolvePortalImageurl } from '../utils/portalImage';

export default function useCompanyImagePreview(fileOrNull, savedUrl) {
  const [objectUrl, setObjectUrl] = useState('');

  useEffect(() => {
    if (!(fileOrNull instanceof File)) {
      setObjectUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(fileOrNull);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [fileOrNull]);

  if (fileOrNull instanceof File) return objectUrl;
  const raw = String(savedUrl || '').trim();
  if (!raw) return '';
  return resolvePortalImageurl(savedUrl);
}
