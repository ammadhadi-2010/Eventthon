/** Copy + submit behavior for alert / opportunity / company job wizards. */
export const JOB_WIZARD_MODES = {
  alert: {
    id: 'alert',
    title: 'Create Job Alert',
    subtitle: 'Set criteria and get notified when matching company jobs are posted.',
    submitLabel: 'Confirm & Save Alert',
    submittingLabel: 'Saving…',
    successPath: '/jobs/alerts',
    successState: { alertCreated: true },
    backPath: '/jobs/alerts',
    activeSection: 'alerts',
    alertKind: 'job',
  },
  opportunityAlert: {
    id: 'opportunityAlert',
    title: 'Create Opportunity Alert',
    subtitle: 'Get notified when matching community opportunities are posted.',
    submitLabel: 'Confirm & Save Alert',
    submittingLabel: 'Saving…',
    successPath: '/jobs/alerts',
    successState: { opportunityAlertCreated: true },
    backPath: '/jobs/alerts',
    activeSection: 'alerts',
    alertKind: 'opportunity',
  },
  opportunity: {
    id: 'opportunity',
    title: 'Create Opportunity',
    subtitle: 'Short / temporary hire — freelance, collab, or team ask. Company hiring → Company Hub.',
    submitLabel: 'Publish Opportunity',
    submittingLabel: 'Publishing…',
    successPath: '/jobs',
    successState: { opportunityCreated: true },
    backPath: '/jobs',
    activeSection: 'browse',
    listingKind: 'opportunity',
  },
  company: {
    id: 'company',
    title: 'Post a Job',
    subtitle: 'Verified companies only — permanent hiring roles for your company.',
    submitLabel: 'Publish Job',
    submittingLabel: 'Publishing…',
    successPath: '/company/dashboard/jobs',
    successState: { companyJobCreated: true },
    backPath: '/company/dashboard/jobs',
    activeSection: 'browse',
    listingKind: 'company',
  },
};

export function resolveJobWizardMode(mode) {
  return JOB_WIZARD_MODES[mode] || JOB_WIZARD_MODES.alert;
}
