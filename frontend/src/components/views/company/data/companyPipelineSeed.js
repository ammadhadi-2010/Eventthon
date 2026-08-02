/** Preview seed — Talent Pipeline columns matching hub mock. */

function card(id, name, position, time) {
  return { id, name, position, time, imageurl: '' };
}

export const COMPANY_TALENT_PIPELINE_SEED = {
  columns: [
    {
      key: 'applied',
      label: 'Applied',
      count: 56,
      cards: [
        card('seed-pipe-a1', 'Ali Raza', 'Frontend Developer', '1d ago'),
        card('seed-pipe-a2', 'Sara Khan', 'UI/UX Designer', '2d ago'),
        card('seed-pipe-a3', 'Hassan Ali', 'React Developer', '2d ago'),
      ],
    },
    {
      key: 'screening',
      label: 'Screening',
      count: 18,
      cards: [
        card('seed-pipe-s1', 'Usman Javed', 'Backend Developer', '1d ago'),
        card('seed-pipe-s2', 'Ayesha Malik', 'Data Analyst', '2d ago'),
        card('seed-pipe-s3', 'Zain Abid', 'Full Stack Developer', '3d ago'),
      ],
    },
    {
      key: 'interview',
      label: 'Interview',
      count: 12,
      cards: [
        card('seed-pipe-i1', 'Bilal Ahmed', 'DevOps Engineer', '1d ago'),
        card('seed-pipe-i2', 'Hina Fatima', 'Product Designer', '2d ago'),
        card('seed-pipe-i3', 'Omar Farooq', 'Mobile Engineer', '3d ago'),
      ],
    },
    {
      key: 'technical',
      label: 'Technical Test',
      count: 7,
      cards: [
        card('seed-pipe-t1', 'Muhammad Ali', 'Flutter Developer', '1d ago'),
        card('seed-pipe-t2', 'Iqra Khan', 'QA Engineer', '2d ago'),
        card('seed-pipe-t3', 'Farah Noor', 'Security Engineer', '3d ago'),
      ],
    },
    {
      key: 'final',
      label: 'Final Interview',
      count: 5,
      cards: [
        card('seed-pipe-f1', 'Ahmed Khan', 'Software Engineer', '1d ago'),
        card('seed-pipe-f2', 'Noor Fatima', 'System Analyst', '2d ago'),
        card('seed-pipe-f3', 'Rida Ali', 'Tech Lead', '4d ago'),
      ],
    },
    {
      key: 'offer',
      label: 'Offer Sent',
      count: 3,
      cards: [
        card('seed-pipe-o1', 'Hamza Saeed', 'Product Manager', '1d ago'),
        card('seed-pipe-o2', 'Sana Javed', 'HR Specialist', '2d ago'),
        card('seed-pipe-o3', 'Danish Iqbal', 'Solutions Architect', '3d ago'),
      ],
    },
    {
      key: 'hired',
      label: 'Hired',
      count: 2,
      cards: [
        card('seed-pipe-h1', 'Talha Ahmed', 'Full Stack Dev', '1d ago'),
        card('seed-pipe-h2', 'Mariam Khan', 'UI/UX Designer', '2d ago'),
      ],
    },
  ],
};

export function isTalentPipelineEmpty(pipeline) {
  const columns = pipeline?.columns;
  if (!Array.isArray(columns) || columns.length === 0) return true;
  return columns.every((col) => Number(col?.count || 0) === 0 && !(col?.cards || []).length);
}
