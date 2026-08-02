import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { ReviewCard, StarRating, toReviewCardProps } from '../../../../components/reviews';
import WriteReviewModal, { WriteReviewButton } from '../../../../components/reviews/WriteReviewModal';
import '../../../../components/reviews/write-review-modal.css';
import '../../Gigs/styles/GigsReviews.css';
import '../../Projects/styles/projects-reviews-page.css';
import useSquadReviews from '../hooks/useSquadReviews';
import useSquadWriteReview from '../hooks/useSquadWriteReview';
import { fetchSquadDetail } from '../api/squadsApi';
import { fetchSquadProjects } from '../api/squadProjectsApi';
import { memberAvatar } from '../components/workspace/squadWorkspaceData';
import { resolveDashboardMediaUrl } from '../../utils/dashboardMedia';
import '../styles/squad-view-all-pages.css';

const REVIEW_TABS = ['All Reviews', 'With Comments', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];

function filterByTab(rows, tab) {
  if (tab === 'All Reviews') return rows;
  if (tab === 'With Comments') return rows.filter((r) => String(r.text || '').trim());
  const match = tab.match(/^(\d)\sStars?$/);
  if (!match) return rows;
  const star = Number(match[1]);
  return rows.filter((r) => Math.round(Number(r.stars)) === star);
}

export default function SquadReviewsPage({ userData }) {
  const { id: squadId } = useParams();
  const [activeTab, setActiveTab] = useState('All Reviews');
  const [squad, setSquad] = useState(null);
  const [projects, setProjects] = useState([]);

  React.useEffect(() => {
    if (!squadId) return undefined;
    let alive = true;
    fetchSquadDetail(squadId)
      .then((data) => {
        if (!alive) return;
        setSquad(data?.squad || data?.data || data || null);
      })
      .catch(() => {
        if (alive) setSquad({ _id: squadId, squad_name: 'Squad' });
      });
    fetchSquadProjects(squadId)
      .then((data) => {
        if (!alive) return;
        const rows = Array.isArray(data) ? data : data?.projects || data?.data || [];
        setProjects(rows);
      })
      .catch(() => {
        if (alive) setProjects([]);
      });
    return () => {
      alive = false;
    };
  }, [squadId]);

  const squadName = squad?.squad_name || 'Squad';
  const { rows, summary, loading, addReview, submitReviewToApi } = useSquadReviews({
    squadId,
    squadName,
    limit: 40,
  });

  const reviewerName = `${userData?.first_name || 'You'} ${userData?.last_name || ''}`.trim();
  const reviewerAvatar =
    resolveDashboardMediaUrl(
      userData?.imageurl || userData?.profile_image_url || userData?.avatar,
    ) || memberAvatar(reviewerName);

  const writeReview = useSquadWriteReview({
    projects,
    reviewerName,
    reviewerAvatar,
    onSubmitReview: addReview,
    submitReviewToApi,
  });

  const breakdown = summary.breakdown?.length ? summary.breakdown : [];
  const totalRaw = Number(summary.total_reviews || 0);
  const total = Math.max(totalRaw, 1);
  const average = Number(summary.average_rating || 0);
  const visible = useMemo(() => filterByTab(rows, activeTab), [rows, activeTab]);

  return (
    <div className="sq-view-page">
      <header className="sq-view-page__bar">
        <Link to="/squads" className="sq-view-page__back">
          <FiArrowLeft size={16} aria-hidden /> Back to Squads
        </Link>
        <div className="sq-view-page__titles">
          <h1>{squadName} · Client Reviews</h1>
          <p>See what clients say about this squad’s work.</p>
        </div>
        <WriteReviewButton onClick={writeReview.openModal} />
      </header>

      <section className="ph-card ph-reviews-page reviews-shell sq-view-page__card">
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

        <div className="reviews-list">
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
                  imageurl: item.imageurl || item.avatar,
                })}
              />
            ))
          )}
        </div>
      </section>

      <WriteReviewModal
        open={writeReview.open}
        onClose={writeReview.closeModal}
        form={writeReview.form}
        errors={writeReview.errors}
        fieldKey="projectId"
        selectLabel="Select Project"
        selectPlaceholder="Select a squad project"
        introCopy="Share feedback for this squad. All fields are required."
        textPlaceholder="Describe your experience working with this squad…"
        targets={writeReview.projects}
        loadingTargets={writeReview.loadingProjects}
        onFieldChange={writeReview.updateField}
        onToggleTag={writeReview.toggleTag}
        onSubmit={writeReview.submit}
      />
    </div>
  );
}
