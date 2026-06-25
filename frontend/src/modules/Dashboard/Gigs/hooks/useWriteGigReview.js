import { useCallback, useEffect, useState } from 'react';
import API from '../../../../api/axiosConfig';
import { REVIEW_SKILL_TAGS } from '../../../../components/reviews/writeReviewConstants';
import { submitGigReview } from '../services/gigsApi';
import { getGigsActorId, getGigsSessionHeaders, hasGigsSession } from '../utils/gigsSession';

const EMPTY_FORM = { gigId: '', stars: 0, text: '', tags: [] };

function isReviewableStatus(status) {
  const value = String(status || '').toLowerCase();
  return value === 'active' || value === 'published' || value === 'completed';
}

function mapGigOption(row) {
  return {
    id: String(row.id || row._id),
    label: row.title || row.name || 'Untitled Gig',
  };
}

function validateForm(form, gigs) {
  const errors = {};
  if (!form.gigId) errors.gigId = 'Please select a gig.';
  else if (!gigs.some((g) => g.id === form.gigId)) {
    errors.gigId = 'Please select a valid active gig.';
  }
  if (!form.stars || form.stars < 1) errors.stars = 'Please choose a star rating.';
  const text = form.text.trim();
  if (!text) errors.text = 'Review text is required.';
  else if (text.length > 500) errors.text = 'Review must be 500 characters or fewer.';
  if (!gigs.length) errors.gigId = 'No active gigs available to review.';
  return errors;
}

function buildReviewRow(form, gigs, apiReview) {
  const gig = gigs.find((g) => g.id === form.gigId);
  const tagLabels = REVIEW_SKILL_TAGS.filter((t) => form.tags.includes(t.id)).map((t) => t.label);
  const tagSuffix = tagLabels.length ? `\n\nHighlights: ${tagLabels.join(', ')}` : '';
  const now = new Date();
  return {
    id: apiReview?.id || `gr-user-${now.getTime()}`,
    name: apiReview?.buyer_name || 'You',
    gigTitle: apiReview?.gig_title || gig?.label || 'Gig',
    text: (apiReview?.comment || form.text.trim()) + (apiReview ? '' : tagSuffix),
    stars: Number(apiReview?.rating || form.stars),
    date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  };
}

export default function useWriteGigReview({ sellerUserId, onSubmitReview }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [gigs, setGigs] = useState([]);
  const [loadingGigs, setLoadingGigs] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadGigs = useCallback(async () => {
    setLoadingGigs(true);
    try {
      const userId = getGigsActorId();
      if (!hasGigsSession() || !userId) {
        setGigs([]);
        return;
      }
      const res = await API.get(`/api/gigs/my/${encodeURIComponent(userId)}`, {
        headers: getGigsSessionHeaders(),
      });
      const rows = Array.isArray(res?.data?.gigs) ? res.data.gigs : [];
      const active = rows
        .filter((g) => isReviewableStatus(g.status))
        .map((g, index) =>
          mapGigOption({
            id: g._id || `gig-${index}`,
            title: g.title,
            status: g.status,
          }),
        );
      setGigs(active);
    } catch {
      setGigs([]);
    } finally {
      setLoadingGigs(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    loadGigs();
    return undefined;
  }, [open, loadGigs]);

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
    const nextErrors = validateForm(form, gigs);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const buyerId = getGigsActorId();
    const sellerId = String(sellerUserId || buyerId).trim();
    const gig = gigs.find((g) => g.id === form.gigId);
    const tagLabels = REVIEW_SKILL_TAGS.filter((t) => form.tags.includes(t.id)).map((t) => t.label);
    const tagSuffix = tagLabels.length ? `\n\nHighlights: ${tagLabels.join(', ')}` : '';
    const comment = form.text.trim() + tagSuffix;

    setSubmitting(true);
    try {
      const saved = await submitGigReview({
        seller_user_id: sellerId,
        buyer_user_id: buyerId,
        buyer_name: localStorage.getItem('userName') || 'Client',
        gig_id: form.gigId,
        gig_title: gig?.label || 'Gig',
        rating: form.stars,
        comment,
      });
      onSubmitReview?.(buildReviewRow(form, gigs, saved));
      closeModal();
    } catch (err) {
      setErrors({ submit: err?.response?.data?.detail || err?.message || 'Could not save review.' });
    } finally {
      setSubmitting(false);
    }
  }, [form, gigs, onSubmitReview, closeModal, sellerUserId]);

  return {
    open,
    openModal,
    closeModal,
    form,
    errors,
    gigs,
    loadingGigs,
    submitting,
    updateField,
    toggleTag,
    submit,
  };
}
