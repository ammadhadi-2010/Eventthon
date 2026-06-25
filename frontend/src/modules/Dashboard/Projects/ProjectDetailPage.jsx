import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Gigs/styles/GigsDashboard.css';
import '../SquadNetwork/styles/squad-project-detail.css';
import './styles/project-detail-view.css';
import './styles/projects-hub-mobile.css';
import ProjectsHubMobileBack from './components/ProjectsHubMobileBack';
import useProjectCollaborate from './hooks/useProjectCollaborate';
import ProjectExplorerLeftList from './projectExplorer/ProjectExplorerLeftList';
import ProjectExplorerMainColumn from './projectExplorer/ProjectExplorerMainColumn';
import ProjectExplorerRightRail from './projectExplorer/ProjectExplorerRightRail';
import ProjectExplorerSearchBar from './projectExplorer/ProjectExplorerSearchBar';
import useProjectExplorerBrowse from './projectExplorer/useProjectExplorerBrowse';
import { PROJECT_DETAIL_TABS } from './projectExplorer/constants';

export default function ProjectDetailPage({ userData }) {
  const navigate = useNavigate();
  const browse = useProjectExplorerBrowse();
  const [detailTab, setDetailTab] = useState('overview');
  const [activePackage, setActivePackage] = useState('standard');
  const [liveProject, setLiveProject] = useState(null);

  useEffect(() => {
    setLiveProject(browse.selectedProject);
  }, [browse.selectedProject]);

  const collab = useProjectCollaborate({
    project: liveProject,
    squadId: null,
    userData,
    onProjectUpdated: (updated) => {
      setLiveProject((prev) => ({ ...prev, ...updated }));
      browse.patchSelectedProject?.(updated);
    },
  });

  useEffect(() => {
    if (!PROJECT_DETAIL_TABS.some((tab) => tab.id === detailTab)) {
      setDetailTab('overview');
    }
  }, [detailTab]);

  const handleShare = async () => {
    const p = liveProject || browse.selectedProject;
    if (!p) return;
    const text = `${p.title}\n${p.description || ''}`;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: p.title, text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
      }
    } catch {
      /* cancelled */
    }
  };

  const project = liveProject || browse.selectedProject;

  if (browse.loading) {
    return (
      <div className="gigs-page">
        <section className="gigx-shell gigs-card">
          <p>Loading project...</p>
        </section>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="gigs-page">
        <section className="gigx-shell gigs-card">
          <ProjectExplorerSearchBar
            listSearchDraft={browse.listSearchDraft}
            setListSearchDraft={browse.setListSearchDraft}
            runExplorerSearch={browse.runExplorerSearch}
            onNavigateBack={() => navigate('/projects')}
          />
          <div className="gigx-grid">
            <ProjectExplorerLeftList
              rows={browse.rows}
              selectedProject={null}
              selectProjectRow={browse.selectProjectRow}
            />
            <section className="gigx-main">
              <p className="gigx-left-empty">Project not found. Select another from Featured.</p>
            </section>
            <aside className="gigx-right" />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="gigs-page">
      <ProjectsHubMobileBack visible onBack={() => navigate('/projects')} />
      <section className="gigx-shell gigs-card">
        <ProjectExplorerSearchBar
          listSearchDraft={browse.listSearchDraft}
          setListSearchDraft={browse.setListSearchDraft}
          runExplorerSearch={browse.runExplorerSearch}
          onNavigateBack={() => navigate('/projects')}
        />
        <div className="gigx-grid">
          <ProjectExplorerLeftList
            rows={browse.rows}
            selectedProject={project}
            selectProjectRow={browse.selectProjectRow}
          />
          <ProjectExplorerMainColumn project={project} detailTab={detailTab} setTab={setDetailTab} />
          <ProjectExplorerRightRail
            project={project}
            activePackage={activePackage}
            setActivePackage={setActivePackage}
            onShare={handleShare}
            onJoin={collab.joinProject}
            joining={collab.joining}
            joinError={collab.joinError}
            hasJoined={collab.hasJoined}
            onSelectPackage={collab.selectPackage}
            selectingPackage={collab.selectingPackage}
            packageError={collab.packageError}
            confirmedPackageKey={collab.confirmedPackageKey}
            onBrowse={() => navigate('/projects')}
          />
        </div>
      </section>
    </div>
  );
}
