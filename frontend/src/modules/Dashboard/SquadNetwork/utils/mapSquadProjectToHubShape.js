import { formatBudgetSegment } from '../components/projects/squadProjectCardModel';

/** Map squad project document → hub/explorer shape for normalizeProjectView. */
export function mapSquadProjectToHubShape(project) {
  if (!project) return {};
  const tags = Array.isArray(project.tags) ? project.tags : [];
  const techStack = Array.isArray(project.tech_stack)
    ? project.tech_stack
    : Array.isArray(project.techStack)
      ? project.techStack
      : tags;

  return {
    id: project.id,
    title: project.title,
    name: project.title,
    short_description: project.description || '',
    detailed_description:
      project.detailed_description ||
      project.detailedDescription ||
      project.description ||
      '',
    tech_stack: techStack,
    tags,
    category: project.category || tags[0] || 'General',
    sub_category: project.sub_category || project.subCategory || '',
    milestones: project.milestones || [],
    pricing_tiers: project.pricing_tiers || project.pricingTiers,
    budget_min: project.budget_min ?? project.budgetMin,
    budget_max: project.budget_max ?? project.budgetMax,
    budget_range:
      project.budget_range ||
      project.budgetRange ||
      (project.budget_min != null && project.budget_max != null
        ? `$${Number(project.budget_min).toLocaleString()} - $${Number(project.budget_max).toLocaleString()}`
        : undefined),
    budget: project.budget || project.budget_range || project.budgetRange || `$${formatBudgetSegment(project)}`,
    timeline: project.timeline || project.due_date || project.deadline,
    experience_level: project.experience_level || project.experienceLevel,
    work_mode: project.work_mode || project.workMode,
    status: project.status,
    progress: project.progress,
    selected_template_id: project.selected_template_id || project.selectedTemplateId,
    github_url: project.github_url,
    live_url: project.live_url,
    tasks_total: project.tasks_total ?? project.tasksTotal,
    tasks_completed: project.tasks_completed ?? project.tasksCompleted,
    members: project.members,
    contributors_count: project.contributors_count ?? project.contributorsCount,
    contributors: project.contributors || [],
  };
}
