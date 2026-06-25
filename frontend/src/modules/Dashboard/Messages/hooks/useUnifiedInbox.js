import { useCallback, useEffect, useState } from 'react';
import { fetchUnifiedInbox } from '../services/chatApi';

const EMPTY_COUNTS = { gig: 0, job: 0, project: 0 };

const normalizeSellerId = (raw) => {
  const value = String(raw || '').trim();
  if (!value) return '';
  const lowered = value.toLowerCase();
  if (lowered === 'undefined' || lowered === 'null' || lowered === '[object object]') return '';
  return value;
};

const parseErrorDetail = (detail) => {
  if (!detail) return '';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => (typeof item === 'string' ? item : item?.msg || ''))
      .filter(Boolean)
      .join('; ');
  }
  if (typeof detail === 'object' && detail?.msg) return String(detail.msg);
  return detail ? String(detail) : '';
};

const useUnifiedInbox = (sellerUserId) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [messages, setMessages] = useState([]);
  const [counts, setCounts] = useState(EMPTY_COUNTS);

  const loadInbox = useCallback(
    async (isRefresh = false) => {
      const sellerId = normalizeSellerId(sellerUserId);
      if (!sellerId || sellerId === '__disabled__') {
        setErrorText('Inbox needs a valid user id. Please log in again.');
        setLoading(false);
        setRefreshing(false);
        setMessages([]);
        setCounts(EMPTY_COUNTS);
        return;
      }
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setErrorText('');
      try {
        const body = await fetchUnifiedInbox(sellerId);
        setMessages(Array.isArray(body.messages) ? body.messages : []);
        setCounts(body.counts_by_type || EMPTY_COUNTS);
      } catch (error) {
        const detail = parseErrorDetail(error?.response?.data?.detail);
        setErrorText(detail || error?.message || 'Failed to load inbox.');
        setMessages([]);
        setCounts(EMPTY_COUNTS);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [sellerUserId],
  );

  useEffect(() => {
    loadInbox(false);
  }, [loadInbox]);

  return { loading, refreshing, errorText, messages, counts, loadInbox };
};

export default useUnifiedInbox;
