import React, { useCallback, useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import ProjectsViewHeader from '../components/shared/ProjectsViewHeader';
import FundingKpiRow from '../components/funding/FundingKpiRow';
import FundingCampaignsTable from '../components/funding/FundingCampaignsTable';
import { useProjectsHub } from '../context/ProjectsHubContext';
import { fetchFunding } from '../services/projectsApi';
import { FUNDING_CAMPAIGNS } from '../data/fundingData';

export default function Funding() {
  const { userId } = useProjectsHub();
  const [rows, setRows] = useState(FUNDING_CAMPAIGNS);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await fetchFunding(userId);
      if (data.campaigns?.length) setRows(data.campaigns);
    } catch {
      setRows(FUNDING_CAMPAIGNS);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="ph-center-stack ph-funding">
      <ProjectsViewHeader
        title="Funding"
        subtitle="Manage funding and investments for your projects."
        action={
          <button
            type="button"
            className="ph-btn ph-btn--primary ph-fund-new-btn"
            onClick={() => window.alert('New campaign flow coming soon.')}
          >
            <FiPlus size={16} aria-hidden />
            New Campaign
          </button>
        }
      />
      <FundingKpiRow />
      <FundingCampaignsTable rows={rows} />
    </div>
  );
}
