import React from 'react';
import ChatWindow from '../components/ChatWindow';
import ConversationDetails from '../components/ConversationDetails';
import InboxSidebar from '../components/InboxSidebar';

/** Desktop-only 3-column inbox — unchanged layout engine. */
export default function MessagesInboxDesktopView({
  loading,
  errorText,
  sendError,
  gigsSurfaceNotice,
  visibleRows,
  sourceRows,
  query,
  activeFilter,
  selectedRow,
  refreshing,
  sending,
  userId,
  inboxSearchInputRef,
  setQuery,
  setActiveFilter,
  onSelectConversation,
  onMenuAction,
  onRefresh,
  onNewMessage,
  onSendMessage,
  onUpdateDeliveryStatus,
  onUploadAttachment,
  onMessageAction,
  onDeleteMessage,
  onConversationPreference,
  onFetchConversationPreference,
  onFetchSidebarData,
  onUpdatePreference,
  onGigSurfaceNotice,
  onFocusInboxSearch,
}) {
  const desktopSelected = selectedRow || visibleRows[0] || null;

  return (
    <div className="msgx-desktop-only">
      <section className="msgx-shell">
        {loading ? (
          <div className="msgx-loading">Loading inbox...</div>
        ) : errorText ? (
          <div className="msgx-error">{errorText}</div>
        ) : (
          <div className="msgx-main-grid">
            <InboxSidebar
              rows={visibleRows}
              allRows={sourceRows}
              query={query}
              activeFilter={activeFilter}
              selectedId={desktopSelected?._id || ''}
              onQueryChange={setQuery}
              onFilterChange={setActiveFilter}
              onSelect={onSelectConversation}
              onMenuAction={onMenuAction}
              onRefresh={onRefresh}
              refreshing={refreshing}
              onNewMessage={onNewMessage}
              searchInputRef={inboxSearchInputRef}
            />
            <ChatWindow
              selectedMessage={desktopSelected}
              allMessages={sourceRows}
              currentUserId={userId}
              onSendMessage={onSendMessage}
              onUpdateDeliveryStatus={onUpdateDeliveryStatus}
              onUploadAttachment={onUploadAttachment}
              onMessageAction={onMessageAction}
              onDeleteMessage={onDeleteMessage}
              onConversationPreference={onConversationPreference}
              onFetchConversationPreference={onFetchConversationPreference}
              sending={sending}
            />
            <ConversationDetails
              selectedMessage={desktopSelected}
              onFetchSidebarData={onFetchSidebarData}
              onUpdatePreference={onUpdatePreference}
              onGigSurfaceNotice={onGigSurfaceNotice}
              onFocusInboxSearch={onFocusInboxSearch}
            />
          </div>
        )}
        {sendError ? <div className="msgx-error">{sendError}</div> : null}
        {gigsSurfaceNotice ? <div className="msgx-chat-notice">{gigsSurfaceNotice}</div> : null}
      </section>
    </div>
  );
}
