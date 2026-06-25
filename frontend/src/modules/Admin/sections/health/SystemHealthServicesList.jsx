import React, { useMemo } from 'react';
import { systemHealthMeta } from '../../data/adminConfig';

const STATUS_CLASS = {
  OPERATIONAL: 'admin-health-pill--operational',
  DEGRADED: 'admin-health-pill--degraded',
  DOWN: 'admin-health-pill--down',
};

const ICON_CLASS = {
  OPERATIONAL: 'admin-health-icon--operational',
  DEGRADED: 'admin-health-icon--degraded',
  DOWN: 'admin-health-icon--down',
};

export default function SystemHealthServicesList({ health }) {
  const rows = useMemo(() => {
    const byId = new Map((health?.services || []).map((row) => [row.id, row]));
    return systemHealthMeta.map((meta) => {
      const live = byId.get(meta.id);
      const status = String(live?.status || 'DEGRADED').toUpperCase();
      return { ...meta, status, detail: live?.detail || '' };
    });
  }, [health]);

  return (
    <div className="space-y-3">
      {rows.map((item) => {
        const Icon = item.icon;
        const pillClass = STATUS_CLASS[item.status] || STATUS_CLASS.DEGRADED;
        const iconClass = ICON_CLASS[item.status] || ICON_CLASS.DEGRADED;
        return (
          <div
            key={item.id}
            className="admin-health-row flex w-full items-center justify-between gap-4 px-4 py-2"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className={`admin-health-icon shrink-0 ${iconClass}`}>
                <Icon size={15} />
              </div>
              <div className="min-w-0">
                <span className="block text-sm text-slate-300">{item.label}</span>
                {item.detail ? (
                  <span className="mt-0.5 block text-xs leading-snug text-slate-400">{item.detail}</span>
                ) : null}
              </div>
            </div>
            <span className={`admin-health-pill ${pillClass} min-w-[100px] shrink-0 text-center text-[11px]`}>
              {item.status}
            </span>
          </div>
        );
      })}
    </div>
  );
}
