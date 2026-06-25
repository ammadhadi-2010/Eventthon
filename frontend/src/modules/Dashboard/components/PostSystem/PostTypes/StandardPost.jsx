import React from 'react';

const StandardPost = ({ userData, value, onChange }) => {
  return (
    <div className="post-modal__standard-wrap">
      <textarea
        className="post-modal__textarea"
        placeholder={`What's on your mind, ${userData?.first_name || 'Ammad'}?`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
    </div>
  );
};

export default StandardPost;
