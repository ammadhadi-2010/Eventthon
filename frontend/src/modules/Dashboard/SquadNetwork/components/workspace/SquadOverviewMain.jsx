import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import {
  DEFAULT_PORTFOLIO,
  SQUAD_FEATURE_CARDS,
  memberAvatar,
} from './squadWorkspaceData';
import SquadOverviewProjectCard from './SquadOverviewProjectCard';
import useSquadReviews from '../../hooks/useSquadReviews';
import useSquadWriteReview from '../../hooks/useSquadWriteReview';
import WriteReviewModal, { WriteReviewButton } from '../../../../../components/reviews/WriteReviewModal';
import '../../../../../components/reviews/write-review-modal.css';
import '../../../Gigs/styles/GigsReviews.css';
import { resolveDashboardMediaUrl } from '../../../utils/dashboardMedia';
import { resolveSquadProjectCover } from '../projects/squadProjectCardModel';
import '../../styles/squad-workspace.css';

function Stars({ value = 5 }) {
  const n = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return (
    <span className="sq-ws-stars" aria-label={`${n} stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <FiStar
          key={i}
          size={12}
          className={i < n ? 'sq-ws-stars__on' : 'sq-ws-stars__off'}
          fill={i < n ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  );
}

function buildPortfolio(projects = [], custom = []) {
  if (custom?.length) return custom;
  const fromProjects = projects.slice(0, 6).map((p, i) => ({
    id: p.id || p._id || `p-${i}`,
    title: p.title || p.name || 'Project',
    image: resolveSquadProjectCover(p),
    demoUrl: p.live_url || p.liveUrl || '#',
  }));
  return fromProjects.length ? fromProjects : DEFAULT_PORTFOLIO;
}

export default function SquadOverviewMain({ squad, state, onTabChange, userData }) {
  const navigate = useNavigate();
  const projects = state?.projects || [];
  const feed = state?.activityFeed || [];
  const portfolio = buildPortfolio(projects, state?.portfolio);
  const squadId = squad?._id || squad?.id;
  const tags = [
    squad?.niche,
    ...(Array.isArray(squad?.skills) ? squad.skills : []),
    'SEO',
    'Digital Marketing',
    'Content Strategy',
  ].filter(Boolean);
  const uniqueTags = [...new Set(tags)].slice(0, 6);

  const { rows: reviews, summary, addReview, submitReviewToApi } = useSquadReviews({
    squadId,
    squadName: squad?.squad_name,
    limit: 8,
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

  const overallRating = Number(summary?.average_rating || squad?.rating || 4.9);

  const openReviewsPage = () => {
    if (squadId) navigate(`/squads/${squadId}/reviews`);
  };
  const openPortfolioPage = () => {
    if (squadId) navigate(`/squads/${squadId}/portfolio`);
  };

  return (
    <div className="sq-ws-stack">
      <section className="sq-ws-glass sq-ws-pad">
        <div className="sq-ws-section-head">
          <h3 className="sq-ws-card-title">About Squad</h3>
        </div>
        <p className="sq-ws-text-body">
          {squad?.description ||
            'A squad for experts to share knowledge, ship projects, and grow together.'}
        </p>
        <div className="sq-ws-tags">
          {uniqueTags.map((tag) => (
            <span key={tag} className="sq-ws-tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="sq-ws-features">
          {SQUAD_FEATURE_CARDS.map((f) => (
            <div key={f.title} className="sq-ws-feature">
              <strong>{f.title}</strong>
              <span>{f.subtitle}</span>
              <span
                style={{
                  color: f.tone === 'gold' ? '#fbbf24' : '#34d399',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                }}
              >
                {f.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="sq-ws-glass sq-ws-pad">
        <div className="sq-ws-section-head">
          <h3 className="sq-ws-card-title">Active Projects</h3>
          <button
            type="button"
            className="sq-ws-view-all"
            onClick={() => onTabChange?.('Projects')}
          >
            View all
          </button>
        </div>
        {projects.length === 0 ? (
          <p className="sq-ws-text-meta">No projects yet.</p>
        ) : (
          <div className="sq-ws-mini-project-grid">
            {projects.slice(0, 2).map((project) => (
              <SquadOverviewProjectCard
                key={project.id || project.title}
                project={project}
              />
            ))}
          </div>
        )}
      </section>

      <div className="sq-ws-triple">
        <section className="sq-ws-glass sq-ws-pad">
          <div className="sq-ws-section-head">
            <h3 className="sq-ws-card-title">Recent Activity</h3>
            <button
              type="button"
              className="sq-ws-view-all"
              onClick={() => onTabChange?.('Activity')}
            >
              View all
            </button>
          </div>
          {(feed.length
            ? feed
            : [{ text: 'No activity yet', actor_name: '—', time: '' }]
          )
            .slice(0, 4)
            .map((item) => (
              <div key={item.id || item.text} className="sq-ws-feed-item">
                <strong>{item.actor_name || item.actor || 'Member'}</strong>{' '}
                {item.text || item.message}
                <div className="sq-ws-text-meta">
                  {item.time || item.created_at || 'Recently'}
                </div>
              </div>
            ))}
        </section>

        <section className="sq-ws-glass sq-ws-pad">
          <div className="sq-ws-section-head">
            <h3 className="sq-ws-card-title">Client Reviews</h3>
            <button type="button" className="sq-ws-view-all" onClick={openReviewsPage}>
              View all
            </button>
          </div>
          <div className="sq-ws-review-summary">
            <strong>{overallRating}</strong>
            <Stars value={overallRating} />
            <span className="sq-ws-text-meta">Overall</span>
            <WriteReviewButton onClick={writeReview.openModal} />
          </div>
          {reviews.slice(0, 3).map((review) => {
            const avatar =
              review.avatar ||
              review.imageurl ||
              memberAvatar(review.name, review.avatarSeed || review.id);
            return (
              <div key={review.id || review.name} className="sq-ws-review">
                <img src={avatar} alt="" className="sq-ws-review__avatar" />
                <div className="sq-ws-review__body">
                  <div className="sq-ws-review__head">
                    <strong>{review.name}</strong>
                    <Stars value={review.stars ?? review.rating} />
                  </div>
                  <p>{review.text}</p>
                </div>
              </div>
            );
          })}
        </section>

        <section className="sq-ws-glass sq-ws-pad">
          <div className="sq-ws-section-head">
            <h3 className="sq-ws-card-title">Portfolio Highlights</h3>
            <button type="button" className="sq-ws-view-all" onClick={openPortfolioPage}>
              View all
            </button>
          </div>
          <div className="sq-ws-portfolio">
            {portfolio.slice(0, 3).map((item) => (
              <article key={item.id || item.title} className="sq-ws-portfolio__card">
                <div
                  className="sq-ws-portfolio__thumb"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <strong>{item.title}</strong>
                <a
                  className="sq-ws-portfolio__demo"
                  href={item.demoUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    if (!item.demoUrl || item.demoUrl === '#') e.preventDefault();
                  }}
                >
                  Live Demo
                </a>
              </article>
            ))}
          </div>
        </section>
      </div>

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
