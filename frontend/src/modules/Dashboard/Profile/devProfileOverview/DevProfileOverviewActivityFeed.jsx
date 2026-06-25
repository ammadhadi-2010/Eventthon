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

const DEMO_CONTRIBUTORS = [
  'https://api.dicebear.com/8.x/avataaars/svg?seed=c1',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=c2',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=c3',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=c4',
];

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
        <FeedProjectThumbRail imageUrl={row.projectImageUrl} contributorUrls={row.contributorUrls || DEMO_CONTRIBUTORS} />
      );
    case 'liked_project':
      return (
        <FeedProjectThumbRail
          likedMini
          badgeLabel={row.badgeLabel || 'Project'}
          contributorUrls={row.contributorUrls || DEMO_CONTRIBUTORS}
        />
      );
    case 'follow':
      return <FeedFollowRail urls={faceUrls} />;
    case 'api':
      if (!row.project) return null;
      return (
        <FeedProjectThumbRail
          imageUrl={row.project.imageUrl}
          contributorUrls={row.project.contributorUrls || DEMO_CONTRIBUTORS}
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
    const now = Date.now();
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
              techStack: tech.length ? tech : ['react', 'node', 'typescript'],
              contributorUrls: DEMO_CONTRIBUTORS,
              subtitle:
                subtitle.trim() ||
                'Ship faster with a live preview of audits, exports, and client-ready reports.',
            }
          : null,
      };
    });

    const demo = [
      {
        id: 'demo-1',
        kind: 'squad_join',
        filters: ['all', 'squads'],
        created_at: new Date(now - 25 * 60 * 1000).toISOString(),
        actorName: displayName,
        squadName: 'Code Warriors',
      },
      {
        id: 'demo-2',
        kind: 'follow',
        filters: ['all', 'connections'],
        created_at: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
        actorName: displayName,
        leadName: 'Sarah Khan',
        followTrail: ', Usman Ali, and 12 others',
      },
      {
        id: 'demo-3',
        kind: 'liked_project',
        filters: ['all', 'posts', 'projects'],
        created_at: new Date(now - 86400 * 1000).toISOString(),
        actorName: displayName,
        projectTitle: 'AI Chatbot Assistant',
        badgeLabel: 'AI ChatBot',
        projectSubtitle: 'RAG pipeline with guardrails and a clean support UI.',
        techStack: ['react', 'python', 'mongodb'],
        contributorUrls: DEMO_CONTRIBUTORS,
      },
      {
        id: 'demo-4',
        kind: 'project_post',
        filters: ['all', 'projects'],
        created_at: new Date(now - 86400 * 1000).toISOString(),
        actorName: displayName,
        projectTitle: 'SEO Audit Dashboard',
        projectImageUrl: '',
        projectSubtitle: 'Track audits, meta fixes, and client deliverables in one workspace.',
        techStack: ['react', 'node', 'javascript', 'mongodb'],
        contributorUrls: DEMO_CONTRIBUTORS,
      },
      {
        id: 'demo-5',
        kind: 'connection',
        filters: ['all', 'connections'],
        created_at: new Date(now - 2 * 86400 * 1000).toISOString(),
        actorName: displayName,
        peerName: 'Bilal Ahmed',
      },
    ];

    const merged = [...apiItems.slice(0, 3), ...demo];
    return merged.filter((r) => filter === 'all' || r.filters.includes(filter));
  }, [bundle?.activity, displayName, filter]);

  const faceUrls = [
    'https://api.dicebear.com/8.x/avataaars/svg?seed=sarah',
    'https://api.dicebear.com/8.x/avataaars/svg?seed=usman',
    'https://api.dicebear.com/8.x/avataaars/svg?seed=extra',
  ];

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
        <Link to="/profile" className="dpo-af-viewall" onClick={(e) => e.preventDefault()}>
          View All Activity →
        </Link>
      </div>

      <ul className="dpo-af-list">
        {rows.map((row) => (
          <FeedItem key={row.id} avatarSrc={av} avatarAlt="" rightRail={renderFeedRail(row, faceUrls)}>
            {renderFeedMain(row)}
          </FeedItem>
        ))}
      </ul>
    </section>
  );
}
