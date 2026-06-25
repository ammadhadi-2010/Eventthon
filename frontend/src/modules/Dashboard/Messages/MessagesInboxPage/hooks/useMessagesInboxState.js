import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { demoCounts, demoMessages } from '../../data/demoMessages';
import useUnifiedInbox from '../../hooks/useUnifiedInbox';
import { filterMessages } from '../../utils/messagesFormat';
import { getMessagesSenderId } from '../../utils/messagesSession';
import { readStoredUserStub } from '../../../../../utils/storedUser';
export default function useMessagesInboxState({
  companyMode = false,
  companyInbox = null,
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [draftConversations, setDraftConversations] = useState([]);
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);
  const [newMsgOpen, setNewMsgOpen] = useState(false);
  const [newMsgQuery, setNewMsgQuery] = useState('');
  const [rowPatches, setRowPatches] = useState({});
  const [hiddenIds, setHiddenIds] = useState([]);
  const [gigsSurfaceNotice, setGigsSurfaceNotice] = useState('');
  const [threadOutbox, setThreadOutbox] = useState([]);
  const [removedMessageIds, setRemovedMessageIds] = useState([]);
  const inboxSearchInputRef = useRef(null);

  const userId = useMemo(() => getMessagesSenderId(readStoredUserStub()), []);
  const memberInbox = useUnifiedInbox(companyMode ? '__disabled__' : userId);
  const { loading, refreshing, errorText, messages, counts, loadInbox } =
    companyMode && companyInbox ? companyInbox : memberInbox;

  const usingDemo = !companyMode && messages.length === 0;
  const sourceRows = useMemo(() => {
    const normalizedDemo = usingDemo
      ? demoMessages.map((row) => ({
          ...row,
          seller_user_id: userId || row.seller_user_id || '',
        }))
      : [];
    const base = usingDemo
      ? [...draftConversations, ...normalizedDemo]
      : [...threadOutbox, ...draftConversations, ...messages];
    return base
      .filter((row) => !hiddenIds.includes(row._id))
      .filter((row) => !removedMessageIds.includes(row._id))
      .map((row) => ({ ...row, ...(rowPatches[row._id] || {}) }));
  }, [usingDemo, draftConversations, messages, threadOutbox, removedMessageIds, hiddenIds, rowPatches, userId]);

  const displayRows = useMemo(
    () => filterMessages(sourceRows, activeFilter, query),
    [sourceRows, activeFilter, query],
  );
  const displayCounts = usingDemo ? demoCounts : counts;
  const visibleRows = displayRows;

  const recipientRows = useMemo(() => {
    const seen = new Set();
    const queryText = newMsgQuery.trim().toLowerCase();
    const rows = [];
    sourceRows.forEach((row) => {
      const sid = String(row.seller_user_id || '').trim();
      if (!sid || seen.has(sid)) return;
      const hay = `${row.from_user_id || ''} ${row.context_title || ''} ${sid}`.toLowerCase();
      if (queryText && !hay.includes(queryText)) return;
      seen.add(sid);
      rows.push(row);
    });
    return rows;
  }, [sourceRows, newMsgQuery]);

  const selectedRow = useMemo(
    () => visibleRows.find((row) => row._id === selectedId) || null,
    [visibleRows, selectedId],
  );

  const removeDraftById = useCallback((id) => {
    setDraftConversations((prev) => prev.filter((row) => row._id !== id));
  }, []);

  const handleSelectConversation = useCallback((nextId, currentSelected) => {
    if (currentSelected?._isDraft && currentSelected?._id !== nextId) {
      removeDraftById(currentSelected._id);
    }
    setSelectedId(nextId);
  }, [removeDraftById]);

  useEffect(() => {
    if (!gigsSurfaceNotice) return undefined;
    const t = window.setTimeout(() => setGigsSurfaceNotice(''), 3200);
    return () => window.clearTimeout(t);
  }, [gigsSurfaceNotice]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    if (!desktop.matches || selectedId || !visibleRows[0]) return;
    setSelectedId(visibleRows[0]._id);
  }, [visibleRows, selectedId]);

  return {
    companyMode,
    userId,
    loading,
    refreshing,
    errorText,
    loadInbox,
    activeFilter,
    setActiveFilter,
    query,
    setQuery,
    selectedId,
    setSelectedId,
    selectedRow,
    draftConversations,
    setDraftConversations,
    sendError,
    setSendError,
    sending,
    setSending,
    newMsgOpen,
    setNewMsgOpen,
    newMsgQuery,
    setNewMsgQuery,
    rowPatches,
    setRowPatches,
    hiddenIds,
    setHiddenIds,
    gigsSurfaceNotice,
    setGigsSurfaceNotice,
    threadOutbox,
    setThreadOutbox,
    removedMessageIds,
    setRemovedMessageIds,
    inboxSearchInputRef,
    sourceRows,
    visibleRows,
    displayCounts,
    recipientRows,
    removeDraftById,
    handleSelectConversation,
  };
}
