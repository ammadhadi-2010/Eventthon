import React from 'react';
import MessagesInboxPage from '../../../Messages/MessagesInboxPage';
import useSquadInbox from '../../hooks/useSquadInbox';
import '../../../Messages/styles/MessagesInbox.layout.css';
import '../../../Messages/styles/MessagesInbox.sidebar.css';
import '../../../Messages/styles/MessagesInbox.chat.css';
import '../../../Messages/styles/MessagesInbox.details.css';
import '../../../Messages/styles/messages-inbox-mobile.css';
import '../../styles/squad-chat-inbox.css';

/**
 * Company-style 3-pane inbox scoped to squad members.
 * Company chats with hires; squad chats with members — same messaging engine.
 * Replaces the old group lounge (pinned welcome + SquadInputBar).
 */
export default function SquadChatInbox({ squad, onOpenMembers, onMobileChatOpenChange }) {
  const squadId = squad?._id || squad?.id;
  const inbox = useSquadInbox(squadId);

  if (!squadId) {
    return (
      <div className="sq-chat-inbox sq-chat-inbox--empty">
        <p>Select a squad to open member chat.</p>
      </div>
    );
  }

  return (
    <div className="sq-chat-inbox" data-squad-chat="member-inbox">
      <MessagesInboxPage
        squadMode
        companyInbox={inbox}
        squad={squad}
        onOpenSquadMembers={onOpenMembers}
        onMobileChatOpenChange={onMobileChatOpenChange}
      />
    </div>
  );
}
