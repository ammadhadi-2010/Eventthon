/** Templates shown in Create Project wizard (step 3) and Projects hub Templates view. */
export const WIZARD_PROJECT_TEMPLATES = [
  {
    id: 'wt-ai-chatbot',
    title: 'AI Chatbot',
    category: 'AI & Machine Learning',
    uses: 125,
    imageUrl:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=640&q=80',
    shortDescription:
      'An intelligent conversational platform for customer support and internal workflows.',
    tags: ['AI', 'Chatbot', 'NLP', 'Automation'],
  },
  {
    id: 'wt-analytics',
    title: 'Analytics Dashboard',
    category: 'Web Development',
    uses: 96,
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=640&q=80',
    shortDescription: 'Real-time metrics, charts, and KPI tracking for product and growth teams.',
    tags: ['Analytics', 'Dashboard', 'React', 'Data'],
  },
  {
    id: 'wt-mobile-app',
    title: 'Mobile App',
    category: 'Mobile Apps',
    uses: 86,
    imageUrl:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=640&q=80',
    shortDescription: 'Cross-platform mobile product scaffold with auth, feeds, and notifications.',
    tags: ['Mobile', 'iOS', 'Android', 'React Native'],
  },
  {
    id: 'wt-landing',
    title: 'Landing Page',
    category: 'Web Development',
    uses: 190,
    imageUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=640&q=80',
    shortDescription: 'High-converting marketing site with hero, features, pricing, and CTA sections.',
    tags: ['Marketing', 'Landing', 'Web', 'SEO'],
  },
  {
    id: 'wt-crypto',
    title: 'Crypto Wallet',
    category: 'Blockchain',
    uses: 64,
    imageUrl:
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=640&q=80',
    shortDescription: 'Secure wallet UI with balances, transfers, and on-chain activity history.',
    tags: ['Blockchain', 'Web3', 'Wallet', 'Security'],
  },
  {
    id: 'wt-ecommerce',
    title: 'E-commerce Store',
    category: 'Web Development',
    uses: 112,
    imageUrl:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=640&q=80',
    shortDescription: 'Online storefront with catalog, cart, checkout, and order management flows.',
    tags: ['E-commerce', 'Store', 'Payments', 'Catalog'],
  },
];

export const TEMPLATE_CATEGORY_OPTIONS = [
  'All categories',
  ...Array.from(new Set(WIZARD_PROJECT_TEMPLATES.map((t) => t.category))),
];
