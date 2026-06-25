import { DEMO_JOB_LISTINGS } from './demoJobsData';

const MATCH_LABELS = ['96% match', '93% match', '91% match', '88% match', '86% match', '84% match', '82% match', '80% match'];

export const RECOMMENDED_JOBS = DEMO_JOB_LISTINGS.map((job, index) => ({
  id: job.id,
  role: job.role,
  company: job.company,
  salary: job.salary,
  match: MATCH_LABELS[index] || '85% match',
  logoText: job.logoText,
  logoClass: job.logoClass,
  tags: [job.type, job.workMode || job.location, job.experienceLevel].filter(Boolean),
}));