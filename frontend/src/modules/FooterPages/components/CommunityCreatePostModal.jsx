import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';

const CATEGORY_OPTS = [
  { id: 'general', label: 'General' },
  { id: 'freelancers', label: 'Freelancers' },
  { id: 'startups', label: 'Startups' },
  { id: 'developers', label: 'Developers' },
  { id: 'designers', label: 'Designers' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'ai', label: 'AI & Tech' },
];

export default function CommunityCreatePostModal({ open, onClose, onPublish, categories = [] }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('general');
  const [error, setError] = useState('');

  const opts = categories.length
    ? categories.map((c) => ({ id: c.id, label: c.label }))
    : CATEGORY_OPTS;

  useEffect(() => {
    if (!open) return undefined;
    setTitle('');
    setBody('');
    setCategory(opts[0]?.id || 'general');
    setError('');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    const t = title.trim();
    const b = body.trim();
    if (!t) {
      setError('Please add a title.');
      return;
    }
    if (b.length < 8) {
      setError('Please write a bit more detail (at least 8 characters).');
      return;
    }
    onPublish?.({
      title: t,
      summary: b.slice(0, 140),
      body: b,
      category,
    });
  };

  return (
    <div className="comm-modal" role="dialog" aria-modal="true" aria-labelledby="comm-create-title" onClick={onClose}>
      <form className="comm-modal__panel" onClick={(ev) => ev.stopPropagation()} onSubmit={submit}>
        <header className="comm-modal__head">
          <div>
            <p className="comm-modal__eyebrow">Community</p>
            <h2 id="comm-create-title">Create Post</h2>
          </div>
          <button type="button" className="comm-modal__close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </header>

        <p className="comm-modal__hint">
          Write your post here — after publish it appears in Featured Discussions.
          For the home feed, you can also use the{' '}
          <Link to="/dashboard">Dashboard</Link>
          {' '}composer.
        </p>

        <label className="comm-modal__field">
          <span>Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Tips for first gig proposals"
            maxLength={120}
            autoFocus
          />
        </label>

        <label className="comm-modal__field">
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {opts.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </label>

        <label className="comm-modal__field">
          <span>Post</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your question, tip, or update…"
            rows={6}
            maxLength={4000}
          />
        </label>

        {error ? <p className="comm-modal__error">{error}</p> : null}

        <footer className="comm-modal__foot">
          <button type="button" className="comm-filter" onClick={onClose}>Cancel</button>
          <button type="submit" className="comm-btn-primary comm-btn-primary--sm">Publish to Community</button>
        </footer>
      </form>
    </div>
  );
}
