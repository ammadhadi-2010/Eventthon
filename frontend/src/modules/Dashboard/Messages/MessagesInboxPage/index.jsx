import React, { useEffect, useRef } from 'react';
import useMessagesInboxState from './hooks/useMessagesInboxState';
import useMessagesInboxActions from './hooks/useMessagesInboxActions';
import useMarketplaceChatIntents from './hooks/useMarketplaceChatIntents';
import MessagesInboxView from './MessagesInboxView';
import { isMongoId } from './utils/inboxHelpers';
import { refreshScrollHideRoots } from '../../../Admin/hooks/useScrollHideNavbar';
import '../styles/MessagesInbox.layout.css';
import '../styles/MessagesInbox.sidebar.css';
import '../styles/MessagesInbox.chat.css';
import '../styles/MessagesInbox.details.css';
import '../styles/messages-inbox-mobile.css';

const MessagesInboxPage = ({
  companyMode = false,
  squadMode = false,
  companyInbox = null,
  squad = null,
  onOpenSquadMembers,
  onMobileChatOpenChange,
}) => {
  const state = useMessagesInboxState({ companyMode, squadMode, companyInbox });
  const actions = useMessagesInboxActions(state);
  const powerMode = companyMode || squadMode;

  useMarketplaceChatIntents(actions.createDraftFromSource);

  useEffect(() => {
    onMobileChatOpenChange?.(Boolean(state.selectedId));
  }, [state.selectedId, onMobileChatOpenChange]);

  useEffect(() => {
    if (!powerMode) return undefined;
    const onCompanyBack = () => state.setSelectedId('');
    window.addEventListener('msgx:company-mobile-back', onCompanyBack);
    window.addEventListener('msgx:squad-mobile-back', onCompanyBack);
    return () => {
      window.removeEventListener('msgx:company-mobile-back', onCompanyBack);
      window.removeEventListener('msgx:squad-mobile-back', onCompanyBack);
    };
  }, [powerMode, state.setSelectedId]);

  useEffect(() => {
    if (!powerMode) return undefined;
    const onSelectPeer = (event) => {
      const peerId = String(event?.detail?.peerId || '').trim().toLowerCase();
      const contextId = String(event?.detail?.contextId || '').trim();
      if (!peerId) return;
      const match = (state.visibleRows || []).find((row) => {
        const rowPeer = String(row.candidate_user_id || row.peer_user_id || row.from_user_id || '')
          .trim()
          .toLowerCase();
        if (rowPeer !== peerId) return false;
        if (!contextId) return true;
        return String(row.context_id || '').trim() === contextId;
      });
      if (match?._id) state.setSelectedId(match._id);
    };
    window.addEventListener('msgx:select-peer', onSelectPeer);
    return () => window.removeEventListener('msgx:select-peer', onSelectPeer);
  }, [powerMode, state.visibleRows, state.setSelectedId]);

  useEffect(() => {
    refreshScrollHideRoots();
    const timer = window.setTimeout(refreshScrollHideRoots, 350);
    return () => window.clearTimeout(timer);
  }, [state.selectedId]);

  const markedReadRef = useRef(new Set());
  const chatRowsRef = useRef(state.chatRows);
  chatRowsRef.current = state.chatRows;

  useEffect(() => {
    const row = state.selectedRow;
    if (!row || row._isDraft) return;
    const chatType = String(row.chat_type || 'job').toLowerCase();
    if (!['gig', 'job', 'project'].includes(chatType)) return;

    const viewer = String(state.userId || '').trim().toLowerCase();
    const peerIds = new Set(
      [row.candidate_user_id, row.peer_user_id, row.from_user_id, row.seller_user_id]
        .map((v) => String(v || '').trim().toLowerCase())
        .filter(Boolean),
    );
    const ctxId = String(row.context_id || '').trim();

    // Mark unread peer messages once — do not re-run on every chatRows patch
    const targets = (chatRowsRef.current || []).filter((msg) => {
      if (!isMongoId(msg._id)) return false;
      if (markedReadRef.current.has(String(msg._id))) return false;
      if (String(msg.delivery_status || '').toLowerCase() === 'read') return false;
      const from = String(msg.from_user_id || '').trim().toLowerCase();
      if (!from || (viewer && from === viewer)) return false;
      const msgPeer = String(msg.candidate_user_id || msg.peer_user_id || '').trim().toLowerCase();
      const sameCtx = !ctxId || String(msg.context_id || '').trim() === ctxId;
      const touchesPeer = peerIds.has(from) || (msgPeer && peerIds.has(msgPeer));
      return sameCtx && touchesPeer;
    });

    targets.slice(0, 12).forEach((msg) => {
      markedReadRef.current.add(String(msg._id));
      actions.handleUpdateDeliveryStatus(msg._id, msg.chat_type || chatType, 'read').catch(() => {});
    });

    if (
      isMongoId(row._id) &&
      !markedReadRef.current.has(String(row._id)) &&
      String(row.delivery_status || '').toLowerCase() !== 'read'
    ) {
      markedReadRef.current.add(String(row._id));
      actions.handleUpdateDeliveryStatus(row._id, chatType, 'read').catch(() => {});
    }
  }, [state.selectedRow?._id, state.userId, actions.handleUpdateDeliveryStatus]);

  const handleSelectConversation = (nextId) => {
    state.handleSelectConversation(nextId, state.selectedRow);
  };

  const handleHiringStageChange = (stage) => {
    const rowId = state.selectedRow?._id;
    if (!rowId || !stage) return;
    state.setRowPatches((prev) => ({
      ...prev,
      [rowId]: { ...(prev[rowId] || {}), hiring_stage: stage },
    }));
  };

  const handleLabelsChange = (labels) => {
    const rowId = state.selectedRow?._id;
    if (!rowId) return;
    state.setRowPatches((prev) => ({
      ...prev,
      [rowId]: { ...(prev[rowId] || {}), labels },
    }));
  };

  return (
    <MessagesInboxView
      companyMode={companyMode}
      squadMode={squadMode}
      squad={squad}
      onOpenSquadMembers={onOpenSquadMembers}
      loading={state.loading}
      errorText={state.errorText}
      sendError={state.sendError}
      gigsSurfaceNotice={state.gigsSurfaceNotice}
      displayCounts={state.displayCounts}
      visibleRows={state.visibleRows}
      sourceRows={state.sourceRows}
      chatRows={state.chatRows}
      query={state.query}
      activeFilter={state.activeFilter}
      companyFilters={state.companyFilters}
      setCompanyFilters={state.setCompanyFilters}
      selectedId={state.selectedId}
      selectedRow={state.selectedRow}
      refreshing={state.refreshing}
      newMsgOpen={state.newMsgOpen}
      newMsgQuery={state.newMsgQuery}
      recipientRows={state.recipientRows}
      teamRecipientsLoading={state.teamRecipientsLoading}
      sending={state.sending}
      userId={state.userId}
      inboxSearchInputRef={state.inboxSearchInputRef}
      setQuery={state.setQuery}
      setActiveFilter={state.setActiveFilter}
      onSelectConversation={handleSelectConversation}
      onMobileBack={() => state.setSelectedId('')}
      onMenuAction={actions.handleMenuAction}
      onRefresh={() => state.loadInbox(true)}
      onNewMessage={actions.handleNewMessage}
      onSendMessage={actions.handleSendMessage}
      onUpdateDeliveryStatus={actions.handleUpdateDeliveryStatus}
      onUploadAttachment={actions.handleUploadAttachment}
      onMessageAction={actions.handleMessageAction}
      onDeleteMessage={actions.handleDeleteMessage}
      onConversationPreference={actions.handleConversationPreference}
      onFetchConversationPreference={actions.fetchConversationPreference}
      onFetchSidebarData={actions.fetchConversationSidebar}
      onUpdatePreference={actions.saveConversationPreference}
      onGigSurfaceNotice={state.setGigsSurfaceNotice}
      onFocusInboxSearch={() => state.inboxSearchInputRef.current?.focus()}
      onHiringStageChange={handleHiringStageChange}
      onLabelsChange={handleLabelsChange}
      setNewMsgQuery={state.setNewMsgQuery}
      onCloseNewMessage={() => state.setNewMsgOpen(false)}
      onPickRecipient={(row) => {
        actions.createDraftFromSource(row);
        state.setNewMsgOpen(false);
      }}
    />
  );
};

export default MessagesInboxPage;
