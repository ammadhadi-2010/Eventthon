export const APPLICATION_FLOW_STEPS = [
  { id: 'applied', label: 'Applied', status: 'completed' },
  { id: 'review', label: 'Under Review', status: 'active' },
  { id: 'interview', label: 'Interview', status: 'pending' },
  { id: 'technical', label: 'Technical Task', status: 'pending' },
  { id: 'hired', label: 'Hired', status: 'pending' },
];

export function buildRemoteMetaTags(remote) {
  const base = [
    { id: 'remote', label: remote ? 'Fully Remote' : 'Hybrid Available' },
    { id: 'anywhere', label: 'Work From Anywhere' },
    { id: 'flex', label: 'Flexible Hours' },
    { id: 'health', label: 'Mental Health Support' },
    { id: 'learning', label: 'Learning Budget' },
  ];
  return remote ? base : base.filter((t) => t.id !== 'anywhere');
}

export function parseSalaryBand(data) {
  const band = data.compensationBand || { min: 90, max: 160 };
  const label = data.salaryRange || band.label || 'Competitive';
  const match = String(label).match(/(\d+)\s*k?\s*[-–]\s*\$?\s*(\d+)/i);
  if (match) {
    return { min: Number(match[1]), max: Number(match[2]), label };
  }
  return { min: band.min || 90, max: band.max || 160, label };
}
