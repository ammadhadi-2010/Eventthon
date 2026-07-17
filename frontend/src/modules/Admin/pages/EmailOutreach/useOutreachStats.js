import { useEffect, useState } from 'react';
import { Users, Mail, MailOpen, MessageSquare, Sparkles } from 'lucide-react';
import { fetchOutreachStats } from '../../services/emailOutreachApi';
import { CAMPAIGN_STATS } from './outreachDashboardData';

const ICONS = {
  total: Users,
  sent: Mail,
  opened: MailOpen,
  replied: MessageSquare,
  interested: Sparkles,
};

function buildStats(payload) {
  const stats = payload?.stats || {};
  return [
    { id: 'total', label: 'Total Leads', value: Number(stats.totalLeads || 0).toLocaleString(), trend: '+12.4%', icon: ICONS.total, color: '#8b5cf6' },
    { id: 'sent', label: 'Emails Sent', value: Number(stats.emailsSent || 0).toLocaleString(), trend: '+8.1%', icon: ICONS.sent, color: '#60a5fa' },
    { id: 'opened', label: 'Opened', value: Number(stats.opened || 0).toLocaleString(), trend: '+5.6%', icon: ICONS.opened, color: '#34d399' },
    { id: 'replied', label: 'Replied', value: Number(stats.replied || 0).toLocaleString(), trend: '+3.2%', icon: ICONS.replied, color: '#c084fc' },
    { id: 'interested', label: 'Interested', value: Number(stats.interested || 0).toLocaleString(), trend: '+1.8%', icon: ICONS.interested, color: '#f472b6' },
  ];
}

export default function useOutreachStats(refreshKey = 0) {
  const [stats, setStats] = useState(buildStats({}));
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchOutreachStats()
      .then((data) => {
        if (!alive) return;
        setStats(buildStats(data));
        setRates(data?.rates || null);
      })
      .catch(() => {
        if (alive) setStats(CAMPAIGN_STATS);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  return { stats, rates, loading };
}
