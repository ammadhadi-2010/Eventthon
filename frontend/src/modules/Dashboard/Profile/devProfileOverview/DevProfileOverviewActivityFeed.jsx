import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ApiActivityUpdate,
  ConnectionUpdate,
  FeedFollowRail,
  FeedItem,
  FeedProjectThumbRail,
  FollowUpdate,
  LikedProjectUpdate,
  PillTabList,
  ProjectUpdate,
  SquadUpdate,
  resolveMediaUrl,
} from '../../../../components/shared';
import './devProfileOverview-activity-feed.css';

const FILTER_IDS = ['all', 'posts', 'projects', 'squads', 'connections'];
const FILTER_LABELS = {
  all: 'All',
  posts: 'Posts',
  projects: 'Projects',
  squads: 'Squads',
  connections: 'Connections',
};
const FILTER_TABS = FILTER_IDS.map((id) => ({ id, label: FILTER_LABELS[id] }));

function avatarFor(userData, draft) {
  const raw =
    draft?.profileImageUrl ||
    userData?.imageurl ||
    userData?.profile_image_url ||
    userData?.avatar ||
    '';
  return resolveMediaUrl(raw) || `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(userData?.email || 'user')}`;
}

function pickTechStack(source) {
  const raw = source?.tech_stack ?? source?.techStack ?? source?.tags ?? source?.technologies;
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean);
  if (typeof raw === 'string') return raw.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  return [];
}

function renderFeedRail(row, faceUrls) {
  switch (row.kind) {
    case 'project_post':
      return (
        <FeedProjectThumbRail imageUrl={row.projectImageUrl} contributorUrls={row.contributorUrls || []} />
      );
    case 'liked_project':
      return (
        <FeedProjectThumbRail
          likedMini
          badgeLabel={row.badgeLabel || 'Project'}
          contributorUrls={row.contributorUrls || []}
        />
      );
    case 'follow':
      return faceUrls.length ? <FeedFollowRail urls={faceUrls} /> : null;
    case 'api':
      if (!row.project) return null;
      return (
        <FeedProjectThumbRail
          imageUrl={row.project.imageUrl}
          contributorUrls={row.project.contributorUrls || []}
        />
      );
    default:
      return null;
  }
}

function renderFeedMain(row) {
  switch (row.kind) {
    case 'project_post':
      return (
        <ProjectUpdate
          actorName={row.actorName}
          projectTitle={row.projectTitle}
          createdAt={row.created_at}
          projectSubtitle={row.projectSubtitle}
          techStack={row.techStack}
        />
      );
    case 'liked_project':
      return (
        <LikedProjectUpdate
          actorName={row.actorName}
          projectTitle={row.projectTitle}
          createdAt={row.created_at}
          projectSubtitle={row.projectSubtitle}
          techStack={row.techStack}
        />
      );
    case 'squad_join':
      return <SquadUpdate actorName={row.actorName} squadName={row.squadName} createdAt={row.created_at} />;
    case 'follow':
      return (
        <FollowUpdate
          actorName={row.actorName}
          leadName={row.leadName}
          trailText={row.followTrail}
          createdAt={row.created_at}
        />
      );
    case 'connection':
      return <ConnectionUpdate actorName={row.actorName} peerName={row.peerName} createdAt={row.created_at} />;
    case 'api':
      return (
        <ApiActivityUpdate
          authorName={row.authorName}
          activityLabel={row.activityLabel}
          snippet={row.snippet}
          createdAt={row.created_at}
          projectSubtitle={row.project?.subtitle || ''}
          techStack={row.project?.techStack || []}
        />
      );
    default:
      return null;
  }
}

export default function DevProfileOverviewActivityFeed({ userData, draft, bundle }) {
  const [filter, setFilter] = useState('all');
  const displayName =
    draft?.fullName || [userData?.first_name, userData?.last_name].filter(Boolean).join(' ') || 'You';

  const av = avatarFor(userData, draft);

  const rows = useMemo(() => {
    const apiItems = (bundle?.activity || []).map((a) => {
      const t = String(a.type || '').toLowerCase();
      const isProjectType = t === 'project' || t === 'portfolio';
      const thumb = isProjectType ? a.thumbnail_url || a.image_url || a.media_url : '';
      const img = thumb ? resolveMediaUrl(thumb) : '';
      const tech = pickTechStack(a);
      const projectTitle = (a.title && String(a.title).trim()) || (a.text ? String(a.text).slice(0, 56) : 'Project');
      const subtitle =
        (a.description && String(a.description).slice(0, 120)) ||
        (a.text ? String(a.text).slice(0, 120) : '') ||
        '';
      return {
        id: `api-${a.id}`,
        kind: 'api',
        filters: ['all', 'posts'],
        created_at: a.created_at,
        authorName: a.author_name || displayName,
        activityLabel: `shared a ${String(a.type || 'post')}`,
        snippet: a.text ? String(a.text).slice(0, 80) : '',
        project: isProjectType
          ? {
              imageUrl: img,
              title: projectTitle,
              techStack: tech,
              contributorUrls: [],
              subtitle: subtitle.trim(),
            }
          : null,
      };
    });

    return apiItems.filter((r) => filter === 'all' || r.filters.includes(filter));
  }, [bundle?.activity, displayName, filter]);

  const faceUrls = [];

  return (
    <section className="dpo-panel dpo-af" aria-label="Activity feed">
      <div className="dpo-af-head">
        <div>
          <h2 className="dpo-af-title">Activity Feed</h2>
          <PillTabList
            className="dpo-af-filters"
            tabs={FILTER_TABS}
            value={filter}
            onChange={setFilter}
            ariaLabel="Filter activity"
          />
        </div>
        <Link to="/profile?tab=activity" className="dpo-af-viewall">
          View All Activity →
        </Link>
      </div>

      <ul className="dpo-af-list">
        {rows.length ? (
          rows.map((row) => (
            <FeedItem key={row.id} avatarSrc={av} avatarAlt="" rightRail={renderFeedRail(row, faceUrls)}>
              {renderFeedMain(row)}
            </FeedItem>
          ))
        ) : (
          <li className="dpo-placeholder">No activity yet. Posts and updates will appear here.</li>
        )}
      </ul>
    </section>
  );
}
