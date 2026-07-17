import React from 'react';
import OutreachRepliesPanel from './OutreachRepliesPanel';

export default function OutreachConversations({ refreshKey = 0 }) {
  return (
    <div className="eo-conversations">
      <header className="eo-conversations__head">
        <h2 className="eo-conversations__title">Conversations</h2>
        <p className="eo-conversations__sub">
          Incoming replies to eventthon@gmail.com are fetched automatically every minute.
        </p>
      </header>
      <OutreachRepliesPanel refreshKey={refreshKey} limit={50} compact={false} title="All Client Replies" />
    </div>
  );
}
