/** Top Collaborators — View All page */

export const COLLABORATOR_TABS = [
  { id: 'all', label: 'All Collaborators', count: 24 },
  { id: 'contributors', label: 'Top Contributors', count: 10 },
  { id: 'owners', label: 'Top Project Owners', count: 10 },
  { id: 'rising', label: 'Rising Stars', count: 4 },
];

export const COLLABORATOR_PERIOD_FILTERS = [
  { id: 'month', label: 'This Month' },
  { id: 'week', label: 'This Week' },
  { id: 'quarter', label: 'This Quarter' },
  { id: 'all', label: 'All Time' },
];

export const TOP_COLLABORATORS_FEED = [
  { id: 'c1', name: 'Sarah Khan', title: 'UI/UX Designer', projects: 20, contributions: 156, impact: 98, rating: 4.9, group: 'contributors' },
  { id: 'c2', name: 'Usman Ali', title: 'Full Stack Developer', projects: 18, contributions: 132, impact: 95, rating: 4.8, group: 'contributors' },
  { id: 'c3', name: 'Ayesha Malik', title: 'Project Manager', projects: 15, contributions: 110, impact: 92, rating: 4.7, group: 'owners' },
  { id: 'c4', name: 'Bilal Ahmed', title: 'Blockchain Engineer', projects: 12, contributions: 98, impact: 90, rating: 4.9, group: 'contributors' },
  { id: 'c5', name: 'Hira Saeed', title: 'Product Designer', projects: 15, contributions: 104, impact: 88, rating: 4.7, group: 'contributors' },
  { id: 'c6', name: 'Ammad S.', title: 'Platform Lead', projects: 14, contributions: 96, impact: 87, rating: 4.8, group: 'owners' },
  { id: 'c7', name: 'Zainab Raza', title: 'QA Engineer', projects: 11, contributions: 88, impact: 85, rating: 4.6, group: 'contributors' },
  { id: 'c8', name: 'Hamza Iqbal', title: 'DevOps Specialist', projects: 10, contributions: 82, impact: 84, rating: 4.7, group: 'owners' },
  { id: 'c9', name: 'Fatima Noor', title: 'Content Strategist', projects: 9, contributions: 76, impact: 82, rating: 4.5, group: 'rising' },
  { id: 'c10', name: 'Omar Sheikh', title: 'Mobile Developer', projects: 13, contributions: 91, impact: 86, rating: 4.8, group: 'owners' },
  { id: 'c11', name: 'Mariam Khan', title: 'Data Analyst', projects: 8, contributions: 70, impact: 80, rating: 4.6, group: 'rising' },
  { id: 'c12', name: 'Hassan Ali', title: 'Backend Engineer', projects: 12, contributions: 94, impact: 89, rating: 4.7, group: 'contributors' },
  { id: 'c13', name: 'Sana Tariq', title: 'Marketing Lead', projects: 7, contributions: 62, impact: 78, rating: 4.5, group: 'owners' },
  { id: 'c14', name: 'Imran Javed', title: 'AI Engineer', projects: 11, contributions: 86, impact: 83, rating: 4.8, group: 'contributors' },
  { id: 'c15', name: 'Rabia Shah', title: 'Scrum Master', projects: 10, contributions: 80, impact: 81, rating: 4.6, group: 'owners' },
  { id: 'c16', name: 'Danish Mehmood', title: 'Frontend Developer', projects: 9, contributions: 74, impact: 79, rating: 4.7, group: 'rising' },
  { id: 'c17', name: 'Nida Farooq', title: 'UX Researcher', projects: 8, contributions: 68, impact: 77, rating: 4.5, group: 'contributors' },
  { id: 'c18', name: 'Kamran Siddiqui', title: 'Solutions Architect', projects: 14, contributions: 102, impact: 91, rating: 4.9, group: 'owners' },
  { id: 'c19', name: 'Laiba Hussain', title: 'Community Manager', projects: 6, contributions: 58, impact: 76, rating: 4.4, group: 'rising' },
  { id: 'c20', name: 'Tariq Mahmood', title: 'Security Engineer', projects: 10, contributions: 78, impact: 84, rating: 4.7, group: 'contributors' },
  { id: 'c21', name: 'Anum Rizvi', title: 'Brand Designer', projects: 7, contributions: 64, impact: 75, rating: 4.5, group: 'owners' },
  { id: 'c22', name: 'Waleed Akhtar', title: 'Cloud Engineer', projects: 9, contributions: 72, impact: 80, rating: 4.6, group: 'contributors' },
  { id: 'c23', name: 'Sadia Mirza', title: 'Technical Writer', projects: 5, contributions: 52, impact: 74, rating: 4.4, group: 'owners' },
  { id: 'c24', name: 'Fahad Qureshi', title: 'Growth Marketer', projects: 6, contributions: 56, impact: 73, rating: 4.5, group: 'contributors' },
];

export const COLLABORATORS_PAGE_SIZE = 6;

export const avatarUrl = (name) =>
  `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
