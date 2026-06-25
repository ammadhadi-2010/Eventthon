import React from 'react';
import ProjectTableRow from './ProjectTableRow';

export default function RecentProjectsTable({
  rows = [],
  loading = false,
  viewingProjectId = null,
  onViewProject,
  onEditProject,
  onChangeStatus,
  onArchiveProject,
  onViewAll,
  title = 'Recent Projects',
  showViewAllLink = true,
}) {
  return (
    <section className="pm-table-card w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#121418]">
      <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-3.5">
        <h3 className="text-[15px] font-black text-white">{title}</h3>
        {showViewAllLink ? (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-bold text-blue-400 hover:text-blue-300"
          >
            View All Projects
          </button>
        ) : null}
      </div>

      <div className={`w-full overflow-x-auto${loading ? ' opacity-70' : ''}`}>
        <table className="min-w-[900px] w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05] text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-2.5">Project</th>
              <th className="px-5 py-2.5">Team</th>
              <th className="px-5 py-2.5">Progress</th>
              <th className="px-5 py-2.5">Status</th>
              <th className="px-5 py-2.5">Due Date</th>
              <th className="px-5 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-500">
                  No projects match your filters.
                </td>
              </tr>
            ) : (
              rows.map((project) => (
                <ProjectTableRow
                  key={project.id}
                  project={project}
                  selected={String(project.id) === String(viewingProjectId)}
                  onViewProject={onViewProject}
                  onEdit={onEditProject}
                  onChangeStatus={onChangeStatus}
                  onArchive={onArchiveProject}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
