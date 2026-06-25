import React from 'react';
import { styles } from './styles';

const InfoItem = ({ label, value, avatar }) => {
  const textValue = String(value || '');
  const initials = textValue
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="sq-settings-meta-item" style={styles.infoWrap}>
      <small className="sq-settings-meta-label" style={styles.infoLabel}>{label}</small>
      <div style={styles.infoValueRow}>
        {avatar ? <img src={avatar} alt={textValue} className="sq-settings-owner-avatar" style={styles.avatarImg} /> : label === 'Squad Owner' ? <span className="sq-settings-owner-fallback" style={styles.fallbackAvatar}>{initials}</span> : null}
        <strong className="sq-settings-meta-value" style={styles.infoValue}>{textValue}</strong>
      </div>
    </div>
  );
};

export default InfoItem;
