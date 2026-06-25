import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import useProjectCollaborate from '../../../Projects/hooks/useProjectCollaborate';
import ProjectDetailBody from '../../../Projects/shared/ProjectDetailBody';
import ProjectTemplateBadges from '../../../Projects/shared/ProjectTemplateBadges';
import { normalizeProjectView } from '../../../Projects/utils/projectViewModel';
import { mapSquadProjectToHubShape } from '../../utils/mapSquadProjectToHubShape';
import { normalizeSquadProjectCard, statusLabel, normalizeStatus } from './squadProjectCardModel';
import SquadProjectDetailRail from './SquadProjectDetailRail';
import '../../../Projects/styles/project-detail-view.css';
import '../../styles/squad-project-detail.css';

const STATUS_CLASS = {
  'in progress': 'sq-proj-card__status--progress',
  completed: 'sq-proj-card__status--completed',
  'on hold': 'sq-proj-card__status--hold',
  planning: 'sq-proj-card__status--planning',
};

export default function ProjectDetailView({
  project,
  squadId,
  userData,
  onBack,
  onEdit,
  onProjectUpdated,
}) {
  const [liveProject, setLiveProject] = useState(project);

  useEffect(() => {
    setLiveProject(project);
  }, [project]);

  const hubShape = useMemo(() => mapSquadProjectToHubShape(liveProject), [liveProject]);
  const view = useMemo(() => normalizeProjectView(hubShape), [hubShape]);
  const card = useMemo(() => normalizeSquadProjectCard(liveProject), [liveProject]);

  const collab = useProjectCollaborate({
    project: liveProject,
    squadId,
    userData,
    onProjectUpdated: (updated) => {
      setLiveProject(updated);
      onProjectUpdated?.(updated);
    },
  });

  return (
    <div className="sq-pdv">
      <header className="sq-pdv__header">
        <button type="button" className="sq-pdv__back" onClick={onBack}>
          <ArrowLeft size={16} strokeWidth={2} aria-hidden />
          Back to projects
        </button>
        <div className="sq-pdv__head-main">
          <div>
            <h2 className="sq-pdv__title">{view.title}</h2>
            <span
              className={`sq-proj-card__status ${STATUS_CLASS[normalizeStatus(liveProject?.status)] || STATUS_CLASS['in progress']}`}
            >
              {statusLabel(card.statusKey)}
            </span>
          </div>
          {onEdit ? (
            <button type="button" className="sq-pdv__edit" onClick={() => onEdit(liveProject)}>
              Edit project
            </button>
          ) : null}
        </div>
        <ProjectTemplateBadges
          category={view.category}
          subCategory={view.subCategory}
          templateName={view.templateName}
          templateUses={view.templateUses}
        />
        <p className="sq-pdv__meta-line">{card.budgetTimelineLine}</p>
      </header>

      <div className="sq-pdv__grid">
        <main className="sq-pdv__main">
          <section className="pdv-glass-block">
            <h3 className="sq-pdv__section-title">Overview</h3>
            <ProjectDetailBody view={view} />
          </section>
          <div className="sq-pdv__card-stats">
            <div>
              <span>Tasks</span>
              <strong>
                {card.tasksCompleted}/{card.tasksTotal}
              </strong>
            </div>
            <div>
              <span>Contributors</span>
              <strong>{collab.contributors.length}</strong>
            </div>
            <div>
              <span>Progress</span>
              <strong>{card.progress}%</strong>
            </div>
          </div>
        </main>
        <SquadProjectDetailRail
          project={hubShape}
          onJoinCollaborate={collab.joinProject}
          joining={collab.joining}
          joinError={collab.joinError}
          hasJoined={collab.hasJoined}
          contributorCount={collab.contributors.length}
          onSelectPackage={collab.selectPackage}
          selectingPackage={collab.selectingPackage}
          packageError={collab.packageError}
          confirmedPackageKey={collab.confirmedPackageKey}
        />
      </div>
    </div>
  );
}
