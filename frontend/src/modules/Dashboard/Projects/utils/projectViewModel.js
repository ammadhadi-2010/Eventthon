import { normalizeWizardPricingTiers } from '../createProject/data/createProjectWizardData';
import { WIZARD_PROJECT_TEMPLATES } from '../createProject/data/projectWizardTemplatesData';

export function resolveTemplateById(templateId) {
  if (!templateId) return null;
  return WIZARD_PROJECT_TEMPLATES.find((t) => t.id === templateId) || null;
}

export function normalizePricingTiers(raw) {
  return normalizeWizardPricingTiers(raw);
}

function hasStoredPricingTiers(raw) {
  if (!raw || typeof raw !== 'object') return false;
  return ['basic', 'standard', 'premium'].some((key) => {
    const tier = raw[key];
    if (!tier || typeof tier !== 'object') return false;
    return tier.price != null && String(tier.price).trim() !== '';
  });
}

/** Single shape for wizard preview + project detail explorer. */
export function normalizeProjectView(input = {}) {
  const template = resolveTemplateById(
    input.selectedTemplateId || input.selected_template_id,
  );

  const techStack = (
    input.techStack ||
    input.tech_stack ||
    []
  ).filter(Boolean);
  const skills = (input.skills || []).filter(Boolean);
  const stack = techStack.length ? techStack : skills;

  const shortDescription =
    input.shortDescription ||
    input.short_description ||
    (typeof input.description === 'string' && !input.description.includes('<')
      ? input.description
      : '') ||
    '';

  const detailedDescriptionHtml =
    input.detailedDescription ||
    input.detailed_description ||
    '';

  return {
    title: input.title || input.name || 'Untitled Project',
    shortDescription,
    detailedDescriptionHtml,
    category: input.category || 'General',
    subCategory: input.subCategory || input.sub_category || '',
    templateName: template?.title || input.template_name || '',
    templateUses: template?.uses ?? input.template_uses ?? 0,
    tags: Array.isArray(input.tags) ? input.tags : [],
    techStack: stack.slice(0, 12),
    milestones: Array.isArray(input.milestones) && input.milestones.length
      ? input.milestones
      : ['Discovery', 'Build', 'QA', 'Launch'],
    requirements: input.requirements || [],
    objectives: input.objectives || '',
    deliverables: input.deliverables || '',
    pricingTiers: hasStoredPricingTiers(input.pricingTiers || input.pricing_tiers)
      ? normalizePricingTiers(input.pricingTiers || input.pricing_tiers)
      : null,
    experienceLevel: input.experienceLevel || input.experience_level || '',
    workMode: input.workMode || input.work_mode || '',
    budgetRange: input.budgetRange || input.budget_range || input.budget || '',
    timeline: input.timeline || input.deadline || 'TBD',
    lookingFor: input.lookingFor || input.team_size || '',
    projectType: input.projectType || input.project_type || '',
    status: input.status_label || input.status || 'Planning',
    coverPreview: input.coverPreview || input.cover_preview || '',
    postedBy: input.postedBy || input.posted_by || 'Member',
    postedRole: input.postedRole || input.posted_role || '',
    verified: input.verified !== false,
    agency: input.agency || 'Studio',
    tone: input.tone || input.icon_tone || 'web',
    team: input.team || [],
    progress: input.progress ?? 0,
    rating: input.rating ?? 4.8,
    reviewsCount: input.reviewsCount ?? input.reviews_count ?? 0,
    id: input.id,
  };
}
