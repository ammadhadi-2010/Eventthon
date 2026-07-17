/** EventThon — lead hunter outreach branding (no third-party labels). */

export const EVENTTHON_OUTREACH = {
  fromName: 'EventThon Support',
  fromEmail: 'eventthon@gmail.com',
  replyTo: 'eventthon@gmail.com',
  productName: 'EventThon',
};

export function buildPitchDraft({ lead, category, country }) {
  const company = lead?.company || 'your team';
  const focus = category || lead?.category || 'your category';
  const region = country || lead?.country || 'your country';

  return {
    subject: `Grow with EventThon — partnership for ${focus}`,
    headerTitle: 'EventThon',
    headerSubtitle: 'Verified events, gigs, squads & jobs platform',
    greeting: `Hello ${lead?.contact_name || company},`,
    body: [
      `We are reaching out from EventThon regarding opportunities in ${focus} across ${region}.`,
      `Our platform connects verified organizers, talent, and companies for events, gigs, squads, and hiring.`,
      `We would love to explore how ${company} can list opportunities and reach engaged members on EventThon.`,
    ].join('\n\n'),
    signoff: 'Best regards,\nEventThon Support',
    footer: '© EventThon. All rights reserved.',
    metadata: {
      'X-Mailer': 'EventThon Admin Outreach',
      'X-Entity': 'EventThon',
    },
  };
}
