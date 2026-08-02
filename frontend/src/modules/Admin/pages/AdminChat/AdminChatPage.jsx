import React from 'react';
import AdminChatSidebar from './AdminChatSidebar';
import AdminChatPanel from './AdminChatPanel';
import AdminChatDetails from './AdminChatDetails';
import useAdminChat from './useAdminChat';
import './adminChat.css';

export default function AdminChatPage() {
  const chat = useAdminChat();

  return (
    <div className="admin-chat-page">
      <header className="admin-chat-page__head">
        <h1>Live Chat System</h1>
        <p>
          Company support and member inboxes — live refresh, profile names, full history, and quick admin replies.
        </p>
      </header>
      {chat.errorText ? <div className="admin-chat-page__error">{chat.errorText}</div> : null}
      <div className="admin-chat">
        <AdminChatSidebar
          channel={chat.channel}
          onChannelChange={chat.switchChannel}
          threads={chat.threads}
          allThreadCount={chat.allThreadCount}
          activeThreadKey={chat.activeThreadKey}
          onSelectThread={chat.selectThread}
          loading={chat.loadingThreads}
          query={chat.query}
          onQueryChange={chat.setQuery}
          onlineOnly={chat.onlineOnly}
          onOnlineOnlyChange={chat.setOnlineOnly}
          unreadOnly={chat.unreadOnly}
          onUnreadOnlyChange={chat.setUnreadOnly}
          onRefresh={chat.refresh}
        />
        <AdminChatPanel
          activeThread={chat.activeThread}
          messages={chat.messages}
          draft={chat.draft}
          onDraftChange={chat.setDraft}
          onSend={chat.sendMessage}
          loading={chat.loadingMessages}
          sending={chat.sending}
          uploading={chat.uploading}
          quickReplies={chat.quickReplies}
          onRefresh={chat.refresh}
          pendingAttachments={chat.pendingAttachments}
          onPickFiles={chat.pickFiles}
          onRemovePendingAttachment={chat.removePendingAttachment}
          onCopyEmail={chat.copyEmail}
          onToggleLike={chat.toggleLike}
        />
        <AdminChatDetails
          activeThread={chat.activeThread}
          messages={chat.messages}
          channel={chat.channel}
        />
      </div>
    </div>
  );
}
