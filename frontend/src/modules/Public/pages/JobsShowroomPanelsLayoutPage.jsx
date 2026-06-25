import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiExternalLink, FiGlobe, FiLink } from 'react-icons/fi';
import JobsLeftSidebar from '../../Dashboard/Jobs/components/JobsLeftSidebar';
import JobBoardView from '../components/showroom/job/board/JobBoardView';
import ShowroomPanelsHub from './ShowroomPanelsHub';
import '../../Dashboard/Jobs/styles/JobsDashboard.css';
import '../../Dashboard/Jobs/styles/jobs-center-feed.css';
import '../styles/showroom-premium.css';
import '../styles/showroom-marketplace.css';
import './jobs-showroom-hub.css';

export default function JobsShowroomPanelsLayoutPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('board');

  return (
    <div className="jobs-page jobs-page--public-showroom">
      <div className="jobs-layout jobs-layout--showroom-hub">
        <div className="jobs-layout__rail jobs-layout__rail--left">
          <JobsLeftSidebar
            activeSection="browse"
            onSectionSelect={(id) => {
              navigate('/jobs');
            }}
          />
        </div>
        <div className="jobs-layout__center jobs-showroom-hub">
          <div className="jobs-showroom-hub__toolbar gigs-card">
            <div className="jobs-showroom-hub__tabs">
              <button
                type="button"
                className={tab === 'board' ? 'is-active' : ''}
                onClick={() => setTab('board')}
              >
                <FiGlobe size={14} aria-hidden />
                Public Job Board
              </button>
              <button
                type="button"
                className={tab === 'links' ? 'is-active' : ''}
                onClick={() => setTab('links')}
              >
                <FiLink size={14} aria-hidden />
                My Showroom Links
              </button>
            </div>
            <a
              href="/public/jobs"
              target="_blank"
              rel="noopener noreferrer"
              className="jobs-showroom-hub__open"
            >
              <FiExternalLink size={14} aria-hidden />
              Open Public URL
            </a>
          </div>

          {tab === 'board' ? (
            <JobBoardView forceGuest={false} embedded />
          ) : (
            <ShowroomPanelsHub filterType="Job" title="Job Public Showrooms" />
          )}
        </div>
      </div>
    </div>
  );
}
