export const SALARY_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'role', label: 'By Role' },
  { id: 'location', label: 'By Location' },
  { id: 'experience', label: 'By Experience' },
];

export const AVERAGE_SALARY = {
  value: 95250,
  change: '+8% vs last year',
};

/** Normalized heights 0–100 for sparkline */
export const SALARY_TREND_POINTS = [58, 52, 61, 55, 64, 68, 74, 70, 78, 82, 88, 92];

export const SALARY_BY_EXPERIENCE = [
  { id: 'e1', label: '0-2 Years', amount: 60000 },
  { id: 'e2', label: '2-5 Years', amount: 85000 },
  { id: 'e3', label: '5-10 Years', amount: 115000 },
  { id: 'e4', label: '10+ Years', amount: 150000 },
];

export const SALARY_BY_ROLE = [
  { role: 'Frontend Developer', amount: 105000 },
  { role: 'AI/ML Engineer', amount: 165000 },
  { role: 'Product Designer', amount: 98000 },
  { role: 'DevOps Engineer', amount: 130000 },
];

export function formatMoney(value) {
  return `$${Number(value).toLocaleString('en-US')}`;
}

export function experienceBarPercent(amount, max = 150000) {
  return Math.round((amount / max) * 100);
}
