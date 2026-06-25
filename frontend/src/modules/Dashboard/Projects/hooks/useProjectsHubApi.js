import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createHubProject,
  fetchProjectsHub,
  runProjectAction,
  saveProject,
  unsaveProject,
} from '../services/projectsApi';
import { getProjectsUserId } from '../services/projectsUser';
import {
  BUDGET_SUMMARY,
  FEATURED_PROJECTS,
  KPI_METRICS,
  MY_PROJECTS_ROWS,
  PROJECT_ACTIVITY,
  TABLE_TABS,
} from '../data/projectsHubData';

const FALLBACK = {
  kpis: KPI_METRICS,
  budget_summary: BUDGET_SUMMARY,
  featured: FEATURED_PROJECTS,
  table_rows: MY_PROJECTS_ROWS,
  table_tabs: TABLE_TABS,
  menu_counts: {},
  activity: PROJECT_ACTIVITY,
};

export default function useProjectsHubApi() {
  const userId = useMemo(() => getProjectsUserId(), []);
  const [hub, setHub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadHub = useCallback(async () => {
    if (!userId) {
      setHub(FALLBACK);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await fetchProjectsHub(userId);
      setHub(data);
    } catch {
      setError('Could not load projects from server. Showing offline data.');
      setHub(FALLBACK);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadHub();
  }, [loadHub]);

  const tableRows = hub?.table_rows ?? FALLBACK.table_rows;
  const tableTabs = hub?.table_tabs ?? FALLBACK.table_tabs;
  const kpis = hub?.kpis ?? FALLBACK.kpis;
  const featured = hub?.featured ?? FALLBACK.featured;
  const budgetSummary = hub?.budget_summary ?? FALLBACK.budget_summary;
  const activity = hub?.activity ?? FALLBACK.activity;
  const menuCounts = hub?.menu_counts ?? {};

  const runAction = useCallback(
    async (projectId, action) => {
      if (!userId || !projectId) return null;
      const data = await runProjectAction(projectId, userId, action);
      await loadHub();
      return data;
    },
    [userId, loadHub],
  );

  const publishProject = useCallback(
    async (wizardData) => {
      if (!userId) throw new Error('Sign in with email or mobile to publish a project.');
      const payload = {
        owner_user_id: userId,
        title: wizardData.title,
        short_description: wizardData.shortDescription,
        detailed_description: wizardData.detailedDescription,
        category: wizardData.category,
        sub_category: wizardData.subCategory,
        tags: wizardData.tags,
        status: wizardData.status,
        project_type: wizardData.projectType,
        budget_min: wizardData.budgetMin,
        budget_max: wizardData.budgetMax,
        timeline: wizardData.timeline,
        objectives: wizardData.objectives,
        deliverables: wizardData.deliverables,
        requirements: wizardData.requirements,
        roles_needed: wizardData.rolesNeeded,
        skills: wizardData.skills,
        tech_stack: wizardData.techStack || [],
        experience_level: wizardData.experienceLevel,
        work_mode: wizardData.workMode,
        team_size: wizardData.teamSize,
        milestones: wizardData.milestones,
        selected_template_id: wizardData.selectedTemplateId,
        cover_preview: wizardData.coverPreview,
        imageurl: wizardData.coverPreview || '',
        visibility: wizardData.visibility || 'public',
        pricing_tiers: wizardData.pricingTiers,
      };
      const data = await createHubProject(payload);
      if (data?.status !== 'success') {
        throw new Error(data?.message || 'Could not publish project.');
      }
      await loadHub();
      return data;
    },
    [userId, loadHub],
  );

  const toggleSaveExplore = useCallback(
    async (project) => {
      if (!userId) return;
      await saveProject({
        user_id: userId,
        project_id: project.id,
        title: project.title,
        category: project.badge || '',
        owner_name: project.author || 'Owner',
        owner_initials: (project.author || 'OW').slice(0, 2).toUpperCase(),
        icon_tone: project.tone || 'web',
      });
    },
    [userId],
  );

  const removeSaved = useCallback(
    async (savedId) => {
      if (!userId || !savedId) return;
      await unsaveProject(savedId, userId);
      await loadHub();
    },
    [userId, loadHub],
  );

  return {
    userId,
    loading,
    error,
    hub,
    tableRows,
    tableTabs,
    kpis,
    featured,
    budgetSummary,
    activity,
    menuCounts,
    loadHub,
    runAction,
    publishProject,
    toggleSaveExplore,
    removeSaved,
  };
}
