import React from 'react';
import { FiAward } from 'react-icons/fi';

const WinPost = ({ userData, value, onChange }) => {
  return (
    <div className="post-modal__win-wrap">
      <div className="post-modal__win-header">
        <div className="post-modal__win-trophy">
          <FiAward size={22} color="#f59e0b" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="post-modal__win-title">Big Win Achievement!</h4>
          <p className="post-modal__win-sub">Sharing a milestone with the community</p>
        </div>
      </div>

      <textarea
        className="post-modal__win-textarea post-modal__textarea"
        placeholder="Tell us about your achievement... What did you accomplish?"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default WinPost;
