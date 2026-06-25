import { useCallback, useEffect, useState } from 'react';
import API from '../../../api/axiosConfig';

export default function useAdminNotifCount() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await API.get('/api/admin/notifications/stats', { timeout: 8000 });
      setCount(Number(res?.data?.data?.unread ?? res?.data?.unread ?? 0));
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('et:admin-alerts-changed', onChange);
    return () => window.removeEventListener('et:admin-alerts-changed', onChange);
  }, [refresh]);

  return count;
}
