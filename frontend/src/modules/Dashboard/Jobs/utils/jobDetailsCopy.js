/** Enrich listing details for the drawer — prefer live API fields only. */

export function enrichJobDetails(job) {
  if (!job) return null;
  const description =
    String(job.description || '').trim() ||
    `Join ${job.company || 'our team'} as a ${job.role || 'contributor'}. Apply to learn more about responsibilities and team fit.`;
  const requirements =
    Array.isArray(job.requirements) && job.requirements.length
      ? job.requirements
      : (job.tags || []).slice(0, 8);
  return { ...job, description, requirements };
}
