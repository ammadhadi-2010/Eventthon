import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useScrollDirection } from '../../../hooks/useScrollDirection';
import { useMobileHub } from '../../../hooks/useMobileHub';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ProjectsLeftSidebar from './components/ProjectsLeftSidebar';
import ProjectsRightSidebar from './components/ProjectsRightSidebar';
import ProjectsCenterRouter from './components/ProjectsCenterRouter';
import ProjectsHubMobileBack from './components/ProjectsHubMobileBack';
import ProjectsHubMobileChrome, { getProjectsPageShellClasses } from './components/ProjectsHubMobileChrome';
import { AnalyticsModal } from './components/ProjectsHubModals';
import { ProjectsHubProvider } from './context/ProjectsHubContext';
import useProjectsHubApi from './hooks/useProjectsHubApi';
import useProjectsHubState from './hooks/useProjectsHubState';
import useProjectsHubMobileBack from './hooks/useProjectsHubMobileBack';
import useProjectsHubMobileScroll from './hooks/useProjectsHubMobileScroll';
import useSquadProjectEditLoader from './hooks/useSquadProjectEditLoader';
import './styles/projects-hub-layout.css';
import './styles/projects-hub.css';
import './styles/projects-hub-mobile.css';
import './styles/projects-hub-insights-mobile.css';
import './styles/projects-hub-contrast-mobile.css';
import './styles/projects-subpages-mobile.css';
import './styles/projects-reports-mobile.css';
import './styles/project-row-menu.css';

