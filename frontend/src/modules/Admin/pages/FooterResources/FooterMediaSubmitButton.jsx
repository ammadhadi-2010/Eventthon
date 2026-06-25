import React, { useRef, useState } from 'react';
import { uploadFooterMedia } from './footerResourceApi';

export default function FooterMediaSubmitButton({ onUploaded, disabled }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const openPicker = () => {
    if (!uploading && !disabled) inputRef.current?.click();
  };

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const result = await uploadFooterMedia(file);
      if (!result?.field || !result?.url) {
        throw new Error('Upload did not return a media URL.');
      }
      onUploaded(result.field, result.url);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Media upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={onFileChange}
      />
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled || uploading}
        className="w-full rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-60 transition-all"
      >
        {uploading ? 'Uploading media...' : 'Submit Media File'}
      </button>
      <p className="text-xs text-slate-200">Images fill cover URL; videos fill embed link automatically.</p>
      {error ? <p className="text-xs font-semibold text-rose-300">{error}</p> : null}
    </div>
  );
}
