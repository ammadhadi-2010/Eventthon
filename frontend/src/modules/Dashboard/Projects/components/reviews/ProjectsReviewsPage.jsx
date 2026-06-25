import React, { useMemo, useState } from 'react';
import { ReviewCard, StarRating, toReviewCardProps } from '../../../../../components/reviews';
import useProjectReviews from '../../hooks/useProjectReviews';
import useWriteReview from '../../hooks/useWriteReview';
import WriteReviewModal, { WriteReviewButton } from '../../../../../components/reviews/WriteReviewModal';
import ProjectsReviewMobileCard from './ProjectsReviewMobileCard';
import '../../../../../components/reviews/write-review-modal.css';
import '../../../Gigs/styles/GigsReviews.css';
import '../../styles/projects-reviews-page.css';
import '../../styles/projects-reviews-mobile.css';

const REVIEW_TABS = ['All Reviews', 'With Comments', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];

function filterByTab(rows, tab) {
  if (tab === 'All Reviews') return rows;
  if (tab === 'With Comments') return rows.filter((r) => r.text.trim());
  const match = tab.match(/^(\d)\sStars?$/);
  if (!match) return rows;
  const star = Number(match[1]);
  return rows.filter((r) => Math.round(Number(r.stars)) === star);
}

export default function ProjectsReviewsPage() {
  const [activeTab, setActiveTab] = useState('All Reviews');
  const { rows, summary, loading, addReview } = useProjectReviews({ limit: 20 });
  const writeReview = useWriteReview({ onSubmitReview: addReview });

  const breakdown = summary.breakdown?.length ? summary.breakdown : [];
  const totalRaw = Number(summary.total_reviews || 0);
  const total = Math.max(totalRaw, 1);
  const average = Number(summary.average_rating || 0);
  const visible = useMemo(() => filterByTab(rows, activeTab), [rows, activeTab]);

  return (
    <section className="ph-card ph-reviews-page reviews-shell">
      <header className="reviews-head reviews-head-row">
        <div>
          <h2>Project Reviews</h2>
          <p>See what clients say about your completed projects.</p>
        </div>
        <WriteReviewButton onClick={writeReview.openModal} />
      </header>

      <div className="reviews-summary">
        <div className="reviews-score-card">
          <strong>{average.toFixed(1)}</strong>
          <span>Overall Rating</span>
          <StarRating rating={average} iconSize={14} />
          <small>({Math.max(totalRaw, 0)} ratings)</small>
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
        {REVIEW_TABS.map((tab) => (
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

      <div className="reviews-list ph-reviews-desktop-list">
        {loading ? (
          <p className="reviews-empty">Loading reviews…</p>
        ) : visible.length === 0 ? (
          <p className="reviews-empty">No reviews found for this filter.</p>
        ) : (
          visible.map((item) => (
            <ReviewCard
              key={item.id}
              variant="list"
              showReply
              {...toReviewCardProps({
                name: item.name,
                projectTag: item.projectTitle,
                stars: item.stars,
                text: item.text,
                date: item.date,
                imageurl: item.imageurl || item.imageUrl,
              })}
            />
          ))
        )}
      </div>

      <div className="ph-reviews-mobile-list" aria-label="Reviews">
        {loading ? (
          <p className="reviews-empty">Loading reviews…</p>
        ) : visible.length === 0 ? (
          <p className="reviews-empty">No reviews found for this filter.</p>
        ) : (
          visible.map((item) => <ProjectsReviewMobileCard key={item.id} item={item} />)
        )}
      </div>

      <WriteReviewModal
        open={writeReview.open}
        onClose={writeReview.closeModal}
        form={writeReview.form}
        errors={writeReview.errors}
        fieldKey="projectId"
        selectLabel="Select Project"
        selectPlaceholder="Select a project"
        introCopy="Share feedback for a completed project. All fields are required."
        textPlaceholder="Describe your experience working on this project…"
        targets={writeReview.projects}
        loadingTargets={writeReview.loadingProjects}
        onFieldChange={writeReview.updateField}
        onToggleTag={writeReview.toggleTag}
        onSubmit={writeReview.submit}
      />
    </section>
  );
}
