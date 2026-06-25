import React, { useEffect } from 'react';
import { FiCalendar, FiClock, FiImage, FiPlusCircle, FiStar, FiUsers, FiVideo } from 'react-icons/fi';
import StandardPost from './PostTypes/StandardPost';
import WinPost from './PostTypes/WinPost';
import PostModalHeader from './PostModalHeader';
import PostModalAttachments from './PostModalAttachments';
import PostModalTypeTabs from './PostModalTypeTabs';
import PostModalContextFields from './PostModalContextFields';
import PostModalSquadPanel from './PostModalSquadPanel';
import usePostWizard from './hooks/usePostWizard';
import { POST_TYPE_COLORS, submitLabelForType } from './postWizardTypes';
import './post-modal.css';
import './post-modal-mobile.css';

function TypeBanner({ type }) {
  if (type === 'SQUAD') {
    return (
      <div className="post-modal__type-alert" style={{ background: '#a855f715', color: '#a855f7' }}>
        <FiUsers /> <strong>Squad Mode:</strong> Your question will reach experts.
      </div>
    );
  }
  if (type === 'PROJECT') {
    return (
      <div className="post-modal__type-alert" style={{ background: '#10b98115', color: '#10b981' }}>
        <FiPlusCircle /> <strong>Project Mode:</strong> Start a new collab.
      </div>
    );
  }
  if (type === 'WIN') {
    return (
      <div className="post-modal__type-alert" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
        <FiStar /> <strong>Achievement Mode:</strong> Celebrate your success!
      </div>
    );
  }
  return null;
}

const PostModal = ({ isOpen, onClose, type, userData, onSuccess }) => {
  const wizard = usePostWizard({ isOpen, type, userData, onSuccess, onClose });

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeType = wizard.activeType;
  const busy = wizard.enhancing || wizard.submitting;

  return (
    <div className="post-modal__overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="post-modal__panel" onClick={(event) => event.stopPropagation()}>
        <div className="post-modal__sheet-handle" aria-hidden />

        <PostModalHeader userData={userData} type={activeType} onClose={onClose} />

        <div className="post-modal__banner-wrap">
          <TypeBanner type={activeType} />
        </div>

        <div className="post-modal__body">
          {activeType === 'WIN' ? (
            <WinPost userData={userData} value={wizard.postContent} onChange={wizard.setPostContent} />
          ) : (
            <StandardPost userData={userData} value={wizard.postContent} onChange={wizard.setPostContent} />
          )}
          <PostModalContextFields
            activeType={activeType}
            projectProgress={wizard.projectProgress}
            onProjectProgressChange={wizard.setProjectProgress}
            achievementMetric={wizard.achievementMetric}
            onAchievementMetricChange={wizard.setAchievementMetric}
            disabled={busy}
          />
          {activeType === 'SQUAD' ? (
            <PostModalSquadPanel
              attachToSquad={wizard.attachToSquad}
              squadId={wizard.squadId}
              onAttachChange={wizard.setAttachToSquad}
              onSquadIdChange={wizard.setSquadId}
              disabled={busy}
            />
          ) : null}
          <PostModalAttachments
            imageFile={wizard.imageFile}
            videoState={wizard.videoState}
            onClearImage={wizard.clearImage}
            onClearVideo={wizard.clearVideo}
            imageInputRef={wizard.imageInputRef}
            videoInputRef={wizard.videoInputRef}
            onImageSelected={wizard.onImageSelected}
            onVideoSelected={wizard.onVideoSelected}
          />
        </div>

        <PostModalTypeTabs
          activeType={activeType}
          onSelect={wizard.selectPostType}
          disabled={busy}
        />

        <div className="post-modal__footer">
          <div className="post-modal__tools">
            <button
              type="button"
              className="post-modal__ai-btn"
              onClick={wizard.runAiEnhance}
              disabled={busy}
            >
              {wizard.enhancing ? 'Enhancing...' : '✨ AI Enhance'}
            </button>
            <button type="button" className="post-modal__icon-btn" onClick={wizard.openImagePicker} disabled={busy} aria-label="Attach image">
              <FiImage />
            </button>
            <button type="button" className="post-modal__icon-btn" onClick={wizard.openVideoPicker} disabled={busy} aria-label="Attach video">
              <FiVideo />
            </button>
            <FiCalendar className="post-modal__icon-btn" />
          </div>
          <div className="post-modal__submit-row">
            <FiClock style={{ color: '#64748b' }} />
            <button
              type="button"
              className="post-modal__submit"
              style={{ background: POST_TYPE_COLORS[activeType] || POST_TYPE_COLORS.POST }}
              onClick={wizard.submitPost}
              disabled={busy}
            >
              {wizard.submitting ? 'Posting...' : submitLabelForType(activeType)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
