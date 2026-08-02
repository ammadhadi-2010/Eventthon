import React, { useState } from 'react';
import { FiEdit2, FiLock, FiPlus, FiTrash2 } from 'react-icons/fi';

function formatWhen(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw).slice(0, 16);
  return d.toLocaleString();
}

export default function RecruiterNotesPanel({
  notes = [],
  busy = false,
  onAdd,
  onEdit,
  onDelete,
}) {
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editBody, setEditBody] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    await onAdd?.(draft.trim());
    setDraft('');
  };

  return (
    <section className="chs-card chs-notes">
      <header className="chs-card__head">
        <h6>
          <FiLock size={13} aria-hidden /> Internal Notes
        </h6>
        <span>Team only — never shown to candidates</span>
      </header>

      <form className="chs-notes__compose" onSubmit={submit}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a private recruiter note…"
          rows={3}
          disabled={busy}
        />
        <button type="submit" disabled={busy || !draft.trim()}>
          <FiPlus size={14} aria-hidden /> Add Note
        </button>
      </form>

      <ul className="chs-notes__list">
        {notes.length === 0 ? (
          <li className="chs-notes__empty">No private notes yet.</li>
        ) : (
          notes.map((note) => (
            <li key={note.id}>
              {editingId === note.id ? (
                <div className="chs-notes__edit">
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={3}
                  />
                  <div className="chs-notes__edit-actions">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!editBody.trim()) return;
                        await onEdit?.(note.id, editBody.trim());
                        setEditingId('');
                      }}
                    >
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingId('')}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p>{note.body}</p>
                  <div className="chs-notes__meta">
                    <span>{note.authorName || 'Recruiter'}</span>
                    <em>{formatWhen(note.updatedAt || note.createdAt)}</em>
                    <button
                      type="button"
                      aria-label="Edit note"
                      onClick={() => {
                        setEditingId(note.id);
                        setEditBody(note.body || '');
                      }}
                    >
                      <FiEdit2 size={12} />
                    </button>
                    <button
                      type="button"
                      className="is-danger"
                      aria-label="Delete note"
                      onClick={() => onDelete?.(note.id)}
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
