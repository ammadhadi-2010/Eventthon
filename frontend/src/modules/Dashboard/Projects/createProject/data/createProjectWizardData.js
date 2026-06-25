export const WIZARD_STEPS = [
  { id: 1, label: 'Project Details' },
  { id: 2, label: 'Requirements' },
  { id: 3, label: 'Templates' },
  { id: 4, label: 'Team & Skills' },
  { id: 5, label: 'Budget & Timeline' },
  { id: 6, label: 'Review & Publish' },
];

export const WIZARD_STEP_COPY = {
  1: { title: 'Create New Project', subtitle: 'Step 1: Tell the community what you are building.' },
  2: { title: 'Create New Project', subtitle: 'Step 2: Define goals, deliverables, and technical requirements.' },
  3: { title: 'Create New Project', subtitle: 'Step 3: Choose a template to kickstart your project.' },
  4: { title: 'Create New Project', subtitle: 'Step 4: Describe the team you need and required skills.' },
  5: { title: 'Create New Project', subtitle: 'Step 5: Budget, timeline, and Basic / Standard / Premium packages.' },
  6: { title: 'Create New Project', subtitle: 'Step 6: Review everything before publishing.' },
};

export const DESIGN_TIPS = [
  'Use clear, high-quality images',
  'Show your project in action',
  'Avoid cluttered screenshots',
  'Keep branding consistent',
];

export const WHY_POINTS = [
  'Solve a real problem with measurable impact',
  'Attract skilled collaborators quickly',
  'Ship faster with structured milestones',
];

export const NEXT_STEPS = [
  'Add project requirements',
  'Choose a project template',
  'Define team roles and skills',
  'Set budget and timeline',
  'Review and publish your project',
];

export const PROJECT_STATUS_OPTIONS = ['Planning', 'Active', 'Paused', 'Completed'];
export const PROJECT_TYPE_OPTIONS = ['Full Time', 'Part Time', 'Contract', 'Freelance'];
export const TIMELINE_OPTIONS = ['1 - 2 Months', '3 - 6 Months', '6 - 12 Months', '12+ Months'];
export const EXPERIENCE_OPTIONS = ['Junior', 'Mid-Level', 'Senior', 'Lead'];
export const WORK_MODE_OPTIONS = ['Remote', 'Hybrid', 'On-site'];

export const PACKAGE_TIER_KEYS = ['basic', 'standard', 'premium'];

export const DEFAULT_PRICING_TIERS = {
  basic: {
    price: '7000',
    deliveryDays: '30',
    revisions: '2',
    features: ['Core MVP scope', '2 revision rounds', 'Email support'],
  },
  standard: {
    price: '10000',
    deliveryDays: '45',
    revisions: '4',
    features: ['Extended scope', '4 revision rounds', 'Priority support', 'Weekly sync'],
  },
  premium: {
    price: '14000',
    deliveryDays: '60',
    revisions: '6',
    features: ['Full scope + polish', '6 revision rounds', 'Dedicated lead', 'Launch support'],
  },
};

const DEFAULT_DETAILED_HTML = [
  '<ul>',
  '<li>Multi-channel deployment (web, mobile, Slack)</li>',
  '<li>Custom knowledge base ingestion</li>',
  '<li>Analytics dashboard for conversation quality</li>',
  '<li>Role-based admin controls</li>',
  '</ul>',
].join('');

