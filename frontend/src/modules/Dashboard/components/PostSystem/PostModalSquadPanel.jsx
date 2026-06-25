import React, { useEffect, useState } from 'react';
import { fetchSquadsList } from '../../SquadNetwork/api/squadsApi';

const panelStyle = {
  marginTop: '12px',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(168, 85, 247, 0.25)',
  background: 'rgba(168, 85, 247, 0.08)',
};

const toggleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: '#e9d5ff',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
};

const selectStyle = {
  width: '100%',
  marginTop: '10px',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid rgba(168, 85, 247, 0.35)',
  background: '#111827',
  color: '#f8fafc',
  fontSize: '13px',
};

export default function PostModalSquadPanel({
  attachToSquad = false,
  squadId = '',
  onAttachChange,
  onSquadIdChange,
  disabled = false,
}) {
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!attachToSquad) return undefined;
    let alive = true;
    setLoading(true);
    fetchSquadsList()
      .then((result) => {
        if (!alive) return;
        const rows = Array.isArray(result?.squads) ? result.squads : [];
        setSquads(rows);
        if (!squadId && rows[0]?._id) {
          onSquadIdChange?.(String(rows[0]._id));
        }
      })
      .catch((err) => {
        console.error('Composer squad list failed:', err?.message || err);
        if (alive) setSquads([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [attachToSquad, onSquadIdChange, squadId]);

  return (
    <div style={panelStyle}>
      <label style={toggleStyle}>
        <input
          type="checkbox"
          checked={Boolean(attachToSquad)}
          disabled={disabled}
          onChange={(event) => onAttachChange?.(event.target.checked)}
        />
        <span>Add to Squad Activity Feed</span>
      </label>

      {attachToSquad ? (
        <select
          style={selectStyle}
          value={squadId || ''}
          disabled={disabled || loading || !squads.length}
          onChange={(event) => onSquadIdChange?.(event.target.value)}
        >
          {loading ? <option value="">Loading squads...</option> : null}
          {!loading && !squads.length ? <option value="">No squads available</option> : null}
          {squads.map((squad) => (
            <option key={String(squad._id)} value={String(squad._id)}>
              {squad.name || squad.title || 'Squad'}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}
