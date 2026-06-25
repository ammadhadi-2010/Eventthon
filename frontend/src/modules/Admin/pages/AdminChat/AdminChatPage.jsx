import React from 'react';
import AdminChatSidebar from './AdminChatSidebar';
import AdminChatPanel from './AdminChatPanel';
import useAdminChat from './useAdminChat';
import './adminChat.css';

export default function AdminChatPage() {
  const chat = useAdminChat();

  return (
    <div className="admin-chat-page">
      <header className="admin-chat-page__head">
        <h1>Live Chat System</h1>
        <p>Switch between company support and candidate inboxes without leaving the admin panel.</p>
      </header>
      {chat.errorText ? <div className="admin-chat-page__error">{chat.errorText}</div> : null}
      <div className="admin-chat">
        <AdminChatSidebar
          channel={chat.channel}
          onChannelChange={chat.switchChannel}
          threads={chat.threads}
          activeThreadKey={chat.activeThreadKey}
          onSelectThread={chat.selectThread}
          loading={chat.loadingThreads}
        />
        <AdminChatPanel
          activeThread={chat.activeThread}
          messages={chat.messages}
          draft={chat.draft}
          onDraftChange={chat.setDraft}
          onSend={chat.sendMessage}
          loading={chat.loadingMessages}
          sending={chat.sending}
        />
      </div>
    </div>
  );
}
