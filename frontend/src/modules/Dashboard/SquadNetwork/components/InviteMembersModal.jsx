import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import { getAvatarUrl } from '../../Navbar/userMenuUtils';
import { pickImageurl, resolveDashboardMediaUrl } from '../../utils/dashboardMedia';
import { fetchInviteTargets } from './createSquad/createSquadApi';
import { inviteSquadMember as inviteApi } from '../api/squadsApi';
import { routeSquadChatFromResponse } from '../utils/squadsMessagesBridge';
import { squadMemberProfilePath } from '../utils/squadMemberProfilePath';
import { notifyAlertsRefresh } from '../../Alerts/utils/alertsNotify';
import '../styles/invite-members-modal.css';

function inviteAvatarSrc(user) {
  const raw = pickImageurl(user);
  const resolved = resolveDashboardMediaUrl(raw);
  if (resolved) return resolved;
  return getAvatarUrl({
    name: user?.name,
    email: user?.email,
    profile_image_url: user?.profile_image_url || user?.avatar || user?.imageurl,
  });
}

const InviteMembersModal = ({ isOpen, onClose, squadId, invitedBy, squadName = 'Squad' }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSelectedIds([]);
    setSearch('');
    setError('');
    fetchInviteTargets()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [isOpen]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) =>
      [u.name, u.title, u.handle].filter(Boolean).some((v) => String(v).toLowerCase().includes(term)),
    );
  }, [users, search]);

  const toggle = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const openProfile = (user) => {
    onClose?.(false);
    navigate(squadMemberProfilePath(user));
  };

  const handleInvite = async () => {
    if (!squadId || !selectedIds.length) return;
    setSending(true);
    setError('');
    try {
      const selectedUsers = users.filter((u) => selectedIds.includes(u._id));
      let openedChat = false;
      for (const user of selectedUsers) {
        const res = await inviteApi(squadId, {
          name: user.name,
          role: 'Member',
          invited_by: invitedBy,
          invitee_user_id: user._id,
        });
        if (res?.status === 'success') {
          notifyAlertsRefresh();
          if (!openedChat && routeSquadChatFromResponse(res, navigate)) openedChat = true;
        }
      }
      onClose?.(true);
    } catch (err) {
      console.error('Invite members failed:', err);
      setError(err?.message || 'Could not send invitations.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sq-invite-overlay" onClick={() => onClose?.(false)}>
      <div className="sq-invite-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sq-invite-modal__header">
          <h3 className="sq-invite-modal__title">Invite Members — {squadName}</h3>
          <button type="button" className="sq-invite-modal__close" onClick={() => onClose?.(false)} aria-label="Close">
            <FiX />
          </button>
        </div>

        <div className="sq-invite-modal__search">
          <FiSearch aria-hidden />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people..."
            aria-label="Search people to invite"
          />
        </div>

        {error ? <p className="sq-invite-modal__error">{error}</p> : null}

        <div className="sq-invite-modal__list">
          {filtered.map((user) => {
            const selected = selectedIds.includes(user._id);
            return (
              <div key={user._id} className={`sq-invite-row${selected ? ' is-selected' : ''}`}>
                <input
                  type="checkbox"
                  className="sq-invite-row__check"
                  checked={selected}
                  onChange={() => toggle(user._id)}
                  aria-label={`Select ${user.name || 'member'}`}
                />
                <button
                  type="button"
                  className="sq-invite-row__profile"
                  onClick={() => openProfile(user)}
                  aria-label={`View ${user.name || 'member'} profile`}
                >
                  <img
                    className="sq-invite-row__avatar"
                    src={inviteAvatarSrc(user)}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getAvatarUrl(null);
                    }}
                  />
                  <span className="sq-invite-row__meta">
                    <strong className="sq-invite-row__name">{user.name}</strong>
                    <span className="sq-invite-row__sub">{user.title || user.handle || 'Member'}</span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="sq-invite-modal__submit"
          disabled={sending || !selectedIds.length}
          onClick={handleInvite}
        >
          {sending ? 'Sending…' : `Send ${selectedIds.length || ''} Invitation${selectedIds.length === 1 ? '' : 's'}`}
        </button>
      </div>
    </div>
  );
};

export default InviteMembersModal;
