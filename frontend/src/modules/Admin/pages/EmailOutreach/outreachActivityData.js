import { MailOpen, Reply, UserPlus, Send } from 'lucide-react';

export const OUTREACH_ACTIVITY_ITEMS = [
  {
    id: 'opened-cambridge',
    tone: 'blue',
    icon: MailOpen,
    prefix: 'Email opened by',
    highlight: 'Cambridge Dictionary',
    time: '2 minutes ago',
    detail: 'Cambridge Dictionary opened your partnership email. Consider a follow-up within 24 hours while engagement is high.',
  },
  {
    id: 'reply-britannica',
    tone: 'green',
    icon: Reply,
    prefix: 'Reply received from',
    highlight: 'Britannica',
    time: '1 hour ago',
    detail: 'Britannica replied to your outreach thread. Review the response and schedule a discovery call if they expressed interest.',
  },
  {
    id: 'lead-oxford',
    tone: 'purple',
    icon: UserPlus,
    prefix: 'New lead added:',
    highlight: 'Oxford Dictionary',
    time: '3 hours ago',
    detail: 'Oxford Dictionary was added to your pipeline with status Not Contacted. Assign an owner or start a sequence.',
  },
  {
    id: 'campaign-beta',
    tone: 'violet',
    icon: Send,
    prefix: 'Campaign sent:',
    highlight: 'Beta Tester Invitation',
    time: '5 hours ago',
    detail: 'Beta Tester Invitation campaign delivered to 42 recipients. Open rate is tracking at 68% after the first hour.',
  },
];
