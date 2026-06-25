import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AllProjectsView from './components/AllProjectsView';
import ProjectsPage from './ProjectsPage';
import ProjectDetailPage from './ProjectDetailPage';
import ShowroomPanelsLayoutPage from '../../Public/pages/ShowroomPanelsLayoutPage';

export default function ProjectsRoutes({ userData }) {
  return (
    <Routes>
      <Route index element={<ProjectsPage key="projects-hub" />} />
      <Route path="showrooms" element={<ShowroomPanelsLayoutPage />} />
      <Route
        path="new"
        element={<ProjectsPage key="projects-new" defaultMenu="create-project" />}
      />
      <Route
        path="activity"
        element={
          <ProjectsPage key="projects-activity" defaultMenu="activity" hideRightRail />
        }
      />
      <Route
        path="top-collaborators"
        element={
          <ProjectsPage
            key="projects-top-collaborators"
            defaultMenu="top-collaborators"
            hideRightRail
          />
        }
      />
      <Route path="all" element={<AllProjectsView />} />
      <Route path=":projectId" element={<ProjectDetailPage userData={userData} />} />
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}
