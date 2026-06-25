import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Clock, Users } from 'lucide-react';
import { ADMIN_SYSTEM_HEALTH_PATH } from '../layout/adminWorkspacePaths';

function healthBtnClass(overall) {
  const status = String(overall || 'DEGRADED').toUpperCase();
  if (status === 'DOWN') return 'admin-health-header-btn--down';
  if (status === 'DEGRADED') return 'admin-health-header-btn--degraded';
  return 'admin-health-header-btn--ok';
}

export default function AdminHeader({ viewMode, setViewMode, health, healthLoading }) {
  const navigate = useNavigate();
  const overall = health?.overall;

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-[28px] font-black tracking-tight text-white">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-slate-400">
          Welcome back! Here&apos;s what&apos;s happening with your platform today.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={`admin-health-header-btn ${healthBtnClass(overall)}`}
          onClick={() => navigate(ADMIN_SYSTEM_HEALTH_PATH)}
        >
          <Activity size={14} aria-hidden />
          {healthLoading ? 'Checking…' : 'System Health'}
        </button>

        <div className="flex rounded-2xl border border-white/5 bg-[#0f172a] p-1">
          {['pending', 'verified'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-[11px] font-black uppercase transition-all ${
                viewMode === mode ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-white'
              }`}
            >
              {mode === 'pending' ? <Clock size={14} /> : <Users size={14} />}
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
