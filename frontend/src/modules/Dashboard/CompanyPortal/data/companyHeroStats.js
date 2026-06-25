export const COMPANY_HERO_STATS = [
  { key: 'employees', label: 'Employees' },
  { key: 'openJobs', label: 'Open Jobs' },
  { key: 'followers', label: 'Followers' },
  {
    key: 'joinedYear',
    label: 'Joined EventThon',
    format: (v) => (v && v !== '—' ? v : '—'),
  },
];

export const COMPANY_HERO_STAT_TONES = ['violet', 'cyan', 'amber', 'green'];

export function getCompanyHeroStatValue(company, item) {
  const raw = company?.[item.key];
  return item.format ? item.format(raw) : raw ?? '—';
}
