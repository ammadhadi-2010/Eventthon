import React, { useEffect } from 'react';
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

const MessagesInboxPage = ({ companyMode = false, companyInbox = null }) => {
  const state = useMessagesInboxState({ companyMode, companyInbox });
  const actions = useMessagesInboxActions(state);

  useMarketplaceChatIntents(actions.createDraftFromSource);

  useEffect(() => {
    refreshScrollHideRoots();
    const timer = window.setTimeout(refreshScrollHideRoots, 350);
    return () => window.clearTimeout(timer);
  }, [state.selectedId]);

  useEffect(() => {
    const row = state.selectedRow;
    if (!row || row._isDraft || !isMongoId(row._id)) return;
    if (String(row.delivery_status || '').toLowerCase() === 'read') return;
    actions.handleUpdateDeliveryStatus(row._id, row.chat_type, 'read').catch(() => {});
  }, [state.selectedRow, actions.handleUpdateDeliveryStatus]);

  const handleSelectConversation = (nextId) => {
    state.handleSelectConversation(nextId, state.selectedRow);
  };

  return (
    <MessagesInboxView
      companyMode={companyMode}
      loading={state.loading}
      errorText={state.errorText}
      sendError={state.sendError}
      gigsSurfaceNotice={state.gigsSurfaceNotice}
      displayCounts={state.displayCounts}
      visibleRows={state.visibleRows}
      sourceRows={state.sourceRows}
      query={state.query}
      activeFilter={state.activeFilter}
      selectedId={state.selectedId}
      selectedRow={state.selectedRow}
      refreshing={state.refreshing}
      newMsgOpen={state.newMsgOpen}
      newMsgQuery={state.newMsgQuery}
      recipientRows={state.recipientRows}
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
