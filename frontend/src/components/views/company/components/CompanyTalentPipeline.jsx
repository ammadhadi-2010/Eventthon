import React, { useState } from 'react';
import { resolvePortalImageurl } from '../utils/portalImage';
import { setCompanyApplicationStatus } from '../services/companyPortalApi';

const STAGE_TONE = {
  applied: 'violet',
  screening: 'blue',
  interview: 'cyan',
  technical: 'amber',
  final: 'magenta',
  offer: 'indigo',
  hired: 'green',
};

export default function CompanyTalentPipeline({ pipeline, onMoved }) {
  const columns = pipeline?.columns || [];
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState('');

  const onDragStart = (event, cardId, fromKey) => {
    event.dataTransfer.setData('text/plain', JSON.stringify({ cardId, fromKey }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = async (event, toKey) => {
    event.preventDefault();
    setDragOver('');
    let payload;
    try {
      payload = JSON.parse(event.dataTransfer.getData('text/plain') || '{}');
    } catch {
      return;
    }
    const { cardId, fromKey } = payload || {};
    if (!cardId || !toKey || fromKey === toKey) return;

    setBusyId(cardId);
    setError('');
    try {
      await setCompanyApplicationStatus(cardId, toKey);
      if (typeof onMoved === 'function') await onMoved();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Could not move candidate.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <section className="cp-section cp-glass cp-pipeline">
      <header className="cp-pipeline__intro">
        <h2>Talent Pipeline</h2>
        <p>Drag candidates between stages to update their application status.</p>
      </header>

      {error ? <p className="cp-hub-page__error">{error}</p> : null}

      {columns.length === 0 ? (
        <p className="cp-empty">No pipeline data yet.</p>
      ) : (
        <>
        <p className="cp-pipeline__track-hint">Swipe sideways to see more stages</p>
        <div className="cp-pipeline__track" role="list">
          {columns.map((col) => {
            const tone = STAGE_TONE[col.key] || 'violet';
            const shown = col.cards || [];
            const more = Math.max(0, Number(col.count || 0) - shown.length);

            return (
              <div
                key={col.key}
                className={`cp-pipeline__col cp-pipeline__col--${tone}${dragOver === col.key ? ' is-drop' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(col.key);
                }}
                onDragLeave={() => setDragOver((prev) => (prev === col.key ? '' : prev))}
                onDrop={(e) => onDrop(e, col.key)}
              >
                <div className="cp-pipeline__col-head">
                  <span>{col.label}</span>
                  <em>{col.count}</em>
                </div>
                <ul className="cp-pipeline__list">
                  {shown.length === 0 ? (
                    <li className="cp-pipeline__empty">No candidates</li>
                  ) : (
                    shown.map((card) => (
                      <li
                        key={card.id}
                        className={`cp-pipeline__card${busyId === card.id ? ' is-busy' : ''}`}
                        draggable={busyId !== card.id}
                        onDragStart={(e) => onDragStart(e, card.id, col.key)}
                      >
                        <img src={resolvePortalImageurl(card.imageurl, card.name)} alt="" />
                        <div className="cp-pipeline__card-copy">
                          <strong>{card.name}</strong>
                          <span>{card.position}</span>
                          <em>{card.time}</em>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
                {more > 0 ? <p className="cp-pipeline__more">+ {more} more</p> : null}
              </div>
            );
          })}
        </div>
        </>
      )}
    </section>
  );
}
