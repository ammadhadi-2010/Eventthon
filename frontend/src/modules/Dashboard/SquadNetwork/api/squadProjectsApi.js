import API from '../../../../api/axiosConfig';
import { getSquadsSessionHeaders } from '../services/squadsSession';
import { normalizeWizardPricingTiers } from '../../Projects/createProject/data/createProjectWizardData';

function cfg(extra = {}) {
  return {
    headers: { ...getSquadsSessionHeaders(), ...(extra.headers || {}) },
    ...extra,
  };
}

function parseBudgetInt(value) {
  if (value == null || value === '') return undefined;
  const n = Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? Math.round(n) : undefined;
}

/** Persist wizard tiers in a stable API shape (numbers + delivery alias). */
export function pricingTiersToApiPayload(wizardTiers) {
  const norm = normalizeWizardPricingTiers(wizardTiers);
  const out = {};
  for (const key of ['basic', 'standard', 'premium']) {
    const tier = norm[key];
    const delivery = Number(tier.deliveryDays) || 0;
    out[key] = {
      price: Number(String(tier.price).replace(/[^0-9.]/g, '')) || 0,
      deliveryDays: delivery,
      delivery,
      revisions: Number(tier.revisions) || 0,
      features: Array.isArray(tier.features) ? tier.features.filter(Boolean) : [],
    };
  }
  return out;
}

