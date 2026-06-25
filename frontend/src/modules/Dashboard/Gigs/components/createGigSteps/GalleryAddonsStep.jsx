import React from 'react';

const GalleryAddonsStep = ({ imageInputRef, fileInputRef, uploads, onUploadFiles, removeUpload }) => {
  return (
    <div className="create-gig-form-card">
      <label>Gallery Media</label>
      <p className="create-gig-field-sub">Upload portfolio images and supporting files</p>

      <div className="create-gig-upload-row">
        <button type="button" className="create-gig-btn ghost" onClick={() => imageInputRef.current?.click()}>
          Upload Image
        </button>
        <button type="button" className="create-gig-btn ghost" onClick={() => fileInputRef.current?.click()}>
          Upload File
        </button>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(event) => onUploadFiles(event, 'image')}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(event) => onUploadFiles(event, 'file')}
      />

      {uploads.length ? (
        <div className="create-gig-upload-list">
          {uploads.map((item) => (
            <div key={item.id} className="create-gig-upload-item">
              <span>{item.name} ({item.sizeKb} KB)</span>
              <button type="button" onClick={() => removeUpload(item.id)}>Remove</button>
            </div>
          ))}
        </div>
      ) : null}

      <label>Add-ons</label>
      <p className="create-gig-field-sub">Offer optional extras to increase order value</p>
      <textarea placeholder="Extra fast delivery, source file package, priority support..." />
    </div>
  );
};

export default GalleryAddonsStep;
