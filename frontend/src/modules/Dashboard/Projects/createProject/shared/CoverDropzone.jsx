import React, { useRef } from 'react';
import { FiCamera, FiUpload } from 'react-icons/fi';
import { DESIGN_TIPS } from '../data/createProjectWizardData';

export default function CoverDropzone({ previewUrl, onFileSelect }) {
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    const file = fileList?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onFileSelect(url);
  };

  return (
    <div className="cp-cover-row">
      <div
        className="cp-dropzone"
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="cp-dropzone__input"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {previewUrl ? (
          <img src={previewUrl} alt="Cover preview" className="cp-dropzone__preview" />
        ) : (
          <>
            <FiUpload size={28} className="cp-dropzone__ico" aria-hidden />
            <p>Drag & drop an image here</p>
            <small>or click to upload</small>
          </>
        )}
        <span className="cp-dropzone__cam">
          <FiCamera size={14} aria-hidden />
        </span>
      </div>
      <div className="cp-tips-box">
        <h4>Design Tips</h4>
        <ul>
          {DESIGN_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
        <p className="cp-tips-note">Recommended: 1200×628px (JPG, PNG up to 5MB)</p>
      </div>
    </div>
  );
}
