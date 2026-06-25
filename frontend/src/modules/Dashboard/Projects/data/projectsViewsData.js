/** Re-exports for Projects Hub sub-view mock data. */

export { COLLABORATIONS_TABLE_ROWS, COLLABORATION_SPACES } from './collaborationsViewData';
export { MY_PROJECTS_TABLE_ROWS, MY_PROJECTS_EXTENDED } from './myProjectsTableData';

export const PROJECT_TEMPLATES = [
  { id: 'web-app', label: 'Web Application', tone: 'web' },
  { id: 'mobile-app', label: 'Mobile App', tone: 'mobile' },
  { id: 'ai-ml', label: 'AI / ML', tone: 'ai' },
  { id: 'design', label: 'Design Sprint', tone: 'design' },
];

export const REPORTS_SERIES = {
  budget: [12, 18, 15, 22, 19, 24, 28],
  velocity: [8, 12, 10, 14, 16, 13, 18],
};
