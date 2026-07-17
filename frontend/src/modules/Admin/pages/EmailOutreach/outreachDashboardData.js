import { Users, Mail, MailOpen, MessageSquare, Sparkles } from 'lucide-react';

export const CAMPAIGN_STATS = [
  { id: 'total', label: 'Total Leads', value: '2,548', trend: '+12.4%', icon: Users, color: '#8b5cf6' },
  { id: 'sent', label: 'Emails Sent', value: '892', trend: '+8.1%', icon: Mail, color: '#60a5fa' },
  { id: 'opened', label: 'Opened', value: '614', trend: '+5.6%', icon: MailOpen, color: '#34d399' },
  { id: 'replied', label: 'Replied', value: '89', trend: '+3.2%', icon: MessageSquare, color: '#c084fc' },
  { id: 'interested', label: 'Interested', value: '34', trend: '+1.8%', icon: Sparkles, color: '#f472b6' },
];

export const PERFORMANCE_RATES = [
  { id: 'open', label: 'Open Rate', value: '68.8%', tone: 'blue' },
  { id: 'click', label: 'Click Rate', value: '24.3%', tone: 'violet' },
  { id: 'reply', label: 'Reply Rate', value: '9.9%', tone: 'green' },
  { id: 'bounce', label: 'Bounce Rate', value: '1.2%', tone: 'rose' },
];

export const PERFORMANCE_CHART = [18, 26, 22, 34, 28, 42, 38, 52, 47, 58, 54, 62];

export const RECENT_CAMPAIGNS = [
  { id: 'c1', name: 'Dictionary Partners Q2', sent: 420, progress: 78, status: 'Active' },
  { id: 'c2', name: 'EdTech Beta Outreach', sent: 310, progress: 56, status: 'Active' },
  { id: 'c3', name: 'Language Apps Follow-up', sent: 162, progress: 34, status: 'Draft' },
];
