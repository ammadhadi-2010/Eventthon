export function mapOutreachLead(row = {}) {
  return {
    id: row.id,
    company: row.company || 'Partner',
    website: row.website || '',
    contactEmail: row.contactEmail || row.email || '',
    contactName: row.contactName || row.contact_name || '',
    status: row.status || 'not_contacted',
    lastContact: row.lastContact || '—',
    imageurl: row.imageurl || '',
    category: row.category || '',
    country: row.country || '',
    city: row.city || '',
  };
}

export function composeDraftFromLead(row) {
  return {
    leadId: row.id,
    to: row.contactEmail || row.email || '',
    subject: `Partnership & Feedback Opportunity with EventThon — ${row.company}`,
  };
}
