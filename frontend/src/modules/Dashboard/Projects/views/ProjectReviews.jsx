import React from 'react';
import ProjectsViewHeader from '../components/shared/ProjectsViewHeader';
import ProjectsReviewsPage from '../components/reviews/ProjectsReviewsPage';

export default function ProjectReviews() {
  return (
    <div className="ph-center-stack ph-reviews-view">
      <ProjectsViewHeader
        title="Reviews"
        subtitle="Ratings and feedback from clients on your completed projects."
      />
      <ProjectsReviewsPage />
    </div>
  );
}
