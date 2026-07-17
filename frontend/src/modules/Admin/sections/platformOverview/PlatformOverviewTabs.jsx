import React, { memo } from 'react';
import { PLATFORM_OVERVIEW_TABS } from '../../data/platformOverviewConfig';

function PlatformOverviewTabs({ activeTab, onChange }) {
  return (
    <div className="admin-mini-tabs flex w-full flex-row gap-2 overflow-x-auto whitespace-nowrap py-2 scrollbar-none lg:flex-wrap lg:overflow-visible lg:whitespace-normal">
      {PLATFORM_OVERVIEW_TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-block flex-shrink-0 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.12em] lg:px-3 lg:py-1.5 lg:text-[10px] lg:tracking-[0.16em] ${
              active ? 'text-white' : 'bg-white/[0.03] text-slate-500'
            }`}
            style={
              active
                ? { backgroundColor: `${tab.color}22`, color: tab.color, borderColor: `${tab.color}44` }
                : undefined
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default memo(PlatformOverviewTabs);
