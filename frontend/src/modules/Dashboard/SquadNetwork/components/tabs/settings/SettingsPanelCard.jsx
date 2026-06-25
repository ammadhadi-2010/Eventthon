import React from 'react';
import ToggleRow from './ToggleRow';
import { styles } from './styles';

const SettingsPanelCard = ({ menuMeta, activeSettings, toggles, onToggle, footerText }) => (
  <div className="sq-settings-panel-card" style={styles.card}>
    <div style={styles.settingsHead}>
      <h4 className="sq-settings-panel-heading" style={styles.heading}>{menuMeta.title}</h4>
      <span className="sq-settings-panel-note" style={styles.settingsNote}>{menuMeta.note}</span>
    </div>
    {activeSettings.map((item) => (
      <ToggleRow
        key={item.key}
        label={item.label}
        enabled={Boolean(toggles[item.key])}
        onToggle={() => onToggle(item.key)}
      />
    ))}
    <div className="sq-settings-panel-foot" style={styles.settingsFoot}>
      <span style={styles.saveDot} />
      {footerText || 'Changes are saved for this squad session'}
    </div>
  </div>
);

export default SettingsPanelCard;
