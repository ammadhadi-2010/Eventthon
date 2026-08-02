import React from 'react';
import { useMobileHub } from '../../../../hooks/useMobileHub';
import NewMessageOverlay from '../components/NewMessageOverlay';
import MessagesInboxDesktopView from './MessagesInboxDesktopView';
import MessagesInboxMobileView from './MessagesInboxMobileView';

export default function MessagesInboxView(props) {
  const {
    companyMode = false,
    squadMode = false,
    squad = null,
    onOpenSquadMembers,
    newMsgOpen,
    newMsgQuery,
    recipientRows,
    setNewMsgQuery,
    onCloseNewMessage,
    onPickRecipient,
    sending,
    selectedId,
    teamRecipientsLoading = false,
    ...shared
  } = props;

  const isMobile = useMobileHub();
  const powerMode = companyMode || squadMode;

  return (
    <div
      className={`msgx-page${powerMode ? ' msgx-page--company' : ''}${squadMode ? ' msgx-page--squad' : ''}${isMobile ? ' msgx-page--mobile' : ''}`}
    >
      {isMobile ? (
        <MessagesInboxMobileView
          {...shared}
          companyMode={companyMode}
          squadMode={squadMode}
          squad={squad}
          onOpenSquadMembers={onOpenSquadMembers}
          selectedId={selectedId}
          sending={sending}
        />
      ) : (
        <MessagesInboxDesktopView
          {...shared}
          companyMode={companyMode}
          squadMode={squadMode}
          squad={squad}
          onOpenSquadMembers={onOpenSquadMembers}
          sending={sending}
        />
      )}

      <NewMessageOverlay
        open={newMsgOpen}
        query={newMsgQuery}
        recipients={recipientRows}
        onQueryChange={setNewMsgQuery}
        onClose={onCloseNewMessage}
        onPickRecipient={onPickRecipient}
        companyMode={companyMode}
        squadMode={squadMode}
        loading={teamRecipientsLoading}
      />
    </div>
  );
}
