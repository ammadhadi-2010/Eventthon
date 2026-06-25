const DEFAULT_DISCUSSIONS = [
  { id: 'd1', title: 'Best SEO Tools for 2025', author: 'Sarah Khan', comments: 24, icon: '💬' },
  { id: 'd2', title: 'Google Algorithm Update Discussion', author: 'Usman Ali', comments: 18, icon: '📈' },
  { id: 'd3', title: 'Content Strategy Tips', author: 'Hira Saeed', comments: 31, icon: '✍️' },
];

const DEFAULT_FEATURES = [
  { title: 'Collaboration', subtitle: 'Work together on SEO projects' },
  { title: 'Knowledge Share', subtitle: 'Learn from expert members' },
  { title: 'Global Members', subtitle: 'Connect worldwide' },
  { title: 'Premium Squad', subtitle: 'Exclusive resources & tools' },
];

export function mapPublicSquadShowroom(data) {
  if (!data) return null;
  return {
    ...data,
    discussions: data.discussions?.length ? data.discussions : DEFAULT_DISCUSSIONS,
    featureCards: data.featureCards?.length ? data.featureCards : DEFAULT_FEATURES,
    aboutTags: data.aboutTags?.length ? data.aboutTags : ['SEO', 'Digital Marketing', 'Content Strategy', 'Analytics'],
    activeProjects: data.activeProjects || [],
    recentActivity: data.recentActivity || [],
    recentFiles: data.recentFiles || [],
    members: data.members?.length ? data.members : data.membersPreview || [],
  };
}
