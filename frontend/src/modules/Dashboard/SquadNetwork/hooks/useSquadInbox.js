import { useCallback, useEffect, useState } from 'react';
import API from '../../../../api/axiosConfig';
import { getMessagesSenderId } from '../../Messages/utils/messagesSession';
import { readStoredUserStub } from '../../../../utils/storedUser';

const EMPTY_COUNTS = { squad_member: 0 };

function resolveViewerId() {
  return (
    getMessagesSenderId(readStoredUserStub()) ||
    localStorage.getItem('userEmail') ||
    localStorage.getItem('userMobile') ||
    localStorage.getItem('user_id') ||
    localStorage.getItem('userId') ||
    ''
  );
}

/** FastAPI detail can be string | {msg} | [{type,loc,msg,input,ctx}, ...] */
function formatApiDetail(detail, fallback = 'Request failed.') {
  if (detail == null || detail === '') return fallback;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') return item.msg || item.message || '';
        return '';
      })
      .filter(Boolean);
    return parts.length ? parts.join(' · ') : fallback;
  }
  if (typeof detail === 'object') {
    return detail.msg || detail.message || detail.detail || fallback;
  }
  return String(detail);
}

export default function useSquadInbox(squadId) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [messages, setMessages] = useState([]);
  const [threadMessages, setThreadMessages] = useState([]);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [squadName, setSquadName] = useState('');

  const loadInbox = useCallback(
    async (isRefresh = false) => {
      const viewer = resolveViewerId();
      const sid = String(squadId || '').trim();
      if (!sid || !viewer) {
        setErrorText(!viewer ? 'Sign in again to open squad chat.' : '');
        setLoading(false);
        setMessages([]);
        setThreadMessages([]);
        return;
      }
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setErrorText('');
      try {
        const res = await API.get('/api/messages/squad-inbox', {
          params: {
            squad_id: sid,
            viewer_user_id: viewer,
            limit: 100,
            skip: 0,
          },
          timeout: 15000,
        });
        const body = res?.data || {};
        setMessages(Array.isArray(body.messages) ? body.messages : []);
        setThreadMessages(Array.isArray(body.thread_messages) ? body.thread_messages : []);
        setCounts(body.counts_by_channel || EMPTY_COUNTS);
        setSquadName(body.squad_name || '');
      } catch (error) {
        setMessages([]);
        setThreadMessages([]);
        setCounts(EMPTY_COUNTS);
        setErrorText(
          formatApiDetail(
            error?.response?.data?.detail,
            error?.message || 'Failed to load squad inbox.',
          ),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [squadId],
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
    squadName,
    viewerId: resolveViewerId(),
  };
}
