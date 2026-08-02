import { jobMenu as BASE_JOB_MENU, JOBS_COMING_SOON_SECTION_IDS } from '../data/jobsMenuData';

/** Apply Admin Job / Opportunity Settings onto the Jobs sidebar menu. */
export function buildJobsMenu(platformSettings) {
  const jobs = platformSettings?.jobs || {};
  const opportunities = platformSettings?.opportunities || {};

  const comingSoon = new Set(JOBS_COMING_SOON_SECTION_IDS);
  if (jobs.showAssessmentSection) comingSoon.delete('assessment');
  if (jobs.showInterviewSection) comingSoon.delete('interview');
  if (jobs.showSalarySection) comingSoon.delete('salary');

  const typeList = Array.isArray(opportunities.opportunityTypeList)
    ? opportunities.opportunityTypeList
    : [];

  return BASE_JOB_MENU.filter((item) => {
    if (item.id === 'opportunities') {
      return (
        opportunities.showBrowseOpportunities !== false &&
        opportunities.opportunitiesEnabled !== false
      );
    }
    return true;
  }).map((item) => {
    let next = { ...item, comingSoon: comingSoon.has(item.id) };
    if (item.id === 'opportunities' && typeList.length) {
      next = {
        ...next,
        children: [
          { id: '__all__', label: 'All Opportunities' },
          ...typeList.map((label) => ({ id: label, label })),
        ],
      };
    }
    return next;
  });
}

export function isSectionComingSoon(sectionId, platformSettings) {
  const jobs = platformSettings?.jobs || {};
  if (sectionId === 'assessment') return !jobs.showAssessmentSection;
  if (sectionId === 'interview') return !jobs.showInterviewSection;
  if (sectionId === 'salary') return !jobs.showSalarySection;
  return JOBS_COMING_SOON_SECTION_IDS.has(sectionId);
}
