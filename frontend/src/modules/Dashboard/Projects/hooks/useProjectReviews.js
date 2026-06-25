import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchProjectReviewsSummary } from '../services/projectsApi';
import { getProjectsUserId } from '../services/projectsUser';

const DEFAULT_BREAKDOWN = [
  { stars: 5, count: 2 },
  { stars: 4, count: 1 },
  { stars: 3, count: 0 },
  { stars: 2, count: 0 },
  { stars: 1, count: 0 },
];

const FALLBACK_REVIEWS = [
  {
    id: 'pr-f1',
    name: 'John O.',
    projectTitle: 'Squad Portal Redesign',
    text: 'Delivered a polished redesign on schedule. Great collaboration.',
    stars: 5,
    date: 'Jun 4, 2025',
  },
  {
    id: 'pr-f2',
    name: 'Sarah M.',
    projectTitle: 'Game Matchmaking API',
    text: 'Solid architecture and clear documentation for handoff.',
    stars: 5,
    date: 'May 29, 2025',
  },
  {
    id: 'pr-f3',
    name: 'Mike T.',
    projectTitle: 'SEO Analytics Dashboard',
    text: 'Strong analytics UX. Minor tweaks needed post-launch.',
    stars: 4,
    date: 'May 26, 2025',
  },
];

function mapReviewRow(row) {
  return {
    id: row.id,
    name: row.buyer_name || row.name || 'Client',
    projectTitle: row.project_title || row.projectTitle || 'Project',
    text: row.comment || row.text || '',
    stars: Number(row.rating ?? row.stars ?? 0),
    imageurl: row.imageurl || row.image_url || row.avatar_url || row.buyer_avatar || '',
    date: row.created_at
      ? new Date(row.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : row.date || '',
  };
}

export default function useProjectReviews({ limit = 3 } = {}) {
  const userId = useMemo(() => getProjectsUserId(), []);
  const [rows, setRows] = useState(FALLBACK_REVIEWS);
  const [summary, setSummary] = useState({
    average_rating: 4.9,
    total_reviews: 3,
    breakdown: DEFAULT_BREAKDOWN,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return undefined;
    let alive = true;

    const run = async () => {
      setLoading(true);
      try {
        const data = await fetchProjectReviewsSummary(userId, limit);
        if (!alive) return;
        const apiSummary = data.summary || {};
        const apiRows = Array.isArray(data.reviews) ? data.reviews : [];
        setSummary({
          average_rating: Number(apiSummary.average_rating || 0),
          total_reviews: Number(apiSummary.total_reviews || 0),
          breakdown:
            Array.isArray(apiSummary.breakdown) && apiSummary.breakdown.length
              ? apiSummary.breakdown
              : DEFAULT_BREAKDOWN,
        });
        setRows(apiRows.length ? apiRows.map(mapReviewRow) : FALLBACK_REVIEWS);
      } catch {
        if (!alive) return;
        setRows(FALLBACK_REVIEWS);
        setSummary({ average_rating: 4.9, total_reviews: 3, breakdown: DEFAULT_BREAKDOWN });
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [userId, limit]);

  const addReview = useCallback((review) => {
    if (!review?.id) return;
    setRows((prev) => [review, ...prev]);
    setSummary((prev) => {
      const stars = Math.min(5, Math.max(1, Math.round(Number(review.stars) || 0)));
      const breakdown = (prev.breakdown?.length ? prev.breakdown : DEFAULT_BREAKDOWN).map((row) =>
        row.stars === stars ? { ...row, count: row.count + 1 } : row,
      );
      const total = Number(prev.total_reviews || 0) + 1;
      const oldAvg = Number(prev.average_rating || 0);
      const oldTotal = Number(prev.total_reviews || 0);
      const average = oldTotal > 0 ? (oldAvg * oldTotal + stars) / total : stars;
      return { average_rating: average, total_reviews: total, breakdown };
    });
  }, []);

  return { userId, rows, summary, loading, addReview };
}
