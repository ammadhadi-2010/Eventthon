import { Handshake, MessageSquare, FlaskConical, Briefcase, Bug } from 'lucide-react';

export const OUTREACH_TEMPLATE_ITEMS = [
  {
    id: 'partnership',
    title: 'Partnership Proposal',
    subtitle: 'Introduces EventThon partnership opportunity',
    tone: 'amber',
    icon: Handshake,
    subject: 'Partnership Opportunity with EventThon',
    body: `Dear [Company Name] Team,

EventThon is expanding our partner network across events, gigs, squads, and verified hiring. We believe there is strong alignment between our platforms and would love to explore a collaboration with your organization.

We can discuss co-marketing, listings, integrations, or community partnerships at your convenience.

Best regards,
EventThon Support`,
  },
  {
    id: 'feedback',
    title: 'Feedback Request',
    subtitle: 'Asks for feedback on the system',
    tone: 'green',
    icon: MessageSquare,
    subject: 'Share your feedback on EventThon',
    body: `Hello [Contact Name],

We are continuously improving EventThon and value candid feedback from partners like you. If you have a few minutes, please share what is working well and what we should improve next.

Your input directly shapes our product roadmap.

Warm regards,
EventThon Support`,
  },
  {
    id: 'beta',
    title: 'Beta Invitation',
    subtitle: 'Invites users to join as a beta tester',
    tone: 'violet',
    icon: FlaskConical,
    subject: 'You are invited to the EventThon Beta Program',
    body: `Hi [Contact Name],

We are inviting a select group of organizations to test upcoming EventThon features before public release. Beta partners receive early access and direct influence on our roadmap.

Would you be open to a short onboarding call this week?

Thank you,
EventThon Support`,
  },
  {
    id: 'business',
    title: 'Business Introduction',
    subtitle: 'Introduces EventThon services and platform tools',
    tone: 'purple',
    icon: Briefcase,
    subject: 'Introducing EventThon — your all-in-one events & hiring platform',
    body: `Dear [Company Name] Team,

EventThon helps teams run events, manage gigs, build squads, and hire verified talent from one premium platform. We would be glad to give you a quick walkthrough of the tools most relevant to your workflow.

Please let us know a convenient time for a brief introduction call.

Best,
EventThon Support`,
  },
  {
    id: 'bug-report',
    title: 'Bug Report Request',
    subtitle: 'Requests users to report bugs or UX suggestions',
    tone: 'blue',
    icon: Bug,
    subject: 'Help us improve EventThon — report bugs or UX ideas',
    body: `Hello [Contact Name],

We are actively refining the EventThon experience and would appreciate your help identifying bugs, broken flows, or UX friction points.

If you notice anything that feels confusing or unreliable, please reply with screenshots or steps to reproduce. We review every report.

Thank you,
EventThon Support`,
  },
];
