import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectsLeftSidebar from '../../Dashboard/Projects/components/ProjectsLeftSidebar';
import ShowroomPanelsHub from './ShowroomPanelsHub';
import '../../Dashboard/Projects/styles/projects-hub-layout.css';

export default function ShowroomPanelsLayoutPage() {
  const navigate = useNavigate();

  return (
    <div className="ph-page">
      <div className="ph-layout ph-layout--no-right">
        <div className="ph-layout__rail ph-layout__rail--left">
          <ProjectsLeftSidebar
            activeMenu="showrooms"
            onMenuSelect={(id) => {
              if (id === 'showrooms') navigate('/projects/showrooms');
              else navigate('/projects');
            }}
            onNewProject={() => navigate('/projects/new')}
            menuCounts={{}}
          />
        </div>
        <div className="ph-layout__center">
          <ShowroomPanelsHub filterType="Project" title="Project Public Showrooms" />
        </div>
      </div>
    </div>
  );
}
