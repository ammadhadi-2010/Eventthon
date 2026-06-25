import React, { useCallback, useEffect, useState } from 'react';
import { FileText, Save } from 'lucide-react';
import { fetchFoundersStory, saveFoundersStoryContent } from '../../../FoundersStory/foundersStoryApi';
import '../UserManagement/userManagement.css';
import './foundersStoryAdmin.css';

export default function FoundersStoryContentPage() {
  const [content, setContent] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchFoundersStory();
      setContent(data.content || '');
      setUpdatedAt(data.updatedAt || '');
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load story content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSave = async () => {
    if (!content.trim()) {
      setError('Story content cannot be empty.');
      return;
    }
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const data = await saveFoundersStoryContent(content.trim());
      setUpdatedAt(data?.updatedAt || new Date().toISOString());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fs-admin">
      <header className="fs-admin__header">
        <div className="fs-admin__title-row">
          <FileText size={22} aria-hidden />
          <div>
            <h1>Founder&apos;s Story Content</h1>
            <p>Edit the public story shown at /founders-story</p>
          </div>
        </div>
        {updatedAt ? (
          <p className="fs-admin__meta">Last updated: {new Date(updatedAt).toLocaleString()}</p>
        ) : null}
      </header>

      {loading ? <p className="fs-admin__status">Loading…</p> : null}
      {error ? <p className="fs-admin__error">{error}</p> : null}
      {saved ? <p className="fs-admin__success">Changes saved. The public page will reflect this content.</p> : null}

      {!loading ? (
        <>
          <label className="fs-admin__label" htmlFor="founders-story-content">
            Story text
          </label>
          <textarea
            id="founders-story-content"
            className="fs-admin__editor"
            rows={18}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste or write the founder's story here. Use blank lines between paragraphs."
          />
          <div className="fs-admin__actions">
            <button type="button" className="fs-admin__save" onClick={onSave} disabled={saving}>
              <Save size={16} aria-hidden />
              <span>{saving ? 'Saving…' : 'Save Changes'}</span>
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
