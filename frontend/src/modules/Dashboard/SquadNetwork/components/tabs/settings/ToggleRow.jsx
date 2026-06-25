import React from 'react';
import { styles } from './styles';

const ToggleRow = ({ label, enabled, onToggle }) => (
  <div className="sq-settings-toggle-row" style={styles.toggleRow}>
    <span className="sq-settings-toggle-label" style={styles.toggleLabel}>{label}</span>
    <button type="button" onClick={onToggle} style={styles.switchWrap(enabled)}>
      <span style={styles.switchKnob(enabled)} />
    </button>
  </div>
);

export default ToggleRow;
