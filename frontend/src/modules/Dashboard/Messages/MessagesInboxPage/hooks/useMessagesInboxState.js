import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { demoCounts, demoMessages } from '../../data/demoMessages';
import useUnifiedInbox from '../../hooks/useUnifiedInbox';
import { filterMessages } from '../../utils/messagesFormat';
import { getMessagesSenderId } from '../../utils/messagesSession';
import { readStoredUserStub } from '../../../../../utils/storedUser';
import { fetchCompanyTeam } from '../../../../../components/views/company/services/companyTeamApi';
import { isSelfConversation, teamMemberToRecipient } from '../utils/inboxHelpers';

export default function useMessagesInboxState({
  companyMode = false,
  squadMode = false,
  companyInbox = null,
}) {
  const powerMode = companyMode || squadMode;
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [companyFilters, setCompanyFilters] = useState({
    skills: '',
    date: '',
    stage: '',
    labels: [],
  });
  const [selectedId, setSelectedId] = useState('');
  const [draftConversations, setDraftConversations] = useState([]);
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);
  const [newMsgOpen, setNewMsgOpen] = useState(false);
  const [newMsgQuery, setNewMsgQuery] = useState('');
  const [teamRecipients, setTeamRecipients] = useState([]);
  const [teamRecipientsLoading, setTeamRecipientsLoading] = useState(false);
  const [rowPatches, setRowPatches] = useState({});
  const [hiddenIds, setHiddenIds] = useState([]);
  const [gigsSurfaceNotice, setGigsSurfaceNotice] = useState('');
  const [threadOutbox, setThreadOutbox] = useState([]);
  const [removedMessageIds, setRemovedMessageIds] = useState([]);
  const inboxSearchInputRef = useRef(null);

  const userId = useMemo(() => getMessagesSenderId(readStoredUserStub()), []);
  const memberInbox = useUnifiedInbox(powerMode ? '__disabled__' : userId);
  const { loading, refreshing, errorText, messages, counts, loadInbox, threadMessages } =
    powerMode && companyInbox
      ? companyInbox
      : { ...memberInbox, threadMessages: memberInbox.threadMessages };

  const usingDemo = !powerMode && messages.length === 0;
  const sourceRows = useMemo(() => {
    const normalizedDemo = usingDemo
      ? demoMessages.map((row) => ({
          ...row,
          seller_user_id: userId || row.seller_user_id || '',
        }))
      : [];
    const backendRows = usingDemo ? normalizedDemo : messages;
    // Public + company: never list "my own" outbound/self threads
    const filteredBackend = backendRows.filter((row) => !isSelfConversation(row, userId));

    const backendPeerKeys = new Set(
      filteredBackend.map((row) =>
        String(row.peer_user_id || row.candidate_user_id || row.from_user_id || '')
          .trim()
          .toLowerCase(),
      ),
    );
    const drafts = draftConversations.filter((row) => {
      if (isSelfConversation(row, userId)) return false;
      const peer = String(row.peer_user_id || row.candidate_user_id || row.from_user_id || '')
        .trim()
        .toLowerCase();
      if (peer && backendPeerKeys.has(peer)) return false;
      return true;
    });

    const base = [...drafts, ...filteredBackend];
    return base
      .filter((row) => !hiddenIds.includes(row._id))
      .filter((row) => !removedMessageIds.includes(row._id))
      .map((row) => ({ ...row, ...(rowPatches[row._id] || {}) }));
  }, [usingDemo, draftConversations, messages, removedMessageIds, hiddenIds, rowPatches, userId]);

  // Full message history for center chat (grouped sidebar uses `messages` only)
  const chatRows = useMemo(() => {
    const flat = Array.isArray(threadMessages) ? threadMessages : [];
    const history = flat.length ? flat : sourceRows;
    const base = [...threadOutbox, ...history];
    return base
      .filter((row) => !removedMessageIds.includes(row._id))
      .map((row) => ({ ...row, ...(rowPatches[row._id] || {}) }));
  }, [threadOutbox, threadMessages, sourceRows, removedMessageIds, rowPatches]);

  const displayRows = useMemo(
    () => filterMessages(sourceRows, activeFilter, query, companyMode ? companyFilters : null),
    [sourceRows, activeFilter, query, companyMode, companyFilters],
  );
  const displayCounts = usingDemo ? demoCounts : counts;
  const visibleRows = displayRows;

  const recipientRows = useMemo(() => {
    const seen = new Set();
    const queryText = newMsgQuery.trim().toLowerCase();
    const rows = [];
    const selfId = String(userId || '').trim().toLowerCase();

    const pushRow = (row) => {
      const peerId = String(row.peer_user_id || row.from_user_id || row.seller_user_id || '').trim();
      const peerKey = peerId.toLowerCase();
      if (!peerId || seen.has(peerKey)) return;
      if (selfId && peerKey === selfId) return;
      const peerName = String(row.peer_user_name || row.from_user_name || '').trim();
      const hay = `${peerId} ${peerName} ${row.context_title || ''} ${row.seller_user_id || ''} ${row.chat_tag || ''}`.toLowerCase();
      if (queryText && !hay.includes(queryText)) return;
      seen.add(peerKey);
      rows.push({
        ...row,
        peer_user_id: peerId,
        peer_user_name: peerName || peerId,
      });
    };

    // Company: prefer attached team members for new chats
    if (companyMode) {
      teamRecipients.forEach(pushRow);
    }

    // Squad / company: roster rows already in inbox
    sourceRows.forEach((row) => {
      pushRow({
        ...row,
        peer_user_id: String(
          row.peer_user_id || row.candidate_user_id || row.from_user_id || row.seller_user_id || '',
        ).trim(),
        peer_user_name: String(row.peer_user_name || row.from_user_name || '').trim(),
      });
    });

    return rows;
  }, [sourceRows, newMsgQuery, userId, companyMode, teamRecipients]);

  useEffect(() => {
    if (!companyMode || !newMsgOpen) return undefined;
    let alive = true;
    setTeamRecipientsLoading(true);
    fetchCompanyTeam()
      .then((data) => {
        if (!alive) return;
        const employerId = getMessagesSenderId(readStoredUserStub()) || userId || '';
        const members = Array.isArray(data?.activeMembers) ? data.activeMembers : [];
        const mapped = members
          .map((m) => teamMemberToRecipient(m, employerId))
          .filter(Boolean);
        setTeamRecipients(mapped);
      })
      .catch(() => {
        if (alive) setTeamRecipients([]);
      })
      .finally(() => {
        if (alive) setTeamRecipientsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [companyMode, newMsgOpen, userId]);

  const selectedRow = useMemo(() => {
    if (!selectedId) return null;
    return (
      visibleRows.find((row) => row._id === selectedId) ||
      sourceRows.find((row) => row._id === selectedId) ||
      draftConversations.find((row) => row._id === selectedId) ||
      null
    );
  }, [visibleRows, sourceRows, draftConversations, selectedId]);

  // Mobile: orphan selection (filtered/missing row) should not trap empty chat
  useEffect(() => {
    if (loading || !selectedId || selectedRow) return;
    const desktop = window.matchMedia('(min-width: 1024px)');
    if (desktop.matches) return;
    setSelectedId('');
  }, [loading, selectedId, selectedRow]);

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
    squadMode,
    powerMode,
    userId,
    loading,
    refreshing,
    errorText,
    loadInbox,
    activeFilter,
    setActiveFilter,
    query,
    setQuery,
    companyFilters,
    setCompanyFilters,
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
    teamRecipientsLoading,
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
    chatRows,
    visibleRows,
    displayCounts,
    recipientRows,
    removeDraftById,
    handleSelectConversation,
  };
}
