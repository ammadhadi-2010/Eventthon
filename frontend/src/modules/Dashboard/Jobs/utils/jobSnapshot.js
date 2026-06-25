/** Payload snapshot for bookmarking browse/mock listings. */
export function toJobSnapshot(job) {
  if (!job) return null;
  return {
    role: job.role,
    company: job.company,
    salary: job.salary,
    type: job.type,
    location: job.location,
    logoText: job.logoText,
    logoClass: job.logoClass,
    imageurl: job.imageurl || '',
    tags: job.tags || [],
    category: job.category,
    experienceLevel: job.experienceLevel,
    workMode: job.workMode,
    description: job.description,
    requirements: job.requirements,
  };
}
