import { useCallback, useEffect, useState } from 'react';
import API from '../../../../api/axiosConfig';

const EMPTY_COUNTS = { candidate: 0, admin_support: 0 };

function resolveEmployerId() {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('userEmail') ||
    localStorage.getItem('userMobile') ||
    localStorage.getItem('user_id') ||
    ''
  );
}

export function useCompanyInbox(channel = 'all') {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [messages, setMessages] = useState([]);
  const [threadMessages, setThreadMessages] = useState([]);
  const [counts, setCounts] = useState(EMPTY_COUNTS);

  const loadInbox = useCallback(
    async (isRefresh = false) => {
      const employerId = resolveEmployerId();
      if (!employerId) {
        setErrorText('Sign in again to open company messages.');
        setLoading(false);
        return;
      }
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setErrorText('');
      try {
        const res = await API.get('/api/messages/company-inbox', {
          params: { employer_user_id: employerId, channel, limit: 100, skip: 0 },
          timeout: 15000,
        });
        const body = res?.data || {};
        setMessages(Array.isArray(body.messages) ? body.messages : []);
        setThreadMessages(Array.isArray(body.thread_messages) ? body.thread_messages : []);
        setCounts(body.counts_by_channel || EMPTY_COUNTS);
      } catch (error) {
        setMessages([]);
        setThreadMessages([]);
        setCounts(EMPTY_COUNTS);
        setErrorText(error?.response?.data?.detail || error?.message || 'Failed to load company inbox.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [channel],
  );

  useEffect(() => {
    loadInbox(false);
  }, [loadInbox]);

  return {
    loading,
    refreshing,
    errorText,
    messages,
    threadMessages,
    counts,
    loadInbox,
    employerId: resolveEmployerId(),
  };
}
