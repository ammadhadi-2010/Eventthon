import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TRENDING_PROJECTS, UPCOMING_EVENTS, DASHBOARD_SIDEBAR_ROUTES } from '../rightSidebar/dashboardRightSidebarData';
import './mobileFeedCarousel.css';

export default function MobileFeedProjectsEventsCarousel({
  projects = [],
  eventState = {},
  onRegisterEvent,
}) {
  const navigate = useNavigate();
  const projectRows = projects.length ? projects : TRENDING_PROJECTS;
  const eventRows = UPCOMING_EVENTS;

  return (
    <section className="dash-mobile-carousel" aria-label="Trending projects and events carousel">
      <div className="dash-mobile-carousel__head">
        <h3 className="dash-mobile-carousel__title">Trending Projects & Events</h3>
        <button
          type="button"
          className="dash-mobile-carousel__meta"
          onClick={() => navigate(DASHBOARD_SIDEBAR_ROUTES.projects)}
        >
          View all
        </button>
      </div>
      <div className="dash-mobile-carousel__track">
        {projectRows.map((project) => (
          <article
            key={`project-${project.id}`}
            className="dash-mobile-carousel__card"
            role="button"
            tabIndex={0}
            onClick={() => navigate(project.path || '/projects')}
            onKeyDown={(event) => {
              if (event.key === 'Enter') navigate(project.path || '/projects');
            }}
          >
            <h4>{project.title}</h4>
            <p>{project.tag}</p>
            <div className="dash-mobile-carousel__meta">Trending project</div>
            <button type="button" className="dash-mobile-carousel__action">
              Open Project
            </button>
          </article>
        ))}
        {eventRows.map((event) => {
          const registered = eventState[event.id] === 'registered';
          return (
            <article key={`event-${event.id}`} className="dash-mobile-carousel__card">
              <h4>{event.title}</h4>
              <p>{event.when}</p>
              <div className="dash-mobile-carousel__meta">Upcoming event</div>
              <button
                type="button"
                className="dash-mobile-carousel__action"
                onClick={() => onRegisterEvent(event.id)}
                disabled={registered}
              >
                {registered ? 'Registered' : 'Register'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
