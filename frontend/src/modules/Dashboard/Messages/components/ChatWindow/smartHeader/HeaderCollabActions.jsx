import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiChevronDown, FiCpu, FiUserCheck, FiUsers } from 'react-icons/fi';
import { fetchCompanyTeam } from '../../../../../../components/views/company/services/companyTeamApi';
import { assignCompanyConversation } from '../../../services/companyHiringApi';

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

function menuStyleFromEl(el) {
  if (!el || typeof window === 'undefined') return null;
  const rect = el.getBoundingClientRect();
  const width = Math.min(260, Math.max(210, window.innerWidth - 16));
  let left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
  const top = Math.min(rect.bottom + 6, window.innerHeight - 120);
  return { position: 'fixed', top, left, width, right: 'auto', zIndex: 1300 };
}

/** Compact assign / @mention / AI controls for the smart chat header. */
export default function HeaderCollabActions({
  selectedMessage,
  assignment,
  onAssignmentChange,
  onInsertMention,
  aiOpen = false,
  onToggleAi,
}) {
  const [members, setMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const assignBtnRef = useRef(null);
  const mentionBtnRef = useRef(null);
  const rootRef = useRef(null);

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

  useEffect(() => {
    if (!open && !mentionOpen) return undefined;
    const onDoc = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      const portal = document.getElementById('sch-collab-portal-menu');
      if (portal?.contains(event.target)) return;
      setOpen(false);
      setMentionOpen(false);
    };
    window.addEventListener('mousedown', onDoc);
    window.addEventListener('touchstart', onDoc, { passive: true });
    return () => {
      window.removeEventListener('mousedown', onDoc);
      window.removeEventListener('touchstart', onDoc);
    };
  }, [open, mentionOpen]);

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
      /* quiet */
    } finally {
      setBusy(false);
    }
  };

  const openAssign = () => {
    setMentionOpen(false);
    const next = !open;
    setOpen(next);
    setMenuStyle(next ? menuStyleFromEl(assignBtnRef.current) : null);
  };

  const openMention = () => {
    setOpen(false);
    const next = !mentionOpen;
    setMentionOpen(next);
    setMenuStyle(next ? menuStyleFromEl(mentionBtnRef.current) : null);
  };

  const portalMenu = open || mentionOpen
    ? createPortal(
      <div id="sch-collab-portal-menu" className="sch-collab__menu" role="listbox" style={menuStyle || undefined}>
        {open ? (
          sorted.length === 0 ? (
            <p>No team members yet. Invite teammates from Team Members.</p>
          ) : (
            sorted.map((m) => (
              <button key={m.id || m.email} type="button" onClick={() => assign(m)}>
                <strong>{m.name || m.email}</strong>
                <em>{roleLabel(m.role)}</em>
              </button>
            ))
          )
        ) : null}
        {mentionOpen ? (
          sorted.length === 0 ? (
            <p>No teammates to mention yet.</p>
          ) : (
            sorted.map((m) => (
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
            ))
          )
        ) : null}
      </div>,
      document.body,
    )
    : null;

  return (
    <div className="sch-collab" ref={rootRef}>
      <div className="sch-collab__item">
        <button
          ref={assignBtnRef}
          type="button"
          className="sch-action sch-action--tool"
          disabled={busy}
          onClick={openAssign}
          title="Assign conversation"
          aria-expanded={open}
        >
          <FiUserCheck size={14} aria-hidden />
          <span>{assignment?.assigneeName ? assignment.assigneeName.split(' ')[0] : 'Assign'}</span>
          <FiChevronDown size={11} aria-hidden />
        </button>
      </div>

      <div className="sch-collab__item">
        <button
          ref={mentionBtnRef}
          type="button"
          className="sch-action sch-action--tool"
          onClick={openMention}
          title="Mention teammate"
          aria-expanded={mentionOpen}
        >
          <FiUsers size={14} aria-hidden />
          <span>@ Mention</span>
        </button>
      </div>

      <button
        type="button"
        className={`sch-action sch-action--tool${aiOpen ? ' is-on' : ''}`}
        onClick={() => {
          setOpen(false);
          setMentionOpen(false);
          onToggleAi?.();
        }}
        title="AI Assistant"
        aria-pressed={aiOpen}
      >
        <FiCpu size={14} aria-hidden />
        <span>AI</span>
        <FiChevronDown
          size={11}
          aria-hidden
          style={{ transform: aiOpen ? 'rotate(180deg)' : 'none', transition: 'transform .18s' }}
        />
      </button>
      {portalMenu}
    </div>
  );
}
