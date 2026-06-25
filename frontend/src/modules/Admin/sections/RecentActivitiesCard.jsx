import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_ACTIVITIES_PATH } from '../layout/adminWorkspacePaths';

export default function RecentActivitiesCard({ items }) {
  const navigate = useNavigate();

  return (
    <div className="admin-card-dark p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-black">Recent Activities</h3>
        <button
          type="button"
          onClick={() => navigate(ADMIN_ACTIVITIES_PATH)}
          className="text-xs font-bold uppercase tracking-[0.16em] text-blue-400 hover:text-blue-300"
        >
          View All
        </button>
      </div>
      <div className="space-y-3.5">
        {items.map((activity, index) => (
          <div
            key={`${activity.title}-${activity.time}-${index}`}
            className="admin-activity-row flex items-start gap-3 px-3 py-3"
          >
            <span className="mt-1.5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activity.color }} />
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-200">{activity.title}</div>
              <div className="text-xs text-slate-500">{activity.meta}</div>
            </div>
            <div className="text-[11px] text-slate-500">{activity.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
