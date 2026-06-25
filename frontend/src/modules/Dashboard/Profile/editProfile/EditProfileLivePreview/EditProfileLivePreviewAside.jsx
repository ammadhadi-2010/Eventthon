import React from 'react';
import { FiClock, FiShield, FiUsers } from 'react-icons/fi';
import '../editProfileLayout.css';

/**
 * Sidebar: metrics only (links / languages / education live under About in main column).
 */
const EditProfileLivePreviewAside = ({ focusStepId = 'basic' }) => {
  const metricsActive = focusStepId === 'preferences';

  return (
    <aside className="ep-live-preview__sidebar" aria-label="Profile summary">
      <div
        id="ep-preview-section-preferences"
        data-ep-preview-step="preferences"
        className={`ep-live-preview__sync-target ep-live-preview__aside-block ep-live-preview__aside-block--metrics ep-live-preview__metrics ep-live-preview__metrics--sidebar ${metricsActive ? 'ep-live-preview__sync-target--active' : ''}`}
      >
        <div className="ep-live-preview__metric">
          <FiClock className="ep-live-preview__metric-icon" />
          <div>
            <p className="ep-live-preview__metric-label">Response Time</p>
            <p className="ep-live-preview__metric-value">2 hrs</p>
          </div>
        </div>
        <div className="ep-live-preview__metric">
          <FiShield className="ep-live-preview__metric-icon" />
          <div>
            <p className="ep-live-preview__metric-label">On-time Delivery</p>
            <p className="ep-live-preview__metric-value">98%</p>
          </div>
        </div>
        <div className="ep-live-preview__metric">
          <FiUsers className="ep-live-preview__metric-icon" />
          <div>
            <p className="ep-live-preview__metric-label">Repeat Clients</p>
            <p className="ep-live-preview__metric-value">85%</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default EditProfileLivePreviewAside;
