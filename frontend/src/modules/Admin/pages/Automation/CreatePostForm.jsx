import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronDown, Send } from 'lucide-react';
import CreatePostUpload from './CreatePostUpload';
import CreatePostPlatforms from './CreatePostPlatforms';

const CAPTION_MAX = 2200;

export default function CreatePostForm({ busy, connectedPlatforms, caption, onCaptionChange, onSubmit }) {
  const [postType, setPostType] = useState('image');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [platforms, setPlatforms] = useState(['facebook', 'instagram', 'x', 'linkedin']);
  const [scheduledAt, setScheduledAt] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const defaultPlatforms = useMemo(
    () => connectedPlatforms.map((p) => p.id).slice(0, 4),
    [connectedPlatforms],
  );

  const togglePlatform = (id) => {
    setPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleFile = (next) => {
    setFile(next);
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(next ? URL.createObjectURL(next) : '');
  };

  const resetForm = () => {
    onCaptionChange('');
    setFile(null);
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setPlatforms(defaultPlatforms.length ? defaultPlatforms : ['facebook']);
    setScheduledAt('');
  };

  const submit = async (publishMode) => {
    setMenuOpen(false);
    const ok = await onSubmit({
      caption,
      postType,
      platforms: platforms.length ? platforms : defaultPlatforms,
      publishMode,
      scheduledAt,
      file,
      imageurl: '',
    });
    if (ok) resetForm();
  };

  return (
    <section className="um-card auto-create-card">
      <h2 className="auto-card-title">Create New Post</h2>
      <CreatePostUpload
        postType={postType}
        previewUrl={previewUrl}
        onFile={handleFile}
        onTypeChange={setPostType}
      />
      <label className="auto-field-label" htmlFor="auto-caption">
        Caption
      </label>
      <div className="auto-caption-wrap">
        <textarea
          id="auto-caption"
          className="auto-caption"
          value={caption}
          maxLength={CAPTION_MAX}
          placeholder="Write your post caption here..."
          onChange={(e) => onCaptionChange(e.target.value)}
        />
        <span className="auto-caption-count">
          {caption.length}/{CAPTION_MAX}
        </span>
      </div>
      <CreatePostPlatforms
        selected={platforms}
        onToggle={togglePlatform}
        connectedPlatforms={connectedPlatforms}
      />
      <label className="auto-field-label" htmlFor="auto-schedule">
        Schedule (Optional)
      </label>
      <div className="auto-schedule-row">
        <Calendar size={14} aria-hidden />
        <input
          id="auto-schedule"
          type="datetime-local"
          className="auto-schedule-input"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
      </div>
      <div className="auto-publish-row">
        <button
          type="button"
          className="um-btn um-btn--primary auto-publish-btn"
          disabled={busy || !caption.trim()}
          onClick={() => submit(scheduledAt ? 'schedule' : 'now')}
        >
          <Send size={14} /> Publish Now
        </button>
        <div className="auto-publish-menu-wrap" ref={menuRef}>
          <button
            type="button"
            className="um-btn um-btn--primary auto-publish-caret"
            disabled={busy}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <ChevronDown size={14} />
          </button>
          {menuOpen ? (
            <ul className="um-row-menu-list auto-publish-menu" role="menu">
              <li role="none">
                <button type="button" role="menuitem" className="um-row-menu-item" onClick={() => submit('now')}>
                  Publish Now
                </button>
              </li>
              <li role="none">
                <button type="button" role="menuitem" className="um-row-menu-item" onClick={() => submit('schedule')}>
                  Schedule Post
                </button>
              </li>
              <li role="none">
                <button type="button" role="menuitem" className="um-row-menu-item" onClick={() => submit('draft')}>
                  Save as Draft
                </button>
              </li>
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
