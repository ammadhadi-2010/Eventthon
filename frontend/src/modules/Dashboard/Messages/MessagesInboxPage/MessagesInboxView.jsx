import React from 'react';
import NewMessageOverlay from '../components/NewMessageOverlay';
import MessagesInboxDesktopView from './MessagesInboxDesktopView';
import MessagesInboxMobileView from './MessagesInboxMobileView';

export default function MessagesInboxView(props) {
  const {
    companyMode = false,
    newMsgOpen,
    newMsgQuery,
    recipientRows,
    setNewMsgQuery,
    onCloseNewMessage,
    onPickRecipient,
    sending,
    selectedId,
    ...shared
  } = props;

  return (
    <div className="msgx-page">
      <MessagesInboxDesktopView {...shared} sending={sending} />
      <MessagesInboxMobileView {...shared} companyMode={companyMode} selectedId={selectedId} sending={sending} />

      <NewMessageOverlay
        open={newMsgOpen}
        query={newMsgQuery}
        recipients={recipientRows}
        onQueryChange={setNewMsgQuery}
        onClose={onCloseNewMessage}
        onPickRecipient={onPickRecipient}
      />
    </div>
  );
}