export default function ProjectsPage({ defaultMenu, hideRightRail = false } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollDirection = useScrollDirection();
  const isMobile = useMobileHub();
  const [createSearchQuery, setCreateSearchQuery] = useState('');
  const [collaboratorsSearchQuery, setCollaboratorsSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const squadId = searchParams.get('squad') || '';
  const squadProjectId = searchParams.get('squadProjectId') || '';
  const isSquadProjectEdit = searchParams.get('mode') === 'edit';
  const isWizardRoute =
    defaultMenu === 'create-project' || location.pathname.replace(/\/+$/, '').endsWith('/projects/new');
  const { editWizardData, editWizardStatus } = useSquadProjectEditLoader({
    squadId,
    squadProjectId,
    isSquadProjectEdit,
  });
  const api = useProjectsHubApi();
  const hub = useProjectsHubState({
    tableRows: api.tableRows,
    tableTabs: api.tableTabs,
    initialMenu: isWizardRoute || isSquadProjectEdit ? 'create-project' : defaultMenu,
  });

  useEffect(() => {
    const path = location.pathname.replace(/\/+$/, '');
    if (path.endsWith('/projects/activity')) {
      hub.setActiveMenu('activity');
      return;
    }
    if (path.endsWith('/projects/top-collaborators')) {
      hub.setActiveMenu('top-collaborators');
      return;
    }
    if (path.endsWith('/projects/new') || searchParams.get('mode') === 'edit') {
      hub.setActiveMenu('create-project');
    }
  }, [location.pathname, searchParams, hub.setActiveMenu]);

  const onCancelCreate = useCallback(() => {
    hub.cancelCreateProject();
    const adminReturnTo =
      location.state?.adminReturnTo ||
      (searchParams.get('from') === 'admin' ? '/admin-control/projects' : null);
    if (adminReturnTo) {
      navigate(adminReturnTo, { replace: true });
      return;
    }
    if (defaultMenu === 'create-project') {
      navigate(squadId ? '/squads' : '/projects', { replace: true });
    }
  }, [hub, defaultMenu, navigate, squadId, location.state, searchParams]);

  const onMenuSelect = useCallback(
    (menuId) => {
      hub.setActiveMenu(menuId);
      if (
        location.pathname.endsWith('/activity') ||
        location.pathname.endsWith('/top-collaborators')
      ) {
        if (menuId === 'create-project') {
          navigate('/projects/new');
        } else {
          navigate('/projects');
        }
      }
    },
    [hub, location.pathname, navigate],
  );

  const onNewProject = useCallback(() => {
    hub.openNewProject();
    navigate('/projects/new');
  }, [hub, navigate]);

  const { showMobileBack, handleMobileBack } = useProjectsHubMobileBack({
    activeMenu: hub.activeMenu,
    setActiveMenu: hub.setActiveMenu,
    pathname: location.pathname,
    navigate,
    onCancelCreate,
  });

  useProjectsHubMobileScroll(location.pathname, hub.activeMenu);

  useEffect(() => {
    if (!location.pathname.endsWith('/top-collaborators')) {
      setCollaboratorsSearchQuery('');
    }
  }, [location.pathname]);

  const isCreate = hub.activeMenu === 'create-project';
  const isOverview = hub.activeMenu === 'overview';
  const isTopCollaborators = hub.activeMenu === 'top-collaborators';
  const isMobileTopCollab = isMobile && isTopCollaborators;

  const onOpenProject = useCallback(
    (project) => {
      const id = project?.id;
      if (id) navigate(`/projects/${id}`);
    },
    [navigate],
  );

  const handleProjectAction = useCallback(
    async (row, action) => {
      if (action === 'delete' && !window.confirm(`Delete "${row.name || row.title}"?`)) return;
      try {
        await api.runAction(row.id, action);
      } catch {
        window.alert('Action failed. Please try again.');
      }
    },
    [api],
  );

  const contextValue = useMemo(
    () => ({
      ...api,
      ...hub,
      squadId,
      squadProjectId,
      isSquadProjectEdit,
      editWizardData,
      editWizardStatus,
      onOpenProject,
      handleProjectAction,
    }),
    [
      api,
      hub,
      squadId,
      squadProjectId,
      isSquadProjectEdit,
      editWizardData,
      editWizardStatus,
      onOpenProject,
      handleProjectAction,
    ],
  );

  const overviewProps = useMemo(
    () => ({
      searchQuery: hub.searchQuery,
      onSearchChange: hub.setSearchQuery,
      onViewAnalytics: hub.openAnalytics,
      tableTab: hub.tableTab,
      onTabChange: hub.setTableTab,
      filteredRows: hub.filteredRows,
      tableTabs: hub.tableTabs,
      kpis: api.kpis,
      featured: api.featured,
      budgetSummary: api.budgetSummary,
      onOpenProject,
      onProjectAction: handleProjectAction,
      onNewProject,
      menuCounts: api.menuCounts,
      activity: api.activity,
    }),
    [hub, api.kpis, api.featured, api.budgetSummary, api.menuCounts, api.activity, onOpenProject, handleProjectAction, onNewProject],
  );

  const actionBarProps = useMemo(
    () => ({
      activeMenu: hub.activeMenu,
      onMenuSelect,
      onViewAnalytics: hub.openAnalytics,
      onNewProject,
      menuCounts: api.menuCounts,
    }),
    [hub.activeMenu, hub.openAnalytics, onMenuSelect, onNewProject, api.menuCounts],
  );

  const { layoutClass, pageShellClass } = getProjectsPageShellClasses({
    isCreate,
    isOverview,
    isMobile,
    isMobileTopCollab,
    hideRightRail,
  });

  return (
    <ProjectsHubProvider value={contextValue}>
      <div className={pageShellClass}>
        <ProjectsHubMobileChrome
          isOverview={isOverview}
          isCreate={isCreate}
          isMobile={isMobile}
          isMobileTopCollab={isMobileTopCollab}
          scrollDirection={scrollDirection}
          hubSearchQuery={hub.searchQuery}
          onHubSearchChange={hub.setSearchQuery}
          createSearchQuery={createSearchQuery}
          onCreateSearchChange={setCreateSearchQuery}
          collaboratorsSearchQuery={collaboratorsSearchQuery}
          onCollaboratorsSearchChange={setCollaboratorsSearchQuery}
        />
        <ProjectsHubMobileBack visible={showMobileBack && !isMobileTopCollab} onBack={handleMobileBack} />
        {api.error ? <p className="ph-api-banner">{api.error}</p> : null}
        <div className={layoutClass}>
          <div className="ph-layout__rail ph-layout__rail--left">
            <ProjectsLeftSidebar
              activeMenu={hub.activeMenu}
              onMenuSelect={onMenuSelect}
              onNewProject={onNewProject}
              menuCounts={api.menuCounts}
            />
          </div>
          <div className="ph-layout__center">
            <ProjectsCenterRouter
              activeMenu={hub.activeMenu}
              onMenuSelect={onMenuSelect}
              overviewProps={overviewProps}
              actionBarProps={actionBarProps}
              onCancelCreate={onCancelCreate}
              createSearchQuery={createSearchQuery}
              collaboratorsSearchQuery={collaboratorsSearchQuery}
            />
          </div>
          {!hideRightRail ? (
            <div className="ph-layout__rail ph-layout__rail--right">
              <ProjectsRightSidebar activity={api.activity} />
            </div>
          ) : null}
        </div>
        <AnalyticsModal open={hub.showAnalytics} onClose={hub.closeAnalytics} />
      </div>
    </ProjectsHubProvider>
  );
}
