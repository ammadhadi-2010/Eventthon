import React, { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { FiX } from 'react-icons/fi';
import { getCroppedBannerUrl } from './cropBannerImage';
import '../editProfileLayout.css';

/** Wide cover strip (~21:9). Matches typical profile banner proportions. */
const BANNER_ASPECT = 21 / 9;

const CoverBannerCropModal = ({ open, imageSrc, onClose, onApply }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && imageSrc) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [open, imageSrc]);

  const onCropComplete = useCallback((_area, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setBusy(true);
    try {
      const url = await getCroppedBannerUrl(imageSrc, croppedAreaPixels);
      onApply(url);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  if (!open || !imageSrc) return null;

  return (
    <div
      className="ep-banner-crop-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ep-banner-crop-title"
      onClick={onClose}
    >
      <div className="ep-banner-crop-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ep-banner-crop-head">
          <h3 id="ep-banner-crop-title" className="ep-banner-crop-title">
            Set cover banner
          </h3>
          <button type="button" className="ep-banner-crop-close" onClick={onClose} aria-label="Close">
            <FiX size={22} />
          </button>
        </div>
        <p className="ep-banner-crop-hint">Drag image to position · use zoom to fit your photo inside the frame.</p>

        <div className="ep-banner-crop-stage">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={0}
            aspect={BANNER_ASPECT}
            minZoom={1}
            maxZoom={3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="horizontal-cover"
            showGrid={false}
            restrictPosition
            zoomWithScroll
          />
        </div>

        <div className="ep-banner-crop-zoom">
          <span className="ep-banner-crop-zoom-label">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.02}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="ep-banner-crop-range"
          />
        </div>

        <div className="ep-banner-crop-actions">
          <button type="button" className="ep-banner-crop-cancel" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="ep-banner-crop-apply"
            onClick={handleApply}
            disabled={busy || !croppedAreaPixels}
          >
            {busy ? 'Applying…' : 'Apply banner'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoverBannerCropModal;
