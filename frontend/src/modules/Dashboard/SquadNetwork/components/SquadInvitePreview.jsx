import React, { useEffect, useState } from 'react';
import { FiCheck, FiUsers, FiX, FiBriefcase, FiStar } from 'react-icons/fi';
import SquadAvatar from './SquadAvatar';
import { fetchSquadInvitePreview, respondSquadInvite } from '../api/squadsApi';
import { getMessagesSenderId } from '../../Messages/utils/messagesSession';
import { readStoredUserStub } from '../../../../utils/storedUser';
import '../styles/squad-avatar.css';
import '../styles/squad-invite-preview.css';

export default function SquadInvitePreview({
  squad,
  userData,
  open,
  onClose,
  onAccepted,
  onDeclined,
}) {
  const squadId = squad?._id || squad?.id;
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (!open || !squadId) return undefined;
    let alive = true;
    setLoading(true);
    setError('');
    setPreview(null);
    fetchSquadInvitePreview(squadId)
      .then((data) => {
        if (alive) setPreview(data);
      })
      .catch((err) => {
        if (!alive) return;
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            err?.message ||
            'Could not load squad preview.',
        );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open, squadId]);

  if (!open) return null;

  const data = preview || squad || {};
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const members = Array.isArray(data.top_members) ? data.top_members : data.members || [];
  const canAccept = data.can_accept !== false && data.membership !== 'member';

  const handleRespond = async (action) => {
    if (!squadId || busy) return;
    setBusy(action);
    setError('');
    try {
      const userId =
        getMessagesSenderId(readStoredUserStub() || userData) ||
        userData?._id ||
        userData?.id ||
        '';
      await respondSquadInvite(squadId, action, userId);
      if (action === 'accept') onAccepted?.(data);
      else onDeclined?.(data);
      onClose?.();
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          'Could not update invitation.',
      );
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="sq-invite-preview" role="dialog" aria-modal="true" aria-labelledby="sq-invite-preview-title">
      <button type="button" className="sq-invite-preview__backdrop" aria-label="Close preview" onClick={onClose} />
      <div className="sq-invite-preview__panel">
        <header className="sq-invite-preview__head">
          <div className="sq-invite-preview__identity">
            <SquadAvatar squad={data} size="lg" />
            <div className="sq-invite-preview__copy">
              <p className="sq-invite-preview__eyebrow">Squad invitation preview</p>
              <h2 id="sq-invite-preview-title">{data.squad_name || 'Squad'}</h2>
              <p className="sq-invite-preview__meta">
                {data.niche || 'Squad'}
                {data.invite_role ? ` · Invited as ${data.invite_role}` : ''}
              </p>
            </div>
          </div>
          <button type="button" className="sq-invite-preview__close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </header>

        {loading ? <p className="sq-invite-preview__status">Loading squad details…</p> : null}
        {error ? <p className="sq-invite-preview__error">{error}</p> : null}

        {!loading ? (
          <div className="sq-invite-preview__body">
            <section className="sq-invite-preview__block">
              <h3>About this squad</h3>
              <p>
                {data.description ||
                  'No description yet. Ask the squad leader what this squad focuses on.'}
              </p>
            </section>

            <section className="sq-invite-preview__stats">
              <div>
                <FiUsers size={14} aria-hidden />
                <strong>{data.members_count ?? members.length ?? 0}</strong>
                <span>Members</span>
              </div>
              <div>
                <FiBriefcase size={14} aria-hidden />
                <strong>{data.projects_count ?? projects.length ?? 0}</strong>
                <span>Projects</span>
              </div>
              <div>
                <FiStar size={14} aria-hidden />
                <strong>{data.rating != null ? Number(data.rating).toFixed(1) : '—'}</strong>
                <span>Rating</span>
              </div>
            </section>

            <section className="sq-invite-preview__block">
              <h3>Active work</h3>
              {projects.length === 0 ? (
                <p className="sq-invite-preview__muted">No active projects listed yet.</p>
              ) : (
                <ul className="sq-invite-preview__projects">
                  {projects.map((p) => (
                    <li key={p.id || p.title}>
                      <strong>{p.title}</strong>
                      <span>{p.status || 'Active'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="sq-invite-preview__block">
              <h3>Team snapshot</h3>
              {members.length === 0 ? (
                <p className="sq-invite-preview__muted">Member list will appear after you join.</p>
              ) : (
                <ul className="sq-invite-preview__members">
                  {members.slice(0, 6).map((m, i) => (
                    <li key={m.id || m.name || i}>
                      <span>{m.name || 'Member'}</span>
                      <em>{m.role || 'Member'}</em>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <p className="sq-invite-preview__hint">
              Review if this squad matches your skills and goals. Accept only if you want to join.
            </p>
          </div>
        ) : null}

        <footer className="sq-invite-preview__actions">
          <button
            type="button"
            className="sq-invite-preview__btn sq-invite-preview__btn--ghost"
            disabled={Boolean(busy)}
            onClick={() => handleRespond('decline')}
          >
            <FiX size={15} /> Decline
          </button>
          {canAccept ? (
            <button
              type="button"
              className="sq-invite-preview__btn sq-invite-preview__btn--primary"
              disabled={Boolean(busy) || loading}
              onClick={() => handleRespond('accept')}
            >
              <FiCheck size={15} /> {busy === 'accept' ? 'Joining…' : 'Accept & Join'}
            </button>
          ) : (
            <button type="button" className="sq-invite-preview__btn sq-invite-preview__btn--primary" onClick={onClose}>
              Close
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
