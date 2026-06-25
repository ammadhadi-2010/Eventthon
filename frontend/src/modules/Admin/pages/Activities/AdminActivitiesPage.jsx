import React from 'react';
import AdminViewerPageHeader from '../../sections/AdminViewerPageHeader';
import useAdminActivities from './useAdminActivities';

export default function AdminActivitiesPage() {
  const { rows, loading, error } = useAdminActivities();

  return (
    <div className="admin-panel w-full p-5">
      <AdminViewerPageHeader
        title="Recent Activities"
        subtitle="Complete activity stream across user registrations and platform events."
      />
      {error ? <p className="mb-4 text-sm text-rose-400">{error}</p> : null}
      <div className="admin-card-dark p-5">
        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-slate-500">Loading activities…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-500">No activities found.</p>
          ) : (
            rows.map((activity, index) => (
              <div
                key={`${activity.title}-${activity.time}-${index}`}
                className="admin-activity-row flex items-start gap-3 px-3 py-3"
              >
                <span
                  className="mt-1.5 h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: activity.color }}
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-200">{activity.title}</div>
                  <div className="text-xs text-slate-500">{activity.meta}</div>
                </div>
                <div className="text-[11px] text-slate-500">{activity.time}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
