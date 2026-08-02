import React, { useRef } from 'react';
import { FiPaperclip, FiX } from 'react-icons/fi';

export default function OppStepTeam({ form, patch }) {
  const fileRef = useRef(null);
  const names = form.attachmentNames || [];

  const onFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const next = [...names];
    files.forEach((f) => {
      const label = f.name;
      if (label && !next.includes(label)) next.push(label);
    });
    patch({ attachmentNames: next.slice(0, 5) });
    e.target.value = '';
  };

  return (
    <section className="ja-panel" aria-labelledby="opp-step-team-title">
      <h2 id="opp-step-team-title" className="ja-panel__title">
        Team & Attachments
      </h2>
      <p className="ja-panel__sub">How many people do you need, and any brief files?</p>

      <label className="ja-field">
        <span className="ja-label">Number of People Needed</span>
        <input
          type="number"
          className="ja-input"
          min={1}
          max={50}
          value={form.peopleNeeded ?? 1}
          onChange={(e) => patch({ peopleNeeded: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })}
        />
      </label>

      <div className="ja-field">
        <span className="ja-label">Attach Files (Optional)</span>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
          className="ja-input"
          style={{ display: 'none' }}
          onChange={onFiles}
        />
        <button
          type="button"
          className="ja-tag-add-btn"
          onClick={() => fileRef.current?.click()}
        >
          <FiPaperclip size={14} /> Add files
        </button>
        {names.length ? (
          <div className="ja-tags" style={{ marginTop: 10 }}>
            {names.map((name) => (
              <span key={name} className="ja-tag">
                {name}
                <button
                  type="button"
                  aria-label={`Remove ${name}`}
                  onClick={() => patch({
                    attachmentNames: names.filter((n) => n !== name),
                  })}
                >
                  <FiX size={12} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="ja-panel__sub" style={{ marginTop: 8 }}>
            PDF, DOC, images, or ZIP — up to 5 files (names saved with the post).
          </p>
        )}
      </div>
    </section>
  );
}
