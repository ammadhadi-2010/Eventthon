import React from 'react';
import { FiEdit2 } from 'react-icons/fi';
import InfoItem from './InfoItem';
import { styles } from './styles';

const SquadInfoCard = ({ form, squadName, squadNiche, squadDesc, owner, createdOn, squadId, isPublic, onOpenEdit }) => (
  <div className="sq-settings-info-card" style={styles.card}>
    <div style={styles.cardHead}>
      <h4 className="sq-settings-panel-heading" style={styles.heading}>Squad Information</h4>
      <button type="button" className="sq-settings-edit-btn" style={styles.editBtn} onClick={onOpenEdit}>
        <FiEdit2 size={13} /> Edit
      </button>
    </div>

    <div style={styles.identityRow}>
      <div className="sq-settings-logo-shell" style={styles.logoShell}>
        <div className="sq-settings-logo-wrap" style={styles.logoWrap}>{(form.squad_name || squadName || 'S').slice(0, 3).toUpperCase()}</div>
        <span className="sq-settings-logo-status" style={styles.logoStatusDot} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <strong className="sq-settings-title" style={styles.title}>{form.squad_name || squadName} 👑</strong>
        <span className="sq-settings-subtitle" style={styles.subtitle}>{form.niche || squadNiche}</span>
        <span className="sq-settings-desc" style={styles.desc}>{form.description || squadDesc}</span>
      </div>
    </div>

    <div style={styles.sectionDivider} />

    <div className="sq-settings-meta-grid" style={styles.metaGrid}>
      <InfoItem label="Squad Owner" value={owner?.name || 'Ammad S.'} avatar={owner?.avatar} />
      <InfoItem label="Created On" value={createdOn} />
      <InfoItem label="Privacy" value={isPublic ? 'Public showroom' : 'Private'} />
      <InfoItem label="Squad ID" value={squadId} />
    </div>
  </div>
);

export default SquadInfoCard;
