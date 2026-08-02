import { useCallback, useEffect, useState } from 'react';
import { REVIEW_SKILL_TAGS } from '../../../../components/reviews/writeReviewConstants';
import { memberAvatar } from '../components/workspace/squadWorkspaceData';

export { REVIEW_SKILL_TAGS };

const EMPTY_FORM = { projectId: '', stars: 0, text: '', tags: [] };

function validateForm(form, projects) {
  const errors = {};
  if (!form.projectId) errors.projectId = 'Please select a project.';
  else if (!projects.some((p) => p.id === form.projectId)) {
    errors.projectId = 'Please select a valid project.';
  }
  if (!form.stars || form.stars < 1) errors.stars = 'Please choose a star rating.';
  const text = form.text.trim();
  if (!text) errors.text = 'Review text is required.';
  else if (text.length > 500) errors.text = 'Review must be 500 characters or fewer.';
  return errors;
}

function mapProjectOption(row) {
  return {
    id: String(row.id || row._id || ''),
    label: row.title || row.name || 'Untitled Project',
  };
}

export default function useSquadWriteReview({
  projects = [],
  reviewerName = 'You',
  reviewerAvatar = '',
  onSubmitReview,
  submitReviewToApi,
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [options, setOptions] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingProjects(true);
    const mapped = (projects || []).map(mapProjectOption).filter((p) => p.id);
    setOptions(
      mapped.length
        ? mapped
        : [{ id: 'general', label: 'General squad engagement' }],
    );
    setLoadingProjects(false);
  }, [open, projects]);

  const openModal = useCallback(() => {
    setForm(EMPTY_FORM);
    setErrors({});
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setErrors({});
    setForm(EMPTY_FORM);
  }, []);

  const updateField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const toggleTag = useCallback((tagId) => {
    setForm((prev) => {
      const has = prev.tags.includes(tagId);
      return {
        ...prev,
        tags: has ? prev.tags.filter((id) => id !== tagId) : [...prev.tags, tagId],
      };
    });
  }, []);

  const submit = useCallback(async () => {
    const nextErrors = validateForm(form, options);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const project = options.find((p) => p.id === form.projectId);
    const tagLabels = REVIEW_SKILL_TAGS.filter((t) => form.tags.includes(t.id)).map((t) => t.label);
    const tagSuffix = tagLabels.length ? `\n\nHighlights: ${tagLabels.join(', ')}` : '';
    const now = new Date();
    const avatar = reviewerAvatar || memberAvatar(reviewerName);
    const row = {
      id: `sr-user-${now.getTime()}`,
      name: reviewerName,
      projectTitle: project?.label || 'Project',
      text: form.text.trim() + tagSuffix,
      stars: form.stars,
      rating: form.stars,
      imageurl: avatar,
      avatar,
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      skillTags: tagLabels,
    };

    try {
      await submitReviewToApi?.({
        buyer_user_id: String(
          localStorage.getItem('userId') || localStorage.getItem('user_id') || 'guest',
        ),
        buyer_name: reviewerName,
        buyer_avatar: avatar,
        project_id: form.projectId === 'general' ? '' : form.projectId,
        project_title: row.projectTitle,
        rating: form.stars,
        comment: form.text.trim(),
      });
    } catch {
      /* keep local row */
    }

    onSubmitReview?.(row);
    closeModal();
  }, [
    form,
    options,
    reviewerName,
    reviewerAvatar,
    onSubmitReview,
    submitReviewToApi,
    closeModal,
  ]);

  return {
    open,
    openModal,
    closeModal,
    form,
    errors,
    projects: options,
    loadingProjects,
    updateField,
    toggleTag,
    submit,
  };
}
