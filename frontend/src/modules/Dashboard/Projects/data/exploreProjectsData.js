const EXPLORE_SEED = [
  {
    title: 'AI Chatbot Platform',
    author: 'Nova Labs',
    badge: 'FEATURED',
    badgeTone: 'featured',
    rating: 4.8,
    members: 24,
    comments: 12,
    funding: '$12.5K',
    tone: 'ai',
    imageUrl:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'SEO Analytics Dashboard',
    author: 'SEO Masters',
    badge: 'TRENDING',
    badgeTone: 'trending',
    rating: 4.6,
    members: 18,
    comments: 8,
    funding: '$8.2K',
    tone: 'seo',
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'EventThon Mobile App',
    author: 'ET Network',
    badge: 'HOT',
    badgeTone: 'hot',
    rating: 4.7,
    members: 15,
    comments: 7,
    funding: '$15.8K',
    tone: 'mobile',
    imageUrl:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'ET Coin Wallet',
    author: 'EventThon Labs',
    badge: 'BLOCKCHAIN',
    badgeTone: 'blockchain',
    rating: 4.9,
    members: 10,
    comments: 6,
    funding: '$10K',
    tone: 'wallet',
    imageUrl:
      'https://images.unsplash.com/photo-1621761196290-605941436e1b?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Community Forum',
    author: 'Dev Community',
    badge: 'WEB DEV',
    badgeTone: 'webdev',
    rating: 4.5,
    members: 20,
    comments: 9,
    funding: '$6.3K',
    tone: 'web',
    imageUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Data Visualization Tool',
    author: 'Data Wizards',
    badge: 'AI & ML',
    badgeTone: 'aiml',
    rating: 4.7,
    members: 14,
    comments: 7,
    funding: '$7.2K',
    tone: 'ai',
    imageUrl:
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=600&q=80',
  },
];

export const EXPLORE_PAGE_SIZE = 6;
export const EXPLORE_TOTAL_PAGES = 12;

export const EXPLORE_PROJECTS = Array.from({ length: EXPLORE_PAGE_SIZE * EXPLORE_TOTAL_PAGES }, (_, i) => {
  const seed = EXPLORE_SEED[i % EXPLORE_SEED.length];
  return {
    id: `ex-${i + 1}`,
    ...seed,
    title: i < EXPLORE_SEED.length ? seed.title : `${seed.title} ${Math.floor(i / EXPLORE_SEED.length) + 1}`,
  };
});
