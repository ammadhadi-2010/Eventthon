import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SquadWorkspaceHeader from '../../../../Dashboard/SquadNetwork/components/workspace/SquadWorkspaceHeader';
import SquadWorkspaceNav from '../../../../Dashboard/SquadNetwork/components/workspace/SquadWorkspaceNav';
import SquadOverviewDashboard from '../../../../Dashboard/SquadNetwork/components/workspace/SquadOverviewDashboard';
import { PUBLIC_SQUAD_TABS, resolveTabCounts } from '../../../../Dashboard/SquadNetwork/components/tabs/squadWorkspaceTabs';
import { mapPublicToWorkspace } from './mapPublicToWorkspace';
import '../../../styles/squad-showroom-public.css';

const PLACEHOLDER_TABS = new Set(['Discussions', 'Analytics', 'Settings', 'Projects', 'Members', 'Activity', 'Files']);

export default function SquadShowroomView({ data }) {
  const mapped = useMemo(() => mapPublicToWorkspace(data), [data]);
  const [activeTab, setActiveTab] = useState('Overview');

  if (!mapped) return null;

  const tabCounts = data?.tabCounts || {};
  const tabs = PUBLIC_SQUAD_TABS.map((tab) => {
    const keyMap = {
      Projects: tabCounts.projects,
      Members: tabCounts.members,
      Activity: tabCounts.activity,
      Discussions: tabCounts.discussions,
      Files: tabCounts.files,
    };
    const count = keyMap[tab.label] ?? resolveTabCounts(tab, mapped.state);
    return { ...tab, count };
  });

  const goAuth = () => {
    window.location.href = '/auth/login';
  };

  return (
    <div className="sq-public-page sq-explore-page">
      <nav className="sq-public-breadcrumb" aria-label="Breadcrumb">
        <Link to="/public/squads">Squads</Link>
        <span aria-hidden>›</span>
        <span>{mapped.squad.squad_name}</span>
      </nav>

      <div className="sq-public-showroom sq-ws-root">
        <SquadWorkspaceHeader
          squad={mapped.squad}
          stats={mapped.headerStats}
          onInvite={goAuth}
          onManage={goAuth}
        />
        <SquadWorkspaceNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="sq-public-body">
          {activeTab === 'Overview' ? (
            <SquadOverviewDashboard
              squad={mapped.squad}
              state={mapped.state}
              onTabChange={setActiveTab}
              onInvite={goAuth}
              onQuickAction={goAuth}
            />
          ) : (
            <div className="sq-ws-glass sq-ws-pad" style={{ marginTop: 14 }}>
              <h3 className="sq-ws-card-title">{activeTab}</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem' }}>
                {PLACEHOLDER_TABS.has(activeTab)
                  ? 'Sign in to EventThon to access this section in your squad workspace.'
                  : 'Join the squad on EventThon to collaborate in this section.'}
              </p>
              <button type="button" className="sq-ws-btn sq-ws-btn--primary" style={{ marginTop: 12 }} onClick={goAuth}>
                Join EventThon
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
