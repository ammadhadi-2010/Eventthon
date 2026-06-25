import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createVideoPreviewState,
  pickVideoFileFromEvent,
  revokeVideoPreview,
  validateVideoFile,
} from '../postVideoUpload';
import { enhancePostText, submitPostWizard } from '../postWizardApi';
import { createEmptyMetaByType, getActiveMeta } from '../postWizardMeta';
import { createEmptyDrafts, POST_WIZARD_TYPES } from '../postWizardTypes';

export default function usePostWizard({ isOpen, type, userData, onSuccess, onClose }) {
  const [activeType, setActiveType] = useState(type || 'POST');
  const [draftsByType, setDraftsByType] = useState(createEmptyDrafts);
  const [metaByType, setMetaByType] = useState(createEmptyMetaByType);
  const [imageFile, setImageFile] = useState(null);
  const [videoState, setVideoState] = useState(null);
  const [enhancing, setEnhancing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const postContent = draftsByType[activeType] || '';
  const activeMeta = getActiveMeta(metaByType, activeType);

  const setPostContent = useCallback((value) => {
    setDraftsByType((prev) => ({
      ...prev,
      [activeType]: typeof value === 'function' ? value(prev[activeType] || '') : value,
    }));
  }, [activeType]);

  const resetWizard = useCallback(() => {
    setDraftsByType(createEmptyDrafts());
    setMetaByType(createEmptyMetaByType());
    setActiveType('POST');
    setImageFile(null);
    setVideoState((prev) => {
      revokeVideoPreview(prev);
      return null;
    });
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetWizard();
      return;
    }
    if (POST_WIZARD_TYPES.includes(type)) setActiveType(type);
  }, [isOpen, type, resetWizard]);

  const selectPostType = useCallback((nextType) => {
    if (!POST_WIZARD_TYPES.includes(nextType)) return;
    setActiveType(nextType);
  }, []);

  const setProjectProgress = useCallback((value) => {
    setMetaByType((prev) => ({
      ...prev,
      PROJECT: { ...prev.PROJECT, progress_percent: value },
    }));
  }, []);

  const setAchievementMetric = useCallback((value) => {
    setMetaByType((prev) => ({
      ...prev,
      WIN: { ...prev.WIN, achievement_metric: value },
    }));
  }, []);

  const setAttachToSquad = useCallback((value) => {
    setMetaByType((prev) => ({
      ...prev,
      SQUAD: { ...prev.SQUAD, attach_to_squad: Boolean(value) },
    }));
  }, []);

  const setSquadId = useCallback((value) => {
    setMetaByType((prev) => ({
      ...prev,
      SQUAD: { ...prev.SQUAD, squad_id: String(value || '') },
    }));
  }, []);

  const openImagePicker = () => imageInputRef.current?.click();
  const openVideoPicker = () => videoInputRef.current?.click();

  const onImageSelected = (event) => {
    const file = event?.target?.files?.[0] || null;
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      event.target.value = '';
      return;
    }
    setImageFile(file);
  };

  const onVideoSelected = (event) => {
    const file = pickVideoFileFromEvent(event);
    if (!file) return;
    const result = createVideoPreviewState(file);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    setVideoState((prev) => {
      revokeVideoPreview(prev);
      return result.state;
    });
  };

  const clearImage = () => {
    setImageFile(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const clearVideo = () => {
    setVideoState((prev) => {
      revokeVideoPreview(prev);
      return null;
    });
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const runAiEnhance = async () => {
    if (!postContent.trim()) {
      alert('Write something first, then enhance.');
      return;
    }
    setEnhancing(true);
    try {
      const enhanced = await enhancePostText(postContent, activeType);
      if (enhanced) setPostContent(enhanced);
    } catch (err) {
      console.error('AI enhance failed:', err);
      alert(err?.response?.data?.detail || 'AI enhance failed. Try again.');
    } finally {
      setEnhancing(false);
    }
  };

  const submitPost = async () => {
    if (!postContent.trim()) {
      alert('Please write your post first.');
      return;
    }
    if (videoState?.file) {
      const check = validateVideoFile(videoState.file);
      if (!check.ok) {
        alert(check.error);
        return;
      }
    }
    setSubmitting(true);
    try {
      const response = await submitPostWizard({
        content: postContent,
        postType: activeType,
        userData,
        imageFile,
        videoFile: videoState?.file || null,
        meta: activeMeta,
      });
      if (response?.status === 'success') {
        resetWizard();
        onSuccess?.();
        onClose?.();
        alert(`${activeType} shared successfully!`);
      } else {
        alert(response?.message || 'Post failed');
      }
    } catch (err) {
      console.error('Post submission failed:', err);
      alert(err?.response?.data?.message || err?.message || 'Backend connection error.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    activeType,
    selectPostType,
    postContent,
    setPostContent,
    projectProgress: activeMeta.progress_percent ?? 0,
    setProjectProgress,
    achievementMetric: activeMeta.achievement_metric || 'milestone',
    setAchievementMetric,
    attachToSquad: Boolean(activeMeta.attach_to_squad),
    setAttachToSquad,
    squadId: activeMeta.squad_id || '',
    setSquadId,
    imageFile,
    videoState,
    enhancing,
    submitting,
    imageInputRef,
    videoInputRef,
    openImagePicker,
    openVideoPicker,
    onImageSelected,
    onVideoSelected,
    clearImage,
    clearVideo,
    runAiEnhance,
    submitPost,
  };
}
