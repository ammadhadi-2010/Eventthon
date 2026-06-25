import { FAQ_ITEMS as GIG_FAQ_ITEMS } from '../../Gigs/gigExplorer/constants';
import { normalizeWizardPricingTiers } from '../createProject/data/createProjectWizardData';

export const PROJECT_FAQ_ITEMS = [
  ...GIG_FAQ_ITEMS,
  {
    q: 'How do collaboration tiers work?',
    a: 'Basic, Standard, and Premium define scope, timeline, and revision limits. Pick the tier that matches your squad capacity.',
  },
];

const REVIEW_SNIPPETS = [
  'Clear milestones and great communication throughout.',
  'Delivered on scope — would collaborate again.',
  'Professional squad, strong technical output.',
  'Well-structured project with predictable delivery.',
];

function parseBudgetNumber(budget) {
  if (!budget) return 0;
  const nums = String(budget).match(/[\d,]+/g);
  if (!nums?.length) return 0;
  return Number(nums[0].replace(/,/g, '')) || 0;
}

function hasCustomPackageTiers(project) {
  const raw = project?.pricingTiers || project?.pricing_tiers;
  if (!raw || typeof raw !== 'object') return false;
  return ['basic', 'standard', 'premium'].some((key) => {
    const tier = raw[key];
    return tier && tier.price != null && String(tier.price).trim() !== '';
  });
}

export function deriveProjectPackageTiers(project) {
  if (hasCustomPackageTiers(project)) {
    const { basic, standard, premium } = normalizeWizardPricingTiers(
      project.pricingTiers || project.pricing_tiers,
    );
    return [
      { key: 'basic', label: 'Basic', ...mapTier(basic) },
      { key: 'standard', label: 'Standard', ...mapTier(standard) },
      { key: 'premium', label: 'Premium', ...mapTier(premium) },
    ];
  }
  const base = parseBudgetNumber(project?.budget) || 10000;
  return [
    { key: 'basic', label: 'Basic', price: Math.round(base * 0.7), delivery: 30, revisions: 2 },
    { key: 'standard', label: 'Standard', price: base, delivery: 45, revisions: 4 },
    { key: 'premium', label: 'Premium', price: Math.round(base * 1.4), delivery: 60, revisions: 6 },
  ];
}

function mapTier(tier) {
  return {
    price: Number(tier.price) || 0,
    delivery: Number(tier.deliveryDays || tier.delivery) || 30,
    revisions: Number(tier.revisions) || 2,
    features: tier.features || [],
  };
}

export function buildProjectReviewRows(project) {
  const total = Number(project?.reviewsCount) || 8;
  const baseRating = Number(project?.rating) || 4.8;
  const n = Math.min(total, 5);
  return Array.from({ length: n }, (_, index) => ({
    id: `${project.id}-rev-${index}`,
    name: `Collaborator #${1200 + index * 91}`,
    serviceType: project.title || 'Project',
    stars: Math.min(5, Math.max(4.2, baseRating + ((index % 3) - 1) * 0.08)).toFixed(1),
    text: REVIEW_SNIPPETS[index % REVIEW_SNIPPETS.length],
    ago: `${index + 1} weeks ago`,
  }));
}

export function projectAsGigShape(project) {
  return {
    title: project.title,
    rating: project.rating ?? 4.8,
    reviews: project.reviewsCount ?? 12,
    packageFeatures:
      project.packageFeatures?.length
        ? project.packageFeatures
        : project.skills || ['Core delivery', 'Milestone tracking', 'Squad chat'],
    addons: project.addons || [],
    category: project.category || 'Project',
  };
}