function slugifyTitle(title) {
  return String(title || 'project')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Full wizard state for reload on edit (images, lists, rates, etc.). */
export function wizardDataToSnapshot(wizardData) {
  if (!wizardData || typeof wizardData !== 'object') return {};
  return {
    selectedTemplateId: wizardData.selectedTemplateId || '',
    title: wizardData.title || '',
    shortDescription: wizardData.shortDescription || '',
    detailedDescription: wizardData.detailedDescription || '',
    category: wizardData.category || '',
    subCategory: wizardData.subCategory || '',
    tags: Array.isArray(wizardData.tags) ? [...wizardData.tags] : [],
    coverPreview: wizardData.coverPreview || '',
    status: wizardData.status || 'Planning',
    projectType: wizardData.projectType || '',
    budgetMin: wizardData.budgetMin ?? '',
    budgetMax: wizardData.budgetMax ?? '',
    budgetRange: wizardData.budgetRange || '',
    timeline: wizardData.timeline || '',
    lookingFor: wizardData.lookingFor || wizardData.teamSize || '',
    postedBy: wizardData.postedBy || '',
    postedRole: wizardData.postedRole || '',
    verified: Boolean(wizardData.verified),
    objectives: wizardData.objectives || '',
    deliverables: wizardData.deliverables || '',
    requirements: Array.isArray(wizardData.requirements) ? [...wizardData.requirements] : [],
    techStack: Array.isArray(wizardData.techStack) ? [...wizardData.techStack] : [],
    rolesNeeded: Array.isArray(wizardData.rolesNeeded) ? [...wizardData.rolesNeeded] : [],
    skills: Array.isArray(wizardData.skills) ? [...wizardData.skills] : [],
    experienceLevel: wizardData.experienceLevel || '',
    workMode: wizardData.workMode || '',
    teamSize: wizardData.teamSize || '',
    startDate: wizardData.startDate || '',
    milestones: Array.isArray(wizardData.milestones) ? [...wizardData.milestones] : [],
    pricingTiers: normalizeWizardPricingTiers(wizardData.pricingTiers),
    githubUrl: wizardData.githubUrl || '',
    liveUrl: wizardData.liveUrl || wizardData.demoUrl || '',
  };
}

export function wizardDataToSquadProjectPayload(wizardData, { forUpdate = false } = {}) {
  const title = String(wizardData?.title || '').trim();
  const status = wizardData?.status || 'Active';
  const tags = Array.isArray(wizardData?.tags) ? [...wizardData.tags] : [];
  const category = String(wizardData?.category || '').trim();
  if (category && !tags.includes(category)) tags.unshift(category);

  const techStack = Array.isArray(wizardData?.techStack)
    ? wizardData.techStack.filter(Boolean)
    : [];
  const mergedStack = [...new Set([...techStack, ...tags])].slice(0, 12);

  let progress;
  const normalized = String(status).toLowerCase();
  if (normalized.includes('complete')) progress = 100;
  else if (normalized.includes('plan')) progress = 25;
  else if (normalized.includes('hold')) progress = 40;
  else progress = 55;

  const milestones = Array.isArray(wizardData?.milestones) ? wizardData.milestones : [];
  const tasksTotal = Math.max(8, milestones.length * 3 || mergedStack.length * 2);
  const tasksCompleted = Math.round((progress / 100) * tasksTotal);
  const budgetMin = parseBudgetInt(wizardData?.budgetMin);
  const budgetMax = parseBudgetInt(wizardData?.budgetMax);
  const pricingTiers = pricingTiersToApiPayload(wizardData?.pricingTiers);

  const description =
    String(wizardData?.shortDescription || '').trim() ||
    String(wizardData?.objectives || '').trim() ||
    '';

  const payload = {
    title,
    status: status === 'draft' ? 'Planning' : status,
    owner: wizardData?.postedBy || 'You',
    tags: tags.slice(0, 10),
    tech_stack: mergedStack,
    description: description || undefined,
    detailed_description: wizardData?.detailedDescription || undefined,
    github_url: wizardData?.githubUrl || wizardData?.github_url || undefined,
    live_url: wizardData?.liveUrl || wizardData?.demoUrl || wizardData?.live_url || undefined,
    budget_min: budgetMin,
    budget_max: budgetMax,
    timeline: wizardData?.timeline || undefined,
    milestones,
    pricing_tiers: pricingTiers,
    experience_level: wizardData?.experienceLevel || undefined,
    work_mode: wizardData?.workMode || undefined,
    selected_template_id: wizardData?.selectedTemplateId || undefined,
    category: wizardData?.category || category,
    sub_category: wizardData?.subCategory || undefined,
    cover_preview: wizardData?.coverPreview || undefined,
    objectives: wizardData?.objectives || undefined,
    deliverables: wizardData?.deliverables || undefined,
    requirements: Array.isArray(wizardData?.requirements) ? wizardData.requirements : undefined,
    roles_needed: Array.isArray(wizardData?.rolesNeeded) ? wizardData.rolesNeeded : undefined,
    skills: Array.isArray(wizardData?.skills) ? wizardData.skills : undefined,
    project_type: wizardData?.projectType || undefined,
    team_size: wizardData?.teamSize || wizardData?.lookingFor || undefined,
    start_date: wizardData?.startDate || undefined,
    wizard_snapshot: wizardDataToSnapshot(wizardData),
  };

  if (!forUpdate) {
    payload.tasks_total = tasksTotal;
    payload.tasks_completed = tasksCompleted;
    payload.showroom_views = 0;
    payload.public_slug = slugifyTitle(title);
    payload.progress = progress;
  }

  return payload;
}

export async function createSquadProject(squadId, payload) {
  if (!squadId) return null;
  const res = await API.post(`/squads/${squadId}/projects`, payload, cfg());
  if (res?.data?.status !== 'success') {
    throw new Error(res?.data?.message || 'Could not add project to squad.');
  }
  return res.data.data;
}

export async function updateSquadProject(squadId, projectId, payload) {
  if (!squadId || !projectId) return null;
  const res = await API.put(`/squads/${squadId}/projects/${projectId}`, payload, cfg());
  if (res?.data?.status !== 'success') {
    throw new Error(res?.data?.message || 'Could not update squad project.');
  }
  return res.data.data;
}

export async function selectSquadProjectPackage(squadId, projectId, payload) {
  if (!squadId || !projectId) return null;
  const res = await API.post(
    `/squads/${squadId}/projects/${projectId}/select-package`,
    payload,
    cfg(),
  );
  if (res?.data?.status !== 'success') {
    throw new Error(res?.data?.message || 'Could not confirm package.');
  }
  return res.data.data;
}

export async function joinSquadProject(squadId, projectId, userPayload) {
  if (!squadId || !projectId) return null;
  const res = await API.post(`/squads/${squadId}/projects/${projectId}/join`, userPayload, cfg());
  if (res?.data?.status !== 'success') {
    throw new Error(res?.data?.message || 'Could not join project.');
  }
  return res.data.data;
}

export async function fetchSquadProjects(squadId) {
  if (!squadId) return [];
  const res = await API.get(`/squads/${squadId}/projects`, cfg());
  return res?.data?.data || [];
}

export function squadProjectToWizardData(project) {
  if (!project) return {};
  const snap = project.wizard_snapshot || project.wizardSnapshot || {};
  const tags = Array.isArray(project.tags) ? project.tags : snap.tags || [];
  const techStack = Array.isArray(project.tech_stack)
    ? project.tech_stack
    : snap.techStack || [];
  const budgetMin =
    project.budget_min != null ? String(project.budget_min) : snap.budgetMin ?? '';
  const budgetMax =
    project.budget_max != null ? String(project.budget_max) : snap.budgetMax ?? '';

  return {
    ...snap,
    title: project.title || snap.title || '',
    shortDescription:
      project.description || snap.shortDescription || `${project.title || 'Project'} — squad project`,
    detailedDescription:
      project.detailed_description || project.detailedDescription || snap.detailedDescription || '',
    status: project.status || snap.status || 'Active',
    tags: tags.length ? tags : snap.tags || [],
    techStack: techStack.length ? techStack : snap.techStack || tags,
    category: project.category || snap.category || tags[0] || '',
    subCategory: project.sub_category || project.subCategory || snap.subCategory || '',
    githubUrl: project.github_url || snap.githubUrl || '',
    liveUrl: project.live_url || snap.liveUrl || '',
    coverPreview:
      project.cover_preview || project.coverPreview || snap.coverPreview || '',
    budgetMin,
    budgetMax,
    budgetRange:
      snap.budgetRange ||
      project.budget_range ||
      (budgetMin && budgetMax
        ? `$${Number(budgetMin).toLocaleString()} - $${Number(budgetMax).toLocaleString()}`
        : ''),
    timeline: project.timeline || project.due_date || snap.timeline || '',
    milestones: project.milestones?.length ? project.milestones : snap.milestones || [],
    pricingTiers: normalizeWizardPricingTiers(
      snap.pricingTiers || project.pricing_tiers || project.pricingTiers,
    ),
    experienceLevel: project.experience_level || snap.experienceLevel || '',
    workMode: project.work_mode || snap.workMode || '',
    selectedTemplateId: project.selected_template_id || snap.selectedTemplateId || '',
    objectives: project.objectives || snap.objectives || '',
    deliverables: project.deliverables || snap.deliverables || '',
    requirements: project.requirements?.length ? project.requirements : snap.requirements || [],
    rolesNeeded: project.roles_needed?.length ? project.roles_needed : snap.rolesNeeded || [],
    skills: project.skills?.length ? project.skills : snap.skills || [],
    projectType: project.project_type || snap.projectType || '',
    teamSize: project.team_size || snap.teamSize || '',
    lookingFor: project.team_size || snap.lookingFor || snap.teamSize || '',
    startDate: project.start_date || snap.startDate || '',
    postedBy: project.owner || snap.postedBy || '',
    postedRole: snap.postedRole || '',
  };
}
