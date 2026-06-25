const baseAuthors = [
  { author_name: 'Sarah Khan', author_title: 'SEO Specialist', author_imageurl: 'https://api.dicebear.com/8.x/avataaars/svg?seed=SarahKhan' },
  { author_name: 'Usman Ali', author_title: 'Full Stack Developer', author_imageurl: 'https://api.dicebear.com/8.x/avataaars/svg?seed=UsmanAli' },
  { author_name: 'Hadia Eman', author_title: 'Full Stack Developer', author_imageurl: 'https://api.dicebear.com/8.x/avataaars/svg?seed=HadiaEman' },
];

function ago(hours) {
  return new Date(Date.now() - hours * 3600000).toISOString();
}

export const EXPLORER_DEMO_UPDATES = [
  { id: 'demo-1', update_type: 'project', title: 'SEO Dashboard v2.0 Development Update', message: 'Milestone reached with analytics modules now integrated.', imageurl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640', created_at: ago(2), likes_count: 24, comments_count: 8, action_url: '/projects', ...baseAuthors[0] },
  { id: 'demo-2', update_type: 'gig', title: 'Premium SEO Audit Gig Published', message: 'A new high-value gig is now open for proposals.', imageurl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=640', created_at: ago(1), likes_count: 12, comments_count: 3, action_url: '/gigs', ...baseAuthors[1] },
  { id: 'demo-3', update_type: 'achievement', title: 'Top Rated Plus Badge Earned', message: 'Profile quality unlocked a new achievement badge.', created_at: ago(2), likes_count: 41, comments_count: 10, action_url: '/profile', ...baseAuthors[2] },
  { id: 'demo-4', update_type: 'squad', title: 'SEO Masters Reached 100 Members', message: 'Your squad crossed a major growth milestone.', imageurl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=640', created_at: ago(1), likes_count: 18, comments_count: 5, action_url: '/squads', ...baseAuthors[0] },
  { id: 'demo-5', update_type: 'job', title: 'Hiring React Developer for Remote', message: 'A remote role is now open in your network.', created_at: ago(1), likes_count: 9, comments_count: 2, job_location: 'Remote', job_type: 'Full-time', job_experience: '2+ Years', action_url: '/jobs', ...baseAuthors[1] },
  { id: 'demo-6', update_type: 'article', title: 'How to Scale Link Building in 2026', message: 'A new long-form article was published to the feed.', imageurl: 'https://images.unsplash.com/photo-1499750310107-5fef28fd6603?w=640', created_at: ago(3), likes_count: 31, comments_count: 11, action_url: '/article/list', ...baseAuthors[2] },
  { id: 'demo-7', update_type: 'project', title: 'AI Content Generator Sprint Update', message: 'Sprint board moved to 65% completion.', imageurl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=640', created_at: ago(5), likes_count: 15, comments_count: 4, action_url: '/projects', ...baseAuthors[0] },
  { id: 'demo-8', update_type: 'gig', title: 'WordPress Speed Optimization Gig', message: 'New gig listing for performance specialists.', imageurl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=640', created_at: ago(6), likes_count: 7, comments_count: 1, action_url: '/gigs', ...baseAuthors[1] },
  { id: 'demo-9', update_type: 'achievement', title: '100 Completed Projects Milestone', message: 'Delivery milestone unlocked on your profile.', created_at: ago(8), likes_count: 52, comments_count: 14, action_url: '/profile', ...baseAuthors[2] },
  { id: 'demo-10', update_type: 'squad', title: 'Design Hub Weekly Challenge Started', message: 'A new squad challenge is now live.', imageurl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=640', created_at: ago(10), likes_count: 21, comments_count: 6, action_url: '/squads', ...baseAuthors[0] },
  { id: 'demo-11', update_type: 'job', title: 'Senior Python Engineer Opening', message: 'Hybrid role posted by a verified company.', created_at: ago(12), likes_count: 6, comments_count: 2, job_location: 'Lahore', job_type: 'Hybrid', job_experience: '4+ Years', action_url: '/jobs', ...baseAuthors[1] },
  { id: 'demo-12', update_type: 'article', title: 'EventThon Product Roadmap Q2', message: 'Official roadmap article published for members.', imageurl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=640', created_at: ago(14), likes_count: 28, comments_count: 9, action_url: '/article/list', ...baseAuthors[2] },
];
