import React from 'react';
import ChatWindow from '../components/ChatWindow';
import ConversationDetails from '../components/ConversationDetails';
import InboxSidebar from '../components/InboxSidebar';

/** Desktop-only 3-column inbox — unchanged layout engine. */
export default function MessagesInboxDesktopView({
  companyMode = false,
  squadMode = false,
  squad = null,
  onOpenSquadMembers,
  loading,
  errorText,
  sendError,
  gigsSurfaceNotice,
  visibleRows,
  sourceRows,
  chatRows,
  query,
  activeFilter,
  companyFilters,
  setCompanyFilters,
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
  onHiringStageChange,
  onLabelsChange,
}) {
  const desktopSelected = selectedRow || visibleRows[0] || null;

  return (
    <div className="msgx-desktop-only">
      <section className="msgx-shell">
        {loading ? (
          <div className="msgx-loading">Loading inbox...</div>
        ) : errorText ? (
          <div className="msgx-error">
            {typeof errorText === 'string' ? errorText : 'Something went wrong loading inbox.'}
          </div>
        ) : (
          <div className="msgx-main-grid">
            <InboxSidebar
              companyMode={companyMode}
              squadMode={squadMode}
              rows={visibleRows}
              allRows={sourceRows}
              query={query}
              activeFilter={activeFilter}
              companyFilters={companyFilters}
              onCompanyFiltersChange={setCompanyFilters}
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
              companyMode={companyMode}
              squadMode={squadMode}
              selectedMessage={desktopSelected}
              allMessages={chatRows || sourceRows}
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
            <aside className="msgx-details" aria-label="Conversation details">
              <ConversationDetails
                companyMode={companyMode}
                squadMode={squadMode}
                squad={squad}
                onOpenSquadMembers={onOpenSquadMembers}
                selectedMessage={desktopSelected}
                onHiringStageChange={onHiringStageChange}
                onLabelsChange={onLabelsChange}
                onFetchSidebarData={onFetchSidebarData}
                onUpdatePreference={onUpdatePreference}
                onGigSurfaceNotice={onGigSurfaceNotice}
                onFocusInboxSearch={onFocusInboxSearch}
              />
            </aside>
          </div>
        )}
        {sendError ? <div className="msgx-error">{sendError}</div> : null}
        {gigsSurfaceNotice ? <div className="msgx-chat-notice">{gigsSurfaceNotice}</div> : null}
      </section>
    </div>
  );
}
