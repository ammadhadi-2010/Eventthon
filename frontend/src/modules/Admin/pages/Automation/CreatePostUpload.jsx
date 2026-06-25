import React, { useRef } from 'react';
import { CloudUpload, Image as ImageIcon, Video } from 'lucide-react';
import { resolveAutomationMediaUrl } from './automationData';

export default function CreatePostUpload({ postType, previewUrl, onFile, onTypeChange }) {
  const inputRef = useRef(null);
  const resolved = resolveAutomationMediaUrl(previewUrl);

  return (
    <div className="auto-upload-block">
      <div className="auto-type-tabs">
        <button
          type="button"
          className={`auto-type-tab${postType === 'image' ? ' auto-type-tab--active' : ''}`}
          onClick={() => onTypeChange('image')}
        >
          <ImageIcon size={14} /> Image Post
        </button>
        <button
          type="button"
          className={`auto-type-tab${postType === 'video' ? ' auto-type-tab--active' : ''}`}
          onClick={() => onTypeChange('video')}
        >
          <Video size={14} /> Video Post
        </button>
      </div>
      <button
        type="button"
        className="auto-upload-drop"
        onClick={() => inputRef.current?.click()}
      >
        {resolved ? (
          postType === 'video' ? (
            <video src={resolved} className="auto-upload-preview" controls muted />
          ) : (
            <img src={resolved} alt="" className="auto-upload-preview" />
          )
        ) : (
          <>
            <CloudUpload size={28} className="text-violet-400" />
            <span>Upload {postType === 'video' ? 'Video' : 'Image'} (JPG, PNG, WebP, Max 10MB)</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={postType === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp,image/gif'}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
    </div>
  );
}
