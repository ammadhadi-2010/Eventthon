import React, { useState } from 'react';

export default function ComposerCtaModal({ open, onClose, onInsert }) {
  const [text, setText] = useState('Visit EventThon');
  const [link, setLink] = useState('https://eventthone.com');

  if (!open) return null;

  const handleSave = (event) => {
    event.preventDefault();
    onInsert?.({ text: text.trim(), link: link.trim() });
    onClose?.();
  };

  return (
    <div className="eo-modal" role="dialog" aria-modal="true" aria-labelledby="eo-cta-title">
      <button type="button" className="eo-modal__backdrop" aria-label="Close" onClick={onClose} />
      <form className="eo-modal__card" onSubmit={handleSave}>
        <h3 id="eo-cta-title" className="eo-modal__title">Add CTA Button</h3>
        <label className="eo-field">
          <span className="eo-field__label">Button Text</span>
          <input className="eo-field__input" value={text} onChange={(e) => setText(e.target.value)} required />
        </label>
        <label className="eo-field">
          <span className="eo-field__label">Button Link</span>
          <input type="url" className="eo-field__input" value={link} onChange={(e) => setLink(e.target.value)} required />
        </label>
        <footer className="eo-modal__actions">
          <button type="submit" className="eo-btn eo-btn--primary">Insert Button</button>
          <button type="button" className="eo-btn eo-btn--ghost" onClick={onClose}>Cancel</button>
        </footer>
      </form>
    </div>
  );
}
