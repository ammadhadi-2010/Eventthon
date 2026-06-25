import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import MainDashboard from '../../Dashboard/MainDashboard';
import Squads from '../../Dashboard/SquadNetwork/Squads';
import ProjectsPage from '../../Dashboard/Projects/ProjectsPage';
import GigsPage from '../../Dashboard/Gigs/GigsPage';
import JobsPage from '../../Dashboard/Jobs/JobsPage';
import { JobsHubProvider } from '../../Dashboard/Jobs/context/JobsHubContext';

const PREVIEW_SECTIONS = new Set(['home', 'squads', 'projects', 'gigs', 'jobs']);

function PreviewJobsHub() {
  return (
    <JobsHubProvider>
      <JobsPage defaultSection="browse" />
    </JobsHubProvider>
  );
}

export default function AdminPreviewViews({ userData }) {
  const { section = 'home' } = useParams();
  const key = String(section).toLowerCase();

  if (!PREVIEW_SECTIONS.has(key)) {
    return <Navigate to="/admin/preview/home" replace />;
  }

  return (
    <div className="admin-preview-frame" data-preview-section={key}>
      {key === 'home' ? <MainDashboard userData={userData} /> : null}
      {key === 'squads' ? <Squads userData={userData} /> : null}
      {key === 'projects' ? <ProjectsPage key="admin-preview-projects" /> : null}
      {key === 'gigs' ? <GigsPage key="admin-preview-gigs" /> : null}
      {key === 'jobs' ? <PreviewJobsHub /> : null}
    </div>
  );
}
