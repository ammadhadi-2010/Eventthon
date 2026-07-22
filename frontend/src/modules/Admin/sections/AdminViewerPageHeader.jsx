import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ADMIN_DASHBOARD_PATH } from '../layout/adminWorkspacePaths';

export default function AdminViewerPageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-5">
      <Link
        to={ADMIN_DASHBOARD_PATH}
        className="mb-2 inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white"
      >
        <ArrowLeft size={14} aria-hidden />
        Back to Dashboard
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-black tracking-tight text-white">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
