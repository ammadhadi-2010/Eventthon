/** Mock + link config for Gigs Hub right rail (English only). */

export const GIG_OVERVIEW_PERIODS = {
  month: {
    label: 'This Month',
    earnings: 1348,
    earningsDelta: '+18% vs last month',
    orders: 18,
    ordersDelta: '+7%',
    views: 342,
    viewsDelta: '+8%',
    successRate: 97,
    successDelta: '+5%',
  },
  week: {
    label: 'This Week',
    earnings: 412,
    earningsDelta: '+9% vs last week',
    orders: 6,
    ordersDelta: '+4%',
    views: 98,
    viewsDelta: '+11%',
    successRate: 96,
    successDelta: '+2%',
  },
};

export const RECOMMENDED_GIGS = [
  {
    id: 'rec-seo',
    title: 'I will do on-page SEO optimization',
    seller: 'SEO Expert',
    level: 'Top Seller',
    price: '$50',
    rating: '4.9',
    path: '/gigs/browse/featured',
  },
  {
    id: 'rec-shopify',
    title: 'Build your fast Shopify store',
    seller: 'eCom Pro',
    level: 'Pro Seller',
    price: '$80',
    rating: '4.8',
    path: '/gigs/browse/featured',
  },
  {
    id: 'rec-social',
    title: 'Design stunning social media posts',
    seller: 'Creative Hub',
    level: 'Level 2 Seller',
    price: '$40',
    rating: '4.8',
    path: '/gigs/browse/featured',
  },
  {
    id: 'rec-video',
    title: 'Create viral short video ads',
    seller: 'Video Craft',
    level: 'Level 2 Seller',
    price: '$70',
    rating: '4.9',
    path: '/gigs/browse/featured',
  },
];

export const TOP_FREELANCERS = [
  { id: 'fl-sarah', name: 'Sarah Khan', skill: 'Top Rated Seller', rating: '4.9', path: '/gigs/providers' },
  { id: 'fl-umar', name: 'Umar Ali', skill: 'Top Rated Seller', rating: '5.0', path: '/gigs/providers' },
  { id: 'fl-hira', name: 'Hira Saeed', skill: 'Level 2 Seller', rating: '4.9', path: '/gigs/providers' },
];

export const TIP_RESOURCES = [
  { id: 'tip-hire', title: 'How to hire the right freelancer', sub: 'Guide', path: '/gigs/categories' },
  { id: 'tip-req', title: 'Write better gig requirements', sub: 'Guide', path: '/gigs/browse/featured' },
  { id: 'tip-price', title: 'Understand gig pricing', sub: 'Guide', path: '/gigs/categories' },
  { id: 'tip-dispute', title: 'Resolve order disputes', sub: 'Help Center', path: '/gigs' },
];

export const SUPPORT_MAILTO = 'mailto:support@eventthon.com?subject=Gigs%20Hub%20Support';
