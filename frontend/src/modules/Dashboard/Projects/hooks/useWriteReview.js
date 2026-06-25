import { useCallback, useEffect, useState } from 'react';
import { REVIEW_SKILL_TAGS } from '../../../../components/reviews/writeReviewConstants';
import { MY_PROJECTS_ROWS } from '../data/projectsHubData';
import { fetchMyProjects, postProjectReview } from '../services/projectsApi';
import { getProjectsUserId } from '../services/projectsUser';

export { REVIEW_SKILL_TAGS };

const EMPTY_FORM = { projectId: '', stars: 0, text: '', tags: [] };

function isCompletedStatus(status) {
  return String(status || '').toLowerCase() === 'completed';
}

function mapProjectOption(row) {
  return {
    id: row.id || row._id,
    label: row.name || row.title || 'Untitled Project',
  };
}

function validateForm(form, projects) {
  const errors = {};
  if (!form.projectId) errors.projectId = 'Please select a project.';
  else if (!projects.some((p) => p.id === form.projectId)) {
    errors.projectId = 'Please select a valid completed project.';
  }
  if (!form.stars || form.stars < 1) errors.stars = 'Please choose a star rating.';
  const text = form.text.trim();
  if (!text) errors.text = 'Review text is required.';
  else if (text.length > 500) errors.text = 'Review must be 500 characters or fewer.';
  return errors;
}

function buildReviewRow(form, projects) {
  const project = projects.find((p) => p.id === form.projectId);
  const tagLabels = REVIEW_SKILL_TAGS.filter((t) => form.tags.includes(t.id)).map((t) => t.label);
  const tagSuffix = tagLabels.length ? `\n\nHighlights: ${tagLabels.join(', ')}` : '';
  const now = new Date();
  return {
    id: `pr-user-${now.getTime()}`,
    name: 'You',
    projectTitle: project?.label || 'Project',
    text: form.text.trim() + tagSuffix,
    stars: form.stars,
    date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    skillTags: tagLabels,
  };
}

export default function useWriteReview({ onSubmitReview }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const loadCompletedProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const userId = getProjectsUserId();
      if (userId) {
        const data = await fetchMyProjects(userId, 'completed');
        const rows = data?.projects || data?.rows || data?.items || [];
        const completed = rows.filter((r) => isCompletedStatus(r.status)).map(mapProjectOption);
        if (completed.length) {
          setProjects(completed);
          return;
        }
      }
    } catch {
      /* fallback below */
    }
    setProjects(
      MY_PROJECTS_ROWS.filter((r) => isCompletedStatus(r.status)).map(mapProjectOption),
    );
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    let alive = true;
    (async () => {
      await loadCompletedProjects();
      if (alive) setLoadingProjects(false);
    })();
    return () => {
      alive = false;
    };
  }, [open, loadCompletedProjects]);

  const openModal = useCallback(() => {
    setForm(EMPTY_FORM);
    setErrors({});
    setOpen(true);
    setLoadingProjects(true);
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
    const nextErrors = validateForm(form, projects);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const row = buildReviewRow(form, projects);
    const userId = getProjectsUserId();
    if (userId) {
      try {
        await postProjectReview({
          owner_user_id: userId,
          buyer_user_id: userId,
          buyer_name: 'You',
          project_id: form.projectId,
          project_title: row.projectTitle,
          rating: form.stars,
          comment: form.text.trim(),
        });
      } catch {
        /* still show locally */
      }
    }
    onSubmitReview?.(row);
    closeModal();
  }, [form, projects, onSubmitReview, closeModal]);

  return {
    open,
    openModal,
    closeModal,
    form,
    errors,
    projects,
    loadingProjects,
    updateField,
    toggleTag,
    submit,
  };
}
