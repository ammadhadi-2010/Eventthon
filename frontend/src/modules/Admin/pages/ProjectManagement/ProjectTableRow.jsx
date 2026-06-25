import React from 'react';
import { Eye, FolderKanban } from 'lucide-react';
import { PROGRESS_GRADIENT, STATUS_PILL_CLASS } from './projectData';
import ProjectRowMenu from './ProjectRowMenu';
import ProjectTeamAvatars from './ProjectTeamAvatars';

export default function ProjectTableRow({
  project,
  selected,
  onViewProject,
  onEdit,
  onChangeStatus,
  onArchive,
}) {
  const pillClass = STATUS_PILL_CLASS[project.status] || STATUS_PILL_CLASS['In Progress'];
  const barGradient = PROGRESS_GRADIENT[project.status] || PROGRESS_GRADIENT['In Progress'];

  return (
    <tr className={`border-t border-white/[0.05] hover:bg-white/[0.02]${selected ? ' pm-row--selected' : ''}`}>
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex rounded-lg bg-blue-500/15 p-1.5 text-blue-400">
            <FolderKanban size={14} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{project.name}</p>
            <p className="text-xs text-slate-500">{project.category}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3">
        <ProjectTeamAvatars team={project.team} extraTeam={project.extraTeam} />
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="h-1.5 w-[72px] overflow-hidden rounded-full bg-[#1f2228]">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${barGradient}`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-xs font-medium text-slate-400">{project.progress}%</span>
        </div>
      </td>
      <td className="px-5 py-3">
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pillClass}`}>
          {project.status}
        </span>
      </td>
      <td className="px-5 py-3 text-xs text-slate-400">{project.dueDate}</td>
      <td className="relative px-5 py-3">
        <div className="sdm-actions">
          <button
            type="button"
            onClick={() => onViewProject?.(project.id)}
            className="um-row-menu"
            aria-label={`View ${project.name}`}
            aria-pressed={selected}
          >
            <Eye size={14} />
          </button>
          <ProjectRowMenu
            row={project}
            onEdit={onEdit}
            onChangeStatus={onChangeStatus}
            onArchive={onArchive}
          />
        </div>
      </td>
    </tr>
  );
}
