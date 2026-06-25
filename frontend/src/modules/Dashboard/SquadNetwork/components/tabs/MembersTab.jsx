import React, { useMemo, useState } from 'react';
import { FiChevronDown, FiFilter, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import MembersTabMemberRow from './MembersTabMemberRow';
import '../../styles/squad-members-tab.css';

const MembersTab = ({ members = [], canInvite = false, onInvite, onUpdateMemberRole, onRemoveMember }) => {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [messageTarget, setMessageTarget] = useState(null);
  const [messageText, setMessageText] = useState('');

  const total = members.length;
  const online = members.filter((m) => m.online).length;
  const admins = members.filter((m) => String(m.role || '').toLowerCase() === 'admin').length;
  const moderators = members.filter((m) => String(m.role || '').toLowerCase() === 'moderator').length;

  const filteredMembers = useMemo(() => {
    const term = query.trim().toLowerCase();
    return members.filter((member) => {
      const matchesSearch = !term
        || String(member.name || '').toLowerCase().includes(term)
        || String(member.role || '').toLowerCase().includes(term)
        || String(member.page || '').toLowerCase().includes(term)
        || String(member.email || '').toLowerCase().includes(term);
      const memberRole = String(member.role || 'Member').toLowerCase();
      const memberStatus = member.online ? 'online' : 'offline';
      return (
        matchesSearch
        && (roleFilter === 'all' || memberRole === roleFilter)
        && (statusFilter === 'all' || memberStatus === statusFilter)
      );
    });
  }, [members, query, roleFilter, statusFilter]);

  const handleMessageSend = () => {
    if (!messageTarget) return;
    window.alert(`Message sent to ${messageTarget.name}: ${messageText || '(empty)'}`);
    setMessageText('');
    setMessageTarget(null);
  };

  const handleRoleChange = async (member, role) => {
    setActiveMenuId(null);
    if (!member?.id || !onUpdateMemberRole) return;
    await onUpdateMemberRole(member.id, role);
  };

  const handleRemove = async (member) => {
    setActiveMenuId(null);
    if (!member?.id || !onRemoveMember) return;
    if (!window.confirm(`Remove ${member.name || 'member'} from squad?`)) return;
    await onRemoveMember(member.id);
  };

  return (
    <div className="sq-members-tab">
      <div className="sq-members-kpi-grid">
        <Kpi label="Total Members" value={total} tint="#3b82f6" />
        <Kpi label="Online Now" value={online} tint="#34d399" />
        <Kpi label="Admins" value={admins} tint="#a855f7" />
        <Kpi label="Moderators" value={moderators} tint="#38bdf8" />
      </div>

      <div className="sq-members-toolbar">
        <div className="sq-members-search">
          <FiSearch size={13} />
          <input placeholder="Search members..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button type="button" className="sq-members-ghost-btn"><FiFilter /> Filters</button>
        {canInvite ? (
          <button type="button" className="sq-members-primary-btn" onClick={onInvite}>
            <FiPlus /> Invite Members
          </button>
        ) : null}
      </div>

      <div className="sq-members-table">
        <div className="sq-members-table-head">
          <span className="sq-members-head-cell">Member <FiChevronDown size={12} /></span>
          <span className="sq-members-head-cell">Optional</span>
          <span className="sq-members-head-cell">Role</span>
          <span className="sq-members-head-cell">Status <FiChevronDown size={12} /></span>
          <span className="sq-members-head-cell">Joined <FiChevronDown size={12} /></span>
          <span className="sq-members-head-cell">Actions</span>
        </div>

        <div className="sq-members-grid">
          {filteredMembers.map((member, index) => {
            const safeId = member.id || member._id || `${member.name}-${index}`;
            return (
              <MembersTabMemberRow
                key={safeId}
                member={member}
                index={index}
                safeId={safeId}
                activeMenuId={activeMenuId}
                onToggleMenu={(id) => setActiveMenuId(activeMenuId === id ? null : id)}
                onMessage={(row) => { setMessageTarget(row); setMessageText(''); }}
                onRoleChange={handleRoleChange}
                onRemove={handleRemove}
              />
            );
          })}
          {filteredMembers.length === 0 ? (
            <div className="sq-members-empty">No members matched current filters.</div>
          ) : null}
        </div>
      </div>

      <div className="sq-members-filter-pills">
        {[
          ['all', 'All Roles', roleFilter, setRoleFilter],
          ['admin', 'Admins', roleFilter, setRoleFilter],
          ['moderator', 'Moderators', roleFilter, setRoleFilter],
          ['online', 'Online', statusFilter, setStatusFilter],
          ['offline', 'Offline', statusFilter, setStatusFilter],
        ].map(([key, label, active, setter]) => (
          <button
            key={key}
            type="button"
            className={`sq-members-filter-pill${active === key ? ' is-active' : ''}`}
            onClick={() => setter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {messageTarget ? (
        <div className="sq-members-modal-overlay" onClick={() => setMessageTarget(null)}>
          <div className="sq-members-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sq-members-modal-head">
              <strong>Message {messageTarget.name}</strong>
              <button type="button" className="sq-members-modal-close" onClick={() => setMessageTarget(null)}>
                <FiX size={16} />
              </button>
            </div>
            <textarea
              className="sq-members-modal-text"
              placeholder="Write your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <div className="sq-members-modal-actions">
              <button type="button" className="sq-members-modal-cancel" onClick={() => setMessageTarget(null)}>Cancel</button>
              <button type="button" className="sq-members-modal-send" onClick={handleMessageSend}>Send Message</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const Kpi = ({ label, value, tint }) => (
  <div className="sq-members-kpi" style={{ borderColor: `${tint}40`, boxShadow: `inset 0 0 28px ${tint}16` }}>
    <small className="sq-members-kpi-label">{label}</small>
    <strong className="sq-members-kpi-value">{value}</strong>
  </div>
);

export default MembersTab;
