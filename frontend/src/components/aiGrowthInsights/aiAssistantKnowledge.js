export const ASSISTANT_QUICK_CHIPS = [
  { id: 'squad', label: '💡 What is a Squad?' },
  { id: 'gig', label: '🚀 How to build a Gig?' },
  { id: 'jobs', label: '💼 How to apply for Jobs?' },
  { id: 'wallet', label: '🪙 What is the Wallet?' },
];

export const ASSISTANT_KNOWLEDGE_REPLIES = {
  squad:
    'A Squad is a collaborative workspace where builders align on shared missions with chat, goals, roles, and project handoffs. Open Squad Network, browse active squads, or create one with a category and invite link. SQUADS / SQUAD_MATCH telemetry signals mean strong collaboration affinity was detected.',
  gig:
    'A Gig is a packaged service listing with pricing tiers, deliverables, and turnaround time. Use Gigs → Create Gig to publish. The GIGS / OPPORTUNITY insight appears when gigs hub dwell time is high without an active listing — convert browsing intent into revenue leads.',
  jobs:
    'The Jobs Hub lists contract and full-time roles. Filter by skill and compensation, open a role, then click Apply to submit your profile snapshot and cover note. Track status from dashboard alerts and enable job alerts for faster placement matches.',
  wallet:
    'The EventThon Wallet is your secure ledger for gig earnings, squad payouts, and platform credits. View balance, pending clearance, and transaction history in finance. Completed deliveries and approved milestones credit automatically; withdraw after verification.',
};

export const ASSISTANT_WELCOME_MESSAGE =
  'Hello! I am your EventThon AI Assistant. Ask about squads, gigs, jobs, or your wallet — or tap a quick chip below to begin.';

export function resolveChipReply(chipId) {
  return ASSISTANT_KNOWLEDGE_REPLIES[chipId] || ASSISTANT_WELCOME_MESSAGE;
}

export function resolveAssistantReply(promptText) {
  const lower = String(promptText || '').toLowerCase();
  if (lower.includes('squad')) return ASSISTANT_KNOWLEDGE_REPLIES.squad;
  if (lower.includes('gig') || lower.includes('build')) return ASSISTANT_KNOWLEDGE_REPLIES.gig;
  if (lower.includes('job') || lower.includes('apply')) return ASSISTANT_KNOWLEDGE_REPLIES.jobs;
  if (lower.includes('wallet') || lower.includes('coin')) return ASSISTANT_KNOWLEDGE_REPLIES.wallet;
  return 'EventThon routes growth through Projects, Gigs, Squads, Jobs, and your Wallet. Tap a quick chip for guided onboarding steps.';
}
