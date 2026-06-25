import React from 'react';
import { useNavigate } from 'react-router-dom';
import GigsLeftSidebar from '../../Dashboard/Gigs/components/GigsLeftSidebar';
import ShowroomPanelsHub from './ShowroomPanelsHub';
import '../../Public/styles/showroom-panels-hub-mobile.css';
import '../../Dashboard/Gigs/styles/GigsDashboard.css';

export default function GigsShowroomPanelsLayoutPage() {
  const navigate = useNavigate();

  return (
    <div className="gigs-page gigs-showroom-shell flex flex-row w-full min-h-screen bg-[#030712]">
      <aside className="gigs-showroom-shell__sidebar hidden lg:block lg:w-64 lg:shrink-0 border-r border-slate-800 bg-[#090d16]">
        <GigsLeftSidebar
          activeSection="Public Showrooms"
          onSectionSelect={(section) => {
            if (section === 'Public Showrooms') return;
            navigate('/gigs', { state: { gigsSection: section } });
          }}
        />
      </aside>
      <main className="gigs-showroom-shell__main flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <ShowroomPanelsHub
          filterType="Gig"
          title="Gig Public Showrooms"
          onBack={() => navigate('/gigs')}
        />
      </main>
    </div>
  );
}
