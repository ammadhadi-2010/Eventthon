import React from 'react';
import { FiEdit2, FiMoreVertical } from 'react-icons/fi';
import { canOpenPublicExplore } from '../utils/squadPermissions';
import SquadAvatar from './SquadAvatar';
import '../styles/squad-avatar.css';

const SquadCard = ({ squad, isSelected, onSelect, onEdit }) => {
    const isPublic = canOpenPublicExplore(squad);

    return (
        <div
            className={`sq-squad-card${isSelected ? ' is-selected' : ''}`}
            onClick={onSelect}
            style={styles.card(isSelected)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter') onSelect?.();
            }}
        >
            <SquadAvatar squad={squad} size="sm" className={isSelected ? 'is-selected' : ''} />

            <div style={styles.info}>
                <div style={styles.nameRow}>
                    <div className="sq-squad-card__name" style={styles.name(isSelected)}>
                        {squad.squad_name}
                    </div>
                    <span style={styles.privacyBadge(isPublic)}>
                        {isPublic ? 'Public' : 'Private'}
                    </span>
                </div>
                <div className="sq-squad-card__niche" style={styles.niche}>
                    {squad.niche}
                </div>
                <div className="sq-squad-card__meta" style={styles.meta}>
                    {squad.members_count ??
                      (Array.isArray(squad.members)
                        ? squad.members.filter(Boolean).length
                        : 0)}{' '}
                    Members
                    <span style={styles.online}>
                        ● {squad.online || 0} Online
                    </span>
                </div>
            </div>

            <div style={styles.actions}>
                {onEdit ? (
                    <button
                        type="button"
                        style={styles.editBtn}
                        title="Edit squad"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                    >
                        <FiEdit2 size={14} />
                    </button>
                ) : null}
                <FiMoreVertical size={14} color="#4a5070" aria-hidden />
            </div>
        </div>
    );
};

const styles = {
    card: (active) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        borderRadius: '10px',
        cursor: 'pointer',
        marginBottom: '4px',
        background: active ? '#1e2a4a' : 'transparent',
        border: active ? '1px solid #2a3a6a' : '1px solid transparent',
        transition: 'all 0.15s',
    }),
    info: {
        flex: 1,
        minWidth: 0,
    },
    nameRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '3px',
        minWidth: 0,
    },
    name: (active) => ({
        fontSize: '13px',
        fontWeight: '700',
        color: active ? '#e8eeff' : '#c0c8e8',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flex: 1,
        minWidth: 0,
    }),
    privacyBadge: (isPublic) => ({
        flexShrink: 0,
        fontSize: '9px',
        fontWeight: '800',
        padding: '2px 6px',
        borderRadius: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        background: isPublic ? 'rgba(59, 130, 246, 0.2)' : 'rgba(100, 116, 139, 0.25)',
        color: isPublic ? '#93c5fd' : '#94a3b8',
    }),
    niche: {
        fontSize: '11px',
        color: '#4a5070',
        marginBottom: '2px',
    },
    meta: {
        fontSize: '11px',
        color: '#4a5070',
    },
    online: {
        color: '#10b981',
        marginLeft: '6px',
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flexShrink: 0,
    },
    editBtn: {
        background: 'transparent',
        border: 'none',
        color: '#93c5fd',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
    },
};

export default SquadCard;
