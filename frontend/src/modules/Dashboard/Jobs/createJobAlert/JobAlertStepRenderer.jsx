import React from 'react';
import JobAlertStepJobDetails from './steps/JobAlertStepJobDetails';
import JobAlertStepSkills from './steps/JobAlertStepSkills';
import JobAlertStepLocation from './steps/JobAlertStepLocation';
import JobAlertStepPreferences from './steps/JobAlertStepPreferences';
import JobAlertStepNotifications from './steps/JobAlertStepNotifications';
export { JobAlertNativeSelect, JobAlertSelectOption } from './jobAlertSelectHelpers';

/**
 * Renders exactly one wizard step — inactive steps are not mounted.
 * Step 6 preview is rendered by CreateJobAlertPage (center panel only).
 */
export default function JobAlertStepRenderer({ currentStep, ...stepProps }) {
  switch (currentStep) {
    case 1:
      return <JobAlertStepJobDetails {...stepProps} />;
    case 2:
      return <JobAlertStepSkills {...stepProps} />;
    case 3:
      return <JobAlertStepLocation {...stepProps} />;
    case 4:
      return <JobAlertStepPreferences {...stepProps} />;
    case 5:
      return <JobAlertStepNotifications {...stepProps} />;
    default:
      return null;
  }
}
