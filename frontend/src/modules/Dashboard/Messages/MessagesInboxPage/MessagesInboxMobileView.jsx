import React from 'react';
import ChatWindow from '../components/ChatWindow';
import InboxSidebar from '../components/InboxSidebar';
import MessagesMobileChrome from '../components/MessagesMobileChrome';

/** Mobile-only WhatsApp-style inbox list + full-screen chat. */
export default function MessagesInboxMobileView({
  companyMode = false,
  loading,
  errorText,
  sendError,
  gigsSurfaceNotice,
  visibleRows,
  sourceRows,
  query,
  activeFilter,
  selectedId,
  selectedRow,
  refreshing,
  userId,
  isNavVisible,
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
  sending,
}) {
  const showList = !selectedId;

  return (
    <div className={`msgx-mobile-only msgx-mobile-screen${companyMode ? ' msgx-mobile-screen--company' : ''}`}>
      {showList ? (
        <>
          {!companyMode ? (
            <MessagesMobileChrome
              isNavVisible={isNavVisible}
              query={query}
              onQueryChange={setQuery}
              onNewMessage={onNewMessage}
            />
          ) : null}
          <section className="msgx-mobile-list-shell">
            {loading ? (
              <div className="msgx-loading">Loading inbox...</div>
            ) : errorText ? (
              <div className="msgx-error">{errorText}</div>
            ) : (
              <InboxSidebar
                rows={visibleRows}
                allRows={sourceRows}
                query={query}
                activeFilter={activeFilter}
                selectedId={selectedId}
                onQueryChange={setQuery}
                onFilterChange={setActiveFilter}
                onSelect={onSelectConversation}
                onMenuAction={onMenuAction}
                onRefresh={onRefresh}
                refreshing={refreshing}
                onNewMessage={onNewMessage}
                hideInlineSearch
              />
            )}
          </section>
        </>
      ) : (
        <section className="msgx-mobile-chat-shell">
          <ChatWindow
            selectedMessage={selectedRow}
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
            onBack={onMobileBack}
          />
        </section>
      )}
      {sendError ? <div className="msgx-error msgx-mobile-only">{sendError}</div> : null}
      {gigsSurfaceNotice ? <div className="msgx-chat-notice msgx-mobile-only">{gigsSurfaceNotice}</div> : null}
    </div>
  );
}
