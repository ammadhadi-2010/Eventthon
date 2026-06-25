/** Derives milestone rows from existing alert form fields — no extra state. */
export function buildJobPreviewMilestones(form) {
  const location = form.location?.trim() || form.workMode;
  return [
    {
      id: 'discover',
      title: 'Role Discovery',
      window: form.alertFrequency || 'Instant',
      detail: `${form.matchStrictness || 'Balanced'} match profile`,
      tone: 'violet',
    },
    {
      id: 'skills',
      title: 'Skills Validation',
      window: 'Week 1–2',
      detail: `${form.skills?.length || 0} mandatory skills tracked`,
      tone: 'cyan',
    },
    {
      id: 'interview',
      title: 'Interview Pipeline',
      window: form.experienceLevel || 'Mid',
      detail: `${form.employmentType || 'Full-time'} · ${location}`,
      tone: 'emerald',
    },
    {
      id: 'offer',
      title: 'Offer & Onboarding',
      window: form.timezone || 'Any',
      detail: `${form.companySize || 'Any'} company preference`,
      tone: 'amber',
    },
  ];
}
