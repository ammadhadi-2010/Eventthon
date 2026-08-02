import React from 'react';
import { FiMail, FiMessageCircle, FiShield, FiUser } from 'react-icons/fi';
import { memberAvatar } from '../workspace/squadWorkspaceData';
import '../../styles/squad-chat-inbox.css';

export default function SquadConversationSidebar({
  selectedMessage,
  squad,
  onOpenMembers,
}) {
  if (!selectedMessage) {
    return (
      <aside className="sq-chat-aside">
        <p className="sq-chat-aside__empty">Select a member to see their profile.</p>
      </aside>
    );
  }

  const name =
    selectedMessage.from_user_name ||
    selectedMessage.peer_user_name ||
    selectedMessage.candidate_user_id ||
    'Member';
  const avatar =
    selectedMessage.from_user_imageurl ||
    selectedMessage.imageurl ||
    memberAvatar(name);
  const role = selectedMessage.role || selectedMessage.chat_tag || 'Squad Member';
  const online = selectedMessage.is_online || selectedMessage.online_status === 'online';
  const peerId =
    selectedMessage.peer_user_id ||
    selectedMessage.candidate_user_id ||
    selectedMessage.from_user_id ||
    '';

  return (
    <aside className="sq-chat-aside">
      <div className="sq-chat-aside__profile">
        <img src={avatar} alt="" className="sq-chat-aside__avatar" />
        <div>
          <h3>{name}</h3>
          <p>
            <span className={`sq-chat-aside__dot${online ? ' is-on' : ''}`} />
            {online ? 'Online' : 'Offline'} · {role}
          </p>
        </div>
      </div>

      <div className="sq-chat-aside__card">
        <h4>Conversation</h4>
        <ul className="sq-chat-aside__meta">
          <li>
            <FiMessageCircle size={14} aria-hidden />
            <span>{squad?.squad_name || selectedMessage.context_title || 'Squad'} chat</span>
          </li>
          <li>
            <FiShield size={14} aria-hidden />
            <span>Squad member thread</span>
          </li>
          {peerId ? (
            <li>
              <FiMail size={14} aria-hidden />
              <span className="sq-chat-aside__mono">{peerId}</span>
            </li>
          ) : null}
        </ul>
      </div>

      <div className="sq-chat-aside__card">
        <h4>Quick actions</h4>
        <button type="button" className="sq-chat-aside__btn" onClick={onOpenMembers}>
          <FiUser size={14} aria-hidden /> View all members
        </button>
      </div>

      <div className="sq-chat-aside__card sq-chat-aside__card--tip">
        <p>
          Same power as company chat: attachments, reactions, delivery status, voice notes, and
          search — scoped to your squad members.
        </p>
      </div>
    </aside>
  );
}
