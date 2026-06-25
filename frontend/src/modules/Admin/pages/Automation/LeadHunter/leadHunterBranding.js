/** EventThon Network — lead hunter outreach branding (no third-party labels). */

export const EVENTTHON_OUTREACH = {
  fromName: 'EventThon Network',
  fromEmail: 'outreach@eventthon.network',
  replyTo: 'support@eventthon.network',
  productName: 'EventThon Network',
};

export function buildPitchDraft({ lead, category, country }) {
  const company = lead?.company || 'your team';
  const focus = category || lead?.category || 'your category';
  const region = country || lead?.country || 'your country';

  return {
    subject: `Grow with EventThon Network — partnership for ${focus}`,
    headerTitle: 'EventThon Network',
    headerSubtitle: 'Verified events, gigs, squads & jobs platform',
    greeting: `Hello ${lead?.contact_name || company},`,
    body: [
      `We are reaching out from EventThon Network regarding opportunities in ${focus} across ${region}.`,
      `Our platform connects verified organizers, talent, and companies for events, gigs, squads, and hiring.`,
      `We would love to explore how ${company} can list opportunities and reach engaged members on EventThon Network.`,
    ].join('\n\n'),
    signoff: 'Best regards,\nEventThon Network Outreach Team',
    footer: '© EventThon Network. All rights reserved.',
    metadata: {
      'X-Mailer': 'EventThon Network Admin Outreach',
      'X-Entity': 'EventThon Network',
    },
  };
}