export const INITIAL_WIZARD_DATA = {
  selectedTemplateId: 'wt-ai-chatbot',
  title: 'AI Chatbot Platform',
  shortDescription:
    'An intelligent conversational platform that automates customer support and internal workflows using modern NLP.',
  detailedDescription: DEFAULT_DETAILED_HTML,
  category: 'AI & Automation',
  subCategory: 'ML & data pipelines',
  tags: ['AI', 'Chatbot', 'NLP', 'Automation', 'SaaS'],
  coverPreview: '',
  status: 'Planning',
  projectType: 'Full Time',
  budgetMin: '10000',
  budgetMax: '20000',
  budgetRange: '$10,000 - $20,000',
  timeline: '3 - 6 Months',
  lookingFor: '5 - 7 Members',
  postedBy: 'Ammad Salman',
  postedRole: 'Full Stack Developer',
  verified: true,
  objectives:
    'Build a production-ready conversational AI platform that reduces support load and improves response quality.',
  deliverables: 'MVP chat widget, admin console, analytics dashboard, and deployment documentation.',
  requirements: [
    'Support web and mobile channels',
    'Knowledge base ingestion pipeline',
    'Role-based access for admins',
    'Conversation quality analytics',
  ],
  techStack: ['React', 'Node.js', 'Python', 'PostgreSQL'],
  rolesNeeded: ['Full Stack Developer', 'ML Engineer', 'UI/UX Designer'],
  skills: ['React', 'NLP', 'API Design', 'DevOps'],
  experienceLevel: 'Mid-Level',
  workMode: 'Remote',
  teamSize: '5 - 7 Members',
  startDate: '',
  milestones: ['Discovery & architecture', 'MVP build', 'Beta launch', 'Production rollout'],
  pricingTiers: {
    basic: { ...DEFAULT_PRICING_TIERS.basic, features: [...DEFAULT_PRICING_TIERS.basic.features] },
    standard: {
      ...DEFAULT_PRICING_TIERS.standard,
      features: [...DEFAULT_PRICING_TIERS.standard.features],
    },
    premium: {
      ...DEFAULT_PRICING_TIERS.premium,
      features: [...DEFAULT_PRICING_TIERS.premium.features],
    },
  },
};

/** @deprecated use INITIAL_WIZARD_DATA */
export const INITIAL_DRAFT = INITIAL_WIZARD_DATA;

/** Blank shell for squad edit — never inject demo "AI Chatbot" defaults. */
export const EMPTY_EDIT_WIZARD_BASE = {
  selectedTemplateId: '',
  title: '',
  shortDescription: '',
  detailedDescription: '',
  category: '',
  subCategory: '',
  tags: [],
  coverPreview: '',
  status: 'Planning',
  projectType: '',
  budgetMin: '',
  budgetMax: '',
  budgetRange: '',
  timeline: '',
  lookingFor: '',
  postedBy: '',
  postedRole: '',
  verified: false,
  objectives: '',
  deliverables: '',
  requirements: [],
  techStack: [],
  rolesNeeded: [],
  skills: [],
  experienceLevel: '',
  workMode: '',
  teamSize: '',
  startDate: '',
  milestones: [],
  pricingTiers: {
    basic: { ...DEFAULT_PRICING_TIERS.basic, features: [...DEFAULT_PRICING_TIERS.basic.features] },
    standard: {
      ...DEFAULT_PRICING_TIERS.standard,
      features: [...DEFAULT_PRICING_TIERS.standard.features],
    },
    premium: {
      ...DEFAULT_PRICING_TIERS.premium,
      features: [...DEFAULT_PRICING_TIERS.premium.features],
    },
  },
};

/** Ensures basic/standard/premium exist for budget step (edit mode, squad projects, empty API). */
export function normalizeWizardPricingTiers(raw) {
  const fallback =
    INITIAL_WIZARD_DATA.pricingTiers || DEFAULT_PRICING_TIERS || EMPTY_EDIT_WIZARD_BASE.pricingTiers;
  const mapTier = (key) => {
    const base = fallback?.[key] || DEFAULT_PRICING_TIERS[key];
    if (!base) {
      return { price: '0', deliveryDays: '30', revisions: '2', features: [] };
    }
    const src = raw && typeof raw === 'object' && raw[key] ? raw[key] : base;
    const features =
      Array.isArray(src.features) && src.features.length
        ? [...src.features]
        : [...base.features];
    return {
      price: String(src.price ?? base.price),
      deliveryDays: String(src.deliveryDays ?? src.delivery ?? base.deliveryDays),
      revisions: String(src.revisions ?? base.revisions),
      features,
    };
  };
  return {
    basic: mapTier('basic'),
    standard: mapTier('standard'),
    premium: mapTier('premium'),
  };
}
