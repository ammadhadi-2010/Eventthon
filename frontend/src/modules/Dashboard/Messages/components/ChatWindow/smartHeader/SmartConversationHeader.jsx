import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiMoreHorizontal,
  FiPhoneCall,
  FiSidebar,
  FiVideo,
} from 'react-icons/fi';
import HeaderCollabActions from './HeaderCollabActions';
import { resolveSmartHeaderMeta } from './resolveSmartHeaderMeta';
import SmartHeaderJobCard from './SmartHeaderJobCard';
import './smart-conversation-header.css';

export default function SmartConversationHeader({
  selectedMessage,
  headerMenuOpen,
  headerMenuRef,
  onOpenAudioCall,
  onOpenVideoCall,
  onScheduleInterview,
  onToggleHeaderMenu,
  onHeaderMenuAction,
  onBack,
  onOpenWorkspace,
  assignment = null,
  isTyping = false,
  onAssignmentChange,
  onInsertMention,
  aiOpen = false,
  onToggleAi,
}) {
  const meta = useMemo(() => resolveSmartHeaderMeta(selectedMessage), [selectedMessage]);
  const [moreStyle, setMoreStyle] = useState(null);

  const toggleMore = (event) => {
    const btn = event.currentTarget;
    const nextOpen = !headerMenuOpen;
    if (nextOpen && btn) {
      const rect = btn.getBoundingClientRect();
      const width = Math.min(240, window.innerWidth - 16);
      setMoreStyle({
        position: 'fixed',
        top: Math.min(rect.bottom + 6, window.innerHeight - 160),
        left: Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8),
        width,
        right: 'auto',
        zIndex: 1300,
      });
    } else {
      setMoreStyle(null);
    }
    onToggleHeaderMenu?.();
  };

  return (
    <motion.header
      className="sch-head"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="sch-head__top">
        <div className="sch-head__identity">
          {onBack ? (
            <button type="button" className="sch-head__back" onClick={onBack} aria-label="Back to conversations">
              <FiArrowLeft size={16} />
            </button>
          ) : null}

          <div className="sch-head__avatar-wrap">
            <img className="sch-head__avatar" src={meta.avatarUrl} alt="" />
            <span
              className={`sch-head__presence sch-head__presence--${meta.onlineStatus}`}
              title={meta.onlineStatus}
              aria-label={meta.onlineStatus}
            />
            {meta.isVerified ? (
              <span className="sch-head__verified" title="Verified">
                <FiCheck size={10} strokeWidth={3} aria-hidden />
              </span>
            ) : null}
          </div>

          <div className="sch-head__copy">
            <div className="sch-head__name-row">
              <h3>{meta.displayName}</h3>
              <span className={`sch-stage sch-stage--${meta.stage.key}`}>{meta.stage.label}</span>
            </div>
            <p className="sch-head__status">
              <em className={`sch-online sch-online--${meta.onlineStatus}`}>
                {meta.onlineStatus === 'online' ? 'Online' : meta.onlineStatus === 'away' ? 'Away' : 'Offline'}
              </em>
              {isTyping ? (
                <>
                  <span aria-hidden>·</span>
                  <span className="sch-typing">Typing…</span>
                </>
              ) : null}
              <span aria-hidden>·</span>
              <span>{selectedMessage?.chat_tag || (meta.isSupport ? 'Admin Support' : 'Candidate')}</span>
              {assignment?.assigneeName ? (
                <>
                  <span aria-hidden>·</span>
                  <span className="sch-assigned">Assigned: {assignment.assigneeName}</span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="sch-head__actions">
          {onOpenWorkspace ? (
            <button
              type="button"
              className="sch-action sch-action--workspace"
              onClick={onOpenWorkspace}
              title="Workspace"
              aria-label="Open workspace"
            >
              <FiSidebar size={15} aria-hidden />
              <span>Workspace</span>
            </button>
          ) : null}
          <HeaderCollabActions
            selectedMessage={selectedMessage}
            assignment={assignment}
            onAssignmentChange={onAssignmentChange}
            onInsertMention={onInsertMention}
            aiOpen={aiOpen}
            onToggleAi={onToggleAi}
          />
          <button type="button" className="sch-action" onClick={onOpenAudioCall} title="Voice call">
            <FiPhoneCall size={15} aria-hidden />
            <span>Voice</span>
          </button>
          <button type="button" className="sch-action" onClick={onOpenVideoCall} title="Video call">
            <FiVideo size={15} aria-hidden />
            <span>Video</span>
          </button>
          <button
            type="button"
            className="sch-action sch-action--accent"
            onClick={onScheduleInterview}
            title="Schedule interview"
            disabled={meta.isSupport}
          >
            <FiCalendar size={15} aria-hidden />
            <span>Interview</span>
          </button>
          <div className="sch-more" ref={headerMenuRef}>
            <button
              type="button"
              className="sch-action sch-action--icon"
              onClick={toggleMore}
              aria-label="More"
              aria-expanded={headerMenuOpen}
            >
              <FiMoreHorizontal size={16} />
            </button>
            {headerMenuOpen
              ? createPortal(
                <motion.div
                  className="sch-more__menu"
                  role="menu"
                  style={moreStyle || undefined}
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.16 }}
                >
                  <button type="button" role="menuitem" onClick={() => onHeaderMenuAction('manage_conversations')}>
                    Manage conversations
                  </button>
                  <button type="button" role="menuitem" onClick={() => onHeaderMenuAction('away_message')}>
                    Set away message
                  </button>
                  <button type="button" role="menuitem" onClick={() => onHeaderMenuAction('manage_settings')}>
                    Manage settings
                  </button>
                  {!meta.isSupport ? (
                    <button type="button" role="menuitem" onClick={() => onHeaderMenuAction('view_profile')}>
                      View profile
                    </button>
                  ) : null}
                  {onOpenWorkspace ? (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onOpenWorkspace();
                        onHeaderMenuAction?.('close');
                      }}
                    >
                      Open workspace
                    </button>
                  ) : null}
                </motion.div>,
                document.body,
              )
              : null}
          </div>
        </div>
      </div>

      {!meta.isSupport ? <SmartHeaderJobCard job={meta.job} /> : (
        <SmartHeaderJobCard
          job={{
            id: meta.job.id,
            title: meta.job.title,
            salaryRange: 'Platform support',
            recruiter: meta.job.recruiter,
          }}
          compact
        />
      )}
    </motion.header>
  );
}
