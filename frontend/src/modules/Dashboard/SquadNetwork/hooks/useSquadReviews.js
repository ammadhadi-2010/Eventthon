import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchProjectReviewsSummary,
  postProjectReview,
} from '../../Projects/services/projectsApi';
import { memberAvatar } from '../components/workspace/squadWorkspaceData';

export function squadReviewOwnerId(squadId) {
  return `squad:${String(squadId || '').trim()}`;
}

const DEFAULT_BREAKDOWN = [
  { stars: 5, count: 2 },
  { stars: 4, count: 1 },
  { stars: 3, count: 0 },
  { stars: 2, count: 0 },
  { stars: 1, count: 0 },
];

function seedReviews(squadName = 'Squad') {
  return [
    {
      id: 'sr-seed-1',
      name: 'Sarah Chen',
      projectTitle: `${squadName} delivery`,
      text: 'Outstanding work. Delivered ahead of schedule!',
      stars: 5,
      imageurl: memberAvatar('Sarah Chen'),
      date: 'Jun 12, 2025',
    },
    {
      id: 'sr-seed-2',
      name: 'Marcus Webb',
      projectTitle: 'Client sprint',
      text: 'Professional team, clear communication, great results.',
      stars: 5,
      imageurl: memberAvatar('Marcus Webb'),
      date: 'May 28, 2025',
    },
    {
      id: 'sr-seed-3',
      name: 'Priya Nair',
      projectTitle: 'ML engagement',
      text: 'Strong technical depth. Would hire again.',
      stars: 4,
      imageurl: memberAvatar('Priya Nair'),
      date: 'May 10, 2025',
    },
  ];
}

function mapReviewRow(row) {
  const name = row.buyer_name || row.name || 'Client';
  return {
    id: row.id,
    name,
    projectTitle: row.project_title || row.projectTitle || 'Project',
    text: row.comment || row.text || '',
    stars: Number(row.rating ?? row.stars ?? 0),
    rating: Number(row.rating ?? row.stars ?? 0),
    imageurl:
      row.buyer_avatar ||
      row.imageurl ||
      row.image_url ||
      row.avatar_url ||
      row.avatar ||
      memberAvatar(name, row.id),
    avatar:
      row.buyer_avatar ||
      row.imageurl ||
      row.image_url ||
      row.avatar_url ||
      row.avatar ||
      memberAvatar(name, row.id),
    date: row.created_at
      ? new Date(row.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : row.date || '',
  };
}

export default function useSquadReviews({ squadId, squadName, limit = 20 } = {}) {
  const ownerId = useMemo(() => squadReviewOwnerId(squadId), [squadId]);
  const seeds = useMemo(() => seedReviews(squadName), [squadName]);
  const [rows, setRows] = useState(seeds);
  const [summary, setSummary] = useState({
    average_rating: 4.9,
    total_reviews: 3,
    breakdown: DEFAULT_BREAKDOWN,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRows(seeds);
  }, [seeds]);

  useEffect(() => {
    if (!ownerId || ownerId === 'squad:') return undefined;
    let alive = true;

    const run = async () => {
      setLoading(true);
      try {
        const data = await fetchProjectReviewsSummary(ownerId, limit);
        if (!alive) return;
        const apiSummary = data.summary || {};
        const apiRows = Array.isArray(data.reviews) ? data.reviews : [];
        const mapped = apiRows.map(mapReviewRow);
        const looksLikeSeed = mapped.every((r) => String(r.id || '').startsWith('pr-seed'));
        setSummary({
          average_rating: Number(apiSummary.average_rating || 0) || 4.9,
          total_reviews: Number(apiSummary.total_reviews || 0) || mapped.length || 3,
          breakdown:
            Array.isArray(apiSummary.breakdown) && apiSummary.breakdown.length
              ? apiSummary.breakdown
              : DEFAULT_BREAKDOWN,
        });
        setRows(looksLikeSeed || !mapped.length ? seeds : mapped);
      } catch {
        if (!alive) return;
        setRows(seeds);
        setSummary({ average_rating: 4.9, total_reviews: 3, breakdown: DEFAULT_BREAKDOWN });
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [ownerId, limit, seeds]);

  const addReview = useCallback((review) => {
    if (!review?.id) return;
    const withAvatar = {
      ...review,
      rating: review.stars ?? review.rating,
      avatar: review.avatar || review.imageurl || memberAvatar(review.name),
      imageurl: review.imageurl || review.avatar || memberAvatar(review.name),
    };
    setRows((prev) => [withAvatar, ...prev]);
    setSummary((prev) => {
      const stars = Math.min(5, Math.max(1, Math.round(Number(review.stars) || 0)));
      const breakdown = (prev.breakdown?.length ? prev.breakdown : DEFAULT_BREAKDOWN).map((row) =>
        row.stars === stars ? { ...row, count: row.count + 1 } : row,
      );
      const total = Number(prev.total_reviews || 0) + 1;
      const oldAvg = Number(prev.average_rating || 0);
      const oldTotal = Number(prev.total_reviews || 0);
      const average = oldTotal > 0 ? (oldAvg * oldTotal + stars) / total : stars;
      return { average_rating: Number(average.toFixed(1)), total_reviews: total, breakdown };
    });
  }, []);

  const submitReviewToApi = useCallback(
    async (payload) => {
      if (!ownerId || ownerId === 'squad:') return null;
      return postProjectReview({
        ...payload,
        owner_user_id: ownerId,
      });
    },
    [ownerId],
  );

  return { ownerId, rows, summary, loading, addReview, submitReviewToApi };
}
