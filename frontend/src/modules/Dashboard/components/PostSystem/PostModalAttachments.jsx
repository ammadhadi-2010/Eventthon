import React from 'react';
import { FiX } from 'react-icons/fi';
import { formatVideoSize } from './postVideoUpload';

export default function PostModalAttachments({
  imageFile,
  videoState,
  onClearImage,
  onClearVideo,
  imageInputRef,
  videoInputRef,
  onImageSelected,
  onVideoSelected,
}) {
  return (
    <>
      {imageFile ? (
        <div className="post-modal__attachment post-modal__attachment--image">
          <span>Image: {imageFile.name}</span>
          <button type="button" onClick={onClearImage} aria-label="Remove image">
            <FiX />
          </button>
        </div>
      ) : null}

      {videoState?.previewUrl ? (
        <div className="post-modal__video-wrap">
          <video
            src={videoState.previewUrl}
            controls
            className="post-modal__video-preview"
            playsInline
          />
          <div className="post-modal__attachment post-modal__attachment--video">
            <span>
              Video: {videoState.name} ({formatVideoSize(videoState.size)})
            </span>
            <button type="button" onClick={onClearVideo} aria-label="Remove video">
              <FiX />
            </button>
          </div>
        </div>
      ) : null}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="post-modal__hidden-input"
        onChange={onImageSelected}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
        className="post-modal__hidden-input"
        onChange={onVideoSelected}
      />
    </>
  );
}
