import React from 'react';
import MemberHubCompanySwitch from '../../../components/mobile/MemberHubCompanySwitch';
import JobsBreadcrumb from '../../components/JobsBreadcrumb';
import { buildJobsWizardCrumbs } from '../../utils/jobsBreadcrumbs';

export default function JobAlertMobileHeader({ title, subtitle, mode = 'alert' }) {
  return (
    <header className="ja-mobile-header" aria-label={title}>
      <div className="ja-mobile-header__trail">
        <JobsBreadcrumb items={buildJobsWizardCrumbs(mode)} className="jh-breadcrumb--compact" />
        <h1 className="ja-mobile-header__title">{title}</h1>
        {subtitle ? <p className="ja-mobile-header__sub">{subtitle}</p> : null}
      </div>
      <MemberHubCompanySwitch />
    </header>
  );
}
