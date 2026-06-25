/** Demo job descriptions for the details drawer (English). */

const JOB_DESCRIPTIONS = {
  'Frontend Developer':
    'Build responsive, accessible web interfaces for our product suite. You will ship UI features with modern JavaScript, collaborate with designers, and maintain component libraries.',
  'React Developer':
    'Deliver production React features with TypeScript, state management, and automated tests. Partner with backend engineers on API integration and performance tuning.',
  'SEO Specialist':
    'Own organic growth through technical SEO audits, keyword strategy, and content optimization. Report on rankings and collaborate with marketing on campaigns.',
  'Content Writer':
    'Produce blog posts, landing copy, and product messaging aligned with brand voice. Research topics, draft SEO-friendly content, and revise based on editorial feedback.',
  'Graphic Designer':
    'Create brand assets, social creatives, and campaign visuals. Work in Figma and Adobe tools with marketing and product teams on tight deadlines.',
  'AI Engineer':
    'Design and deploy ML features, LLM integrations, and data pipelines. Prototype models, productionize APIs, and document responsible AI practices.',
  'Mobile App Developer':
    'Ship cross-platform mobile apps with React Native, native modules, and store releases. Own push notifications, analytics, and crash-free session targets.',
  'WordPress Expert':
    'Customize WordPress themes, plugins, and WooCommerce flows. Maintain performance, security patches, and client-ready CMS handoffs.',
};

const DEFAULT_REQUIREMENTS = [
  'Relevant portfolio or work samples',
  'Strong written English',
  'Ability to work independently',
];

export function enrichJobDetails(job) {
  if (!job) return null;
  const description =
    job.description ||
    JOB_DESCRIPTIONS[job.role] ||
    `Join ${job.company || 'our team'} as a ${job.role || 'contributor'}. Apply to learn more about responsibilities and team fit.`;
  const requirements =
    job.requirements?.length > 0
      ? job.requirements
      : [...(job.tags || []), ...DEFAULT_REQUIREMENTS].slice(0, 8);
  return { ...job, description, requirements };
}
