export const DOC_NAV = [
  { id: 'start', label: 'Getting Started' },
  { id: 'api', label: 'API Reference' },
  { id: 'sdk', label: 'SDKs' },
];

export const DOC_SNIPPETS = {
  start: {
    title: 'Quick start',
    code: 'curl -X GET https://api.eventthon.com/v1/me \\\n  -H "Authorization: Bearer YOUR_TOKEN"',
  },
  api: {
    title: 'List projects',
    code: 'GET /v1/projects?status=active&limit=20',
  },
  sdk: {
    title: 'JavaScript SDK',
    code: "import { EventThon } from '@eventthon/sdk';\nconst client = new EventThon({ token: process.env.ET_TOKEN });",
  },
};
