import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import useShowroomAuth from '../../../hooks/useShowroomAuth';
import ShowroomActionBar from '../ShowroomActionBar';
import ProjectShowroomHero from './ProjectShowroomHero';
import ProjectShowroomDualGrid from './ProjectShowroomDualGrid';
import '../../../styles/showroom-premium.css';
import '../../../styles/showroom-dual-grid.css';
import '../../../styles/showroom-project-mobile.css';

export default function ProjectShowroomView({ data, forceGuest = false }) {
  const navigate = useNavigate();
  const { isGuest, canManage } = useShowroomAuth(forceGuest);
  const slug = data.publicSlug || data.projectId;
  const publicPath = `/public/projects/${slug}`;

  const collabBullets = [
    'Code & Feature Development',
    'SEO & Analytics',
    'UI/UX Design',
    'Content & Marketing',
    'Testing & QA',
  ];

  return (
    <div className="ps-page">
      <button
        type="button"
        className="ps-mobile-back"
        onClick={() => {
          if (window.history.length > 1) navigate(-1);
          else navigate('/projects');
        }}
        aria-label="Go back"
      >
        <FiArrowLeft size={16} aria-hidden />
      </button>
      <nav className="ps-breadcrumb" aria-label="Breadcrumb">
        <span>Projects</span>
        <span aria-hidden>›</span>
        <span>{data.projectName}</span>
      </nav>

      <ShowroomActionBar
        publicPath={publicPath}
        managePath={`/projects/${data.projectId}`}
        canManage={canManage}
      />

      <ProjectShowroomHero data={data} canManage={canManage} />

      <ProjectShowroomDualGrid
        data={data}
        isGuest={isGuest}
        collabBullets={collabBullets}
        joinBullets={['Contribute code', 'Improve SEO', 'Design UI', 'Write content']}
      />
    </div>
  );
}
