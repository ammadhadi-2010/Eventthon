import React from 'react';

export default function AvatarStack({ members = [], extra = 0, maxVisible = 3 }) {
  const visible = members.slice(0, maxVisible);

  return (
    <div className="ph-mp-team">
      <div className="ph-mp-team-stack">
        {visible.map((member, index) => (
          <span
            key={`${member}-${index}`}
            className="ph-mp-team-av"
            style={{ zIndex: visible.length - index }}
            title={member}
          >
            {member}
          </span>
        ))}
      </div>
      {extra > 0 ? <span className="ph-mp-team-more">+{extra}</span> : null}
    </div>
  );
}
