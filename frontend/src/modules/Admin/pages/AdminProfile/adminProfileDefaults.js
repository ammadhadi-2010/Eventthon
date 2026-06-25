export const DEFAULT_ADMIN_PROFILE = {
  full_name: 'Super Administrator',
  email: '',
  imageurl: '',
  role_badge: '★ Super Administrator',
  headline: 'EventThon Infrastructure Command',
  metrics: {
    access_level: 99,
    command_power: 9999,
    node_rank: '#1 Root',
  },
  network: {
    audits: 58,
    verifications: 12,
    resolved: 24,
  },
  activity_feed: [
    {
      id: 'seed-1',
      title: 'System Node Operational',
      message: 'All core services are online and responding within SLA thresholds.',
      tone: 'green',
      time_label: 'Just now',
    },
    {
      id: 'seed-2',
      title: 'Database Handshake Validated',
      message: 'MongoDB cluster sync completed with zero replication drift.',
      tone: 'blue',
      time_label: '4 min ago',
    },
  ],
};
