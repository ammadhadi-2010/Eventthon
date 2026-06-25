export const JOB_ALERTS_LIST = [
  {
    id: 'alert-1',
    title: 'Frontend Developer',
    salary: '$60k - $100k',
    workMode: 'Remote',
    experience: '1-3 Years',
    logoText: 'C',
    logoClass: 'chrome',
    emailEnabled: true,
  },
  {
    id: 'alert-2',
    title: 'UI/UX Designer',
    salary: '$55k - $90k',
    workMode: 'Hybrid',
    experience: '2-5 Years',
    logoText: 'F',
    logoClass: 'figma',
    emailEnabled: true,
  },
  {
    id: 'alert-3',
    title: 'AI/ML Engineer',
    salary: '$80k - $140k',
    workMode: 'Remote',
    experience: '2-5 Years',
    logoText: 'A',
    logoClass: 'grid',
    emailEnabled: true,
  },
];

export function formatAlertMeta(alert) {
  return [alert.salary, alert.workMode, alert.experience].filter(Boolean).join(' · ');
}
