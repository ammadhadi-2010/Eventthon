import React, { useEffect, useMemo, useState } from 'react';
import { FiChevronDown, FiUserCheck, FiUsers } from 'react-icons/fi';
import { fetchCompanyTeam } from '../../../../../components/views/company/services/companyTeamApi';
import { assignCompanyConversation } from '../../services/companyHiringApi';

const ROLE_ORDER = ['owner', 'admin', 'hr_manager', 'recruiter', 'viewer'];

function roleLabel(role) {
  const map = {
    owner: 'Owner',
    admin: 'Admin',
    hr_manager: 'HR',
    recruiter: 'Recruiter',
    viewer: 'Viewer',
  };
  return map[role] || role || 'Member';
}

export default function TeamCollabBar({
  selectedMessage,
  assignment,
  onAssignmentChange,
  onInsertMention,
}) {
  const [members, setMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchCompanyTeam()
      .then((data) => {
        if (!alive) return;
        const rows = Array.isArray(data?.activeMembers) ? data.activeMembers : [];
        setMembers(rows);
      })
      .catch(() => {
        if (alive) setMembers([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const sorted = useMemo(
    () =>
      [...members].sort(
        (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role),
      ),
    [members],
  );

  const assign = async (member) => {
    setBusy(true);
    try {
      const data = await assignCompanyConversation(selectedMessage, {
        userId: member.userId,
        email: member.email,
        name: member.name,
        role: member.role,
      });
      onAssignmentChange?.(data);
      setOpen(false);
    } catch {
      /* keep UI quiet */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cc-collab cc-collab--compact">
      <div className="cc-collab__actions">
        <div className="cc-collab__assign">
          <button type="button" disabled={busy} onClick={() => setOpen((v) => !v)}>
            <FiUserCheck size={13} aria-hidden />
            {assignment?.assigneeName
              ? `Assigned: ${assignment.assigneeName}`
              : 'Assign Conversation'}
            <FiChevronDown size={12} aria-hidden />
          </button>
          {open ? (
            <div className="cc-collab__menu" role="listbox">
              {sorted.length === 0 ? (
                <p>No team members yet.</p>
              ) : (
                sorted.map((m) => (
                  <button key={m.id || m.email} type="button" onClick={() => assign(m)}>
                    <strong>{m.name || m.email}</strong>
                    <em>{roleLabel(m.role)}</em>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>

        <div className="cc-collab__mention">
          <button type="button" onClick={() => setMentionOpen((v) => !v)}>
            <FiUsers size={13} aria-hidden /> @ Mention
          </button>
          {mentionOpen ? (
            <div className="cc-collab__menu" role="listbox">
              {sorted.map((m) => (
                <button
                  key={`m-${m.id || m.email}`}
                  type="button"
                  onClick={() => {
                    const handle = String(m.name || m.email || 'teammate').split(' ')[0];
                    onInsertMention?.(`@${handle}`);
                    setMentionOpen(false);
                  }}
                >
                  <strong>@{String(m.name || m.email).split(' ')[0]}</strong>
                  <em>{roleLabel(m.role)}</em>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
