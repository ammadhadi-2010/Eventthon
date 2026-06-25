import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ReviewCard, StarRating, toReviewCardProps } from '../../../../components/reviews';
import WriteReviewModal, { WriteReviewButton } from '../../../../components/reviews/WriteReviewModal';
import '../../../../components/reviews/write-review-modal.css';
import API from '../../../../api/axiosConfig';
import { defaultRatingBreakdown, reviewTabs } from '../data/gigsReviewsSeed';
import useWriteGigReview from '../hooks/useWriteGigReview';
import { getGigsActorId, getGigsSessionHeaders } from '../utils/gigsSession';
import GigsReviewMobileCard from './GigsReviewMobileCard';
import { GigsHubBackButton } from './GigsHubBackButton';
import '../../Projects/styles/projects-reviews-page.css';
import '../styles/GigsReviews.css';
import '../styles/gigs-reviews-mobile.css';

function getSellerId() {
  return getGigsActorId();
}

const EMPTY_SUMMARY = { average_rating: 0, total_reviews: 0, breakdown: defaultRatingBreakdown };

function bumpSummary(prev, stars) {
  const rounded = Math.min(5, Math.max(1, Math.round(Number(stars) || 0)));
  const breakdown = (prev.breakdown?.length ? prev.breakdown : defaultRatingBreakdown).map((row) =>
    row.stars === rounded ? { ...row, count: row.count + 1 } : row,
  );
  const total = Number(prev.total_reviews || 0) + 1;
  const oldAvg = Number(prev.average_rating || 0);
  const oldTotal = Number(prev.total_reviews || 0);
  const average = oldTotal > 0 ? (oldAvg * oldTotal + rounded) / total : rounded;
  return { average_rating: average, total_reviews: total, breakdown };
}

const ReviewsContent = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('All Reviews');
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(false);
  const sellerId = useMemo(() => getSellerId(), []);
  const addReview = useCallback((review) => {
    if (!review?.id) return;
    setRows((prev) => [review, ...prev]);
    setSummary((prev) => bumpSummary(prev, review.stars));
  }, []);
  const writeReview = useWriteGigReview({ sellerUserId: sellerId, onSubmitReview: addReview });

  useEffect(() => {
    if (!sellerId) return undefined;
    let alive = true;
    const run = async () => {
      setLoading(true);
      try {
        const isWithComments = activeTab === 'With Comments';
        const starsMatch = activeTab.match(/^(\d)\sStars?$/);
        const stars = starsMatch ? Number(starsMatch[1]) : 0;
        const res = await API.get('/api/gigs/reviews/summary', {
          headers: getGigsSessionHeaders(),
          params: { seller_user_id: sellerId, with_comments: isWithComments, stars },
        });
        if (!alive) return;
        const apiSummary = res?.data?.summary || {};
        const apiRows = Array.isArray(res?.data?.reviews) ? res.data.reviews : [];
        setSummary({
          average_rating: Number(apiSummary.average_rating || 0),
          total_reviews: Number(apiSummary.total_reviews || 0),
          breakdown: Array.isArray(apiSummary.breakdown) && apiSummary.breakdown.length > 0
            ? apiSummary.breakdown
            : defaultRatingBreakdown,
        });
        setRows(apiRows.map((row) => ({
          id: row.id,
          name: row.buyer_name || 'Client',
          gigTitle: row.gig_title || 'Gig',
          text: row.comment || '',
          stars: Number(row.rating || 0),
          date: row.created_at
            ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '--',
        })));
      } catch {
        if (!alive) return;
        setRows([]);
        setSummary(EMPTY_SUMMARY);
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => { alive = false; };
  }, [sellerId, activeTab]);

  const visibleReviews = useMemo(() => {
    if (activeTab === 'All Reviews') return rows;
    if (activeTab === 'With Comments') return rows.filter((row) => row.text.trim());
    const starMatch = activeTab.match(/^(\d)\sStars?$/);
    if (!starMatch) return rows;
    return rows.filter((row) => Math.round(Number(row.stars)) === Number(starMatch[1]));
  }, [activeTab, rows]);

  const breakdown = summary.breakdown?.length ? summary.breakdown : defaultRatingBreakdown;
  const totalRaw = Number(summary.total_reviews || breakdown.reduce((sum, row) => sum + Number(row.count || 0), 0) || 0);
  const total = Math.max(totalRaw, 1);
  const average = Number(summary.average_rating || 0);

  const listBody = loading ? (
    <p className="reviews-empty">Loading reviews…</p>
  ) : visibleReviews.length === 0 ? (
    <p className="reviews-empty">No reviews found for this filter.</p>
  ) : null;

  return (
    <div className="gigs-reviews-view">
      <header className="gigs-reviews-hero ghub-section-head">
        <GigsHubBackButton onBack={onBack} />
        <div className="ghub-section-head__copy">
          <h1>Reviews</h1>
          <p>Ratings and feedback from clients on your gigs.</p>
        </div>
      </header>

      <section className="gigs-card gigs-reviews-page reviews-shell ph-reviews-page">
        <header className="reviews-head reviews-head-row">
          <div>
            <h2>Gig Reviews</h2>
            <p>See what your clients say about your work.</p>
          </div>
          <WriteReviewButton onClick={writeReview.openModal} />
        </header>

        <div className="reviews-summary">
          <div className="reviews-score-card">
            <strong>{average.toFixed(1)}</strong>
            <span>Overall Rating</span>
            <StarRating rating={average} iconSize={14} />
            <small>({Math.max(totalRaw, 0)} Ratings)</small>
          </div>
          <div className="reviews-breakdown">
            {breakdown.map((row) => (
              <div key={row.stars} className="reviews-row">
                <span>{row.stars} Stars</span>
                <div className="reviews-track">
                  <i style={{ width: `${Math.max(2, Math.round((row.count / total) * 100))}%` }} />
                </div>
                <small>{row.count}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="reviews-tabs" role="tablist" aria-label="Review filters">
          {reviewTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={activeTab === tab ? 'is-active' : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="reviews-list gigs-reviews-desktop-list">
          {listBody || visibleReviews.map((item) => (
            <ReviewCard
              key={item.id}
              variant="list"
              {...toReviewCardProps({
                name: item.name,
                gigTitle: item.gigTitle,
                stars: item.stars,
                text: item.text,
                date: item.date,
              })}
            />
          ))}
        </div>

        <div className="gigs-reviews-mobile-list" aria-label="Reviews">
          {listBody || visibleReviews.map((item) => (
            <GigsReviewMobileCard key={`m-${item.id}`} item={item} />
          ))}
        </div>

        <WriteReviewModal
          open={writeReview.open}
          onClose={writeReview.closeModal}
          form={writeReview.form}
          errors={writeReview.errors}
          fieldKey="gigId"
          selectLabel="Select Gig"
          selectPlaceholder="Select a gig"
          introCopy="Share feedback for an active gig. All fields are required."
          textPlaceholder="Describe your experience with this gig…"
          targets={writeReview.gigs}
          loadingTargets={writeReview.loadingGigs}
          onFieldChange={writeReview.updateField}
          onToggleTag={writeReview.toggleTag}
          onSubmit={writeReview.submit}
        />
      </section>
    </div>
  );
};

export default ReviewsContent;
