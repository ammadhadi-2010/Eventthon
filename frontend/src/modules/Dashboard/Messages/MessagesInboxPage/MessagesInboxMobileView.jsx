import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import ChatWindow from '../components/ChatWindow';
import ConversationDetails from '../components/ConversationDetails';
import InboxSidebar from '../components/InboxSidebar';

/** Mobile-only WhatsApp-style inbox list + full-screen chat. */
export default function MessagesInboxMobileView({
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
  selectedId,
  selectedRow,
  refreshing,
  userId,
  setQuery,
  setActiveFilter,
  onSelectConversation,
  onMobileBack,
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
  sending,
}) {
  // Only open chat when we have a real conversation row (avoid empty "Select a chat")
  const showList = !selectedId || !selectedRow;
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  useEffect(() => {
    setWorkspaceOpen(false);
  }, [selectedId]);

  return (
    <div
      className={`msgx-mobile-only msgx-mobile-screen${companyMode || squadMode ? ' msgx-mobile-screen--company' : ''}`}
    >
      {showList ? (
        <section
          className={`msgx-mobile-list-shell${companyMode || squadMode ? '' : ' msgx-mobile-list-shell--public'}`}
        >
          {loading ? (
            <div className="msgx-loading">Loading inbox...</div>
          ) : errorText ? (
            <div className="msgx-error">
              {typeof errorText === 'string' ? errorText : 'Something went wrong loading inbox.'}
            </div>
          ) : (
            <InboxSidebar
              companyMode={companyMode}
              squadMode={squadMode}
              rows={visibleRows}
              allRows={sourceRows}
              query={query}
              activeFilter={activeFilter}
              companyFilters={companyFilters}
              onCompanyFiltersChange={setCompanyFilters}
              selectedId={selectedId}
              onQueryChange={setQuery}
              onFilterChange={setActiveFilter}
              onSelect={onSelectConversation}
              onMenuAction={onMenuAction}
              onRefresh={onRefresh}
              refreshing={refreshing}
              onNewMessage={onNewMessage}
              hideInlineSearch={false}
            />
          )}
        </section>
      ) : (
        <section className="msgx-mobile-chat-shell">
          <ChatWindow
            companyMode={companyMode}
            squadMode={squadMode}
            selectedMessage={selectedRow}
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
            onBack={onMobileBack}
            onOpenWorkspace={
              companyMode || squadMode ? () => setWorkspaceOpen(true) : undefined
            }
          />

          {(companyMode || squadMode) && workspaceOpen ? (
            <div className="msgx-mobile-workspace" role="dialog" aria-modal="true" aria-label="Conversation workspace">
              <button
                type="button"
                className="msgx-mobile-workspace__scrim"
                aria-label="Close workspace"
                onClick={() => setWorkspaceOpen(false)}
              />
              <aside className="msgx-mobile-workspace__panel">
                <header className="msgx-mobile-workspace__head">
                  <h3>Workspace</h3>
                  <button
                    type="button"
                    className="msgx-mobile-workspace__close"
                    aria-label="Close workspace"
                    onClick={() => setWorkspaceOpen(false)}
                  >
                    <FiX size={18} />
                  </button>
                </header>
                <div className="msgx-mobile-workspace__body">
                  <ConversationDetails
                    companyMode={companyMode}
                    squadMode={squadMode}
                    squad={squad}
                    onOpenSquadMembers={onOpenSquadMembers}
                    selectedMessage={selectedRow}
                    onHiringStageChange={onHiringStageChange}
                    onLabelsChange={onLabelsChange}
                    onFetchSidebarData={onFetchSidebarData}
                    onUpdatePreference={onUpdatePreference}
                    onGigSurfaceNotice={onGigSurfaceNotice}
                    onFocusInboxSearch={onFocusInboxSearch}
                  />
                </div>
              </aside>
            </div>
          ) : null}
        </section>
      )}
      {sendError ? <div className="msgx-error msgx-mobile-only">{sendError}</div> : null}
      {gigsSurfaceNotice ? <div className="msgx-chat-notice msgx-mobile-only">{gigsSurfaceNotice}</div> : null}
    </div>
  );
}
