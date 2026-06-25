import React, { memo } from 'react';
import { PLATFORM_OVERVIEW_TABS } from '../../data/platformOverviewConfig';

function PlatformOverviewTabs({ activeTab, onChange }) {
  return (
    <div className="admin-mini-tabs flex flex-wrap items-center gap-2">
      {PLATFORM_OVERVIEW_TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${
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
