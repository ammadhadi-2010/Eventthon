import React, { useRef, useState } from 'react';
import { FiImage, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { resolveMediaUrl } from '../../../../components/shared/utils/resolveMediaUrl';
import { uploadAdminDonationImage } from '../../../Donation/donationApi';

export default function AdminDonationImageUpload({
  label,
  hint,
  slot,
  imageUrl,
  onUploaded,
  onClear,
  disabled,
  customUpload,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const preview = resolveMediaUrl(imageUrl) || imageUrl;

  const openPicker = () => {
    if (!uploading && !disabled) inputRef.current?.click();
  };

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, WebP, GIF).');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const result = customUpload
        ? await customUpload(file)
        : await uploadAdminDonationImage(file, slot);
      if (!result?.url) throw new Error('Upload did not return an image URL.');
      onUploaded(result);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="adm-image-upload">
      <span className="adm-image-upload__label">{label}</span>
      <button
        type="button"
        className={`adm-image-upload__drop${preview ? ' has-image' : ''}`}
        onClick={openPicker}
        disabled={disabled || uploading}
      >
        {preview ? (
          <img src={preview} alt="" className="adm-image-upload__preview" />
        ) : (
          <>
            <FiUploadCloud size={28} aria-hidden />
            <span>{uploading ? 'Uploading…' : 'Click to upload image'}</span>
            <small>JPG, PNG, WebP, GIF · max 8MB</small>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="adm-image-upload__input"
        onChange={onFileChange}
      />
      <div className="adm-image-upload__actions">
        <button type="button" className="adm-btn" disabled={disabled || uploading} onClick={openPicker}>
          <FiImage size={14} aria-hidden />
          {uploading ? 'Uploading…' : preview ? 'Replace image' : 'Choose image'}
        </button>
        {preview && onClear ? (
          <button
            type="button"
            className="adm-btn danger"
            disabled={disabled || uploading}
            onClick={onClear}
          >
            <FiTrash2 size={14} aria-hidden /> Remove
          </button>
        ) : null}
      </div>
      {imageUrl ? <p className="adm-image-upload__path">{imageUrl}</p> : null}
      {hint ? <small className="adm-hint">{hint}</small> : null}
      {error ? <p className="adm-image-upload__error">{error}</p> : null}
    </div>
  );
}
