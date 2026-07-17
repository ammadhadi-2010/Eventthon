export const OUTREACH_PAGE_SIZE = 10;

export const OUTREACH_TABS = [
  { id: 'all', label: 'All Leads' },
  { id: 'not_contacted', label: 'Not Contacted' },
  { id: 'emailed', label: 'Emailed' },
  { id: 'replied', label: 'Replied' },
  { id: 'interested', label: 'Interested' },
];

export const OUTREACH_STATUS_META = {
  emailed: { label: 'Emailed', tone: 'blue' },
  opened: { label: 'Opened', tone: 'green' },
  replied: { label: 'Replied', tone: 'purple' },
  not_contacted: { label: 'Not Contacted', tone: 'gray' },
  interested: { label: 'Interested', tone: 'violet' },
};

const BASE_LEADS = [
  { company: 'Cambridge Dictionary', website: 'cambridge.org', contactEmail: 'info@cambridge.org', status: 'emailed', lastContact: '2 days ago', imageurl: '' },
  { company: 'Merriam-Webster', website: 'm-w.com', contactEmail: 'info@m-w.com', status: 'opened', lastContact: '1 day ago', imageurl: '' },
  { company: 'Britannica', website: 'britannica.com', contactEmail: 'info@britannica.com', status: 'replied', lastContact: '5 hours ago', imageurl: '' },
  { company: 'Oxford Dictionary', website: 'oxfordonline.com', contactEmail: 'info@oxfordonline.com', status: 'not_contacted', lastContact: '—', imageurl: '' },
  { company: 'Collins Dictionary', website: 'collinsdictionary.com', contactEmail: 'info@collinsdictionary.com', status: 'emailed', lastContact: '3 days ago', imageurl: '' },
  { company: 'Macmillan Education', website: 'macmillandictionary.com', contactEmail: 'hello@macmillan.com', status: 'opened', lastContact: '6 hours ago', imageurl: '' },
  { company: 'Longman Dictionaries', website: 'ldoceonline.com', contactEmail: 'support@pearson.com', status: 'interested', lastContact: '1 hour ago', imageurl: '' },
  { company: 'WordReference', website: 'wordreference.com', contactEmail: 'contact@wordreference.com', status: 'replied', lastContact: '12 hours ago', imageurl: '' },
  { company: 'YourDictionary', website: 'yourdictionary.com', contactEmail: 'team@yourdictionary.com', status: 'not_contacted', lastContact: '—', imageurl: '' },
  { company: 'Vocabulary.com', website: 'vocabulary.com', contactEmail: 'hello@vocabulary.com', status: 'emailed', lastContact: '4 days ago', imageurl: '' },
  { company: 'Grammarly', website: 'grammarly.com', contactEmail: 'partners@grammarly.com', status: 'opened', lastContact: '8 hours ago', imageurl: '' },
  { company: 'Duolingo', website: 'duolingo.com', contactEmail: 'business@duolingo.com', status: 'interested', lastContact: '30 mins ago', imageurl: '' },
  { company: 'Babbel', website: 'babbel.com', contactEmail: 'press@babbel.com', status: 'emailed', lastContact: '2 days ago', imageurl: '' },
  { company: 'Rosetta Stone', website: 'rosettastone.com', contactEmail: 'info@rosettastone.com', status: 'not_contacted', lastContact: '—', imageurl: '' },
  { company: 'Memrise', website: 'memrise.com', contactEmail: 'hello@memrise.com', status: 'replied', lastContact: '3 hours ago', imageurl: '' },
  { company: 'Lingoda', website: 'lingoda.com', contactEmail: 'partners@lingoda.com', status: 'opened', lastContact: '18 hours ago', imageurl: '' },
  { company: 'Busuu', website: 'busuu.com', contactEmail: 'info@busuu.com', status: 'emailed', lastContact: '5 days ago', imageurl: '' },
  { company: 'Preply', website: 'preply.com', contactEmail: 'business@preply.com', status: 'interested', lastContact: '2 hours ago', imageurl: '' },
  { company: 'italki', website: 'italki.com', contactEmail: 'support@italki.com', status: 'not_contacted', lastContact: '—', imageurl: '' },
  { company: 'Cambly', website: 'cambly.com', contactEmail: 'hello@cambly.com', status: 'replied', lastContact: '7 hours ago', imageurl: '' },
];

function expandSeedRows() {
  const rows = [];
  for (let batch = 0; batch < 128; batch += 1) {
    BASE_LEADS.forEach((item, index) => {
      const id = `lead-${batch}-${index}`;
      rows.push({
        id,
        ...item,
        company: batch === 0 ? item.company : `${item.company} ${batch + 1}`,
        contactEmail: batch === 0 ? item.contactEmail : item.contactEmail.replace('@', `+${batch}@`),
      });
    });
  }
  return rows;
}

export const OUTREACH_SEED_LEADS = expandSeedRows();

export function outreachTabCounts(rows) {
  const all = rows.length;
  const notContacted = rows.filter((r) => r.status === 'not_contacted').length;
  const emailed = rows.filter((r) => r.status === 'emailed' || r.status === 'opened').length;
  const replied = rows.filter((r) => r.status === 'replied').length;
  const interested = rows.filter((r) => r.status === 'interested').length;
  return { all, not_contacted: notContacted, emailed, replied, interested };
}

export function filterOutreachLeads(rows, { tab, query }) {
  const q = String(query || '').trim().toLowerCase();
  let list = rows;
  if (tab === 'not_contacted') list = list.filter((r) => r.status === 'not_contacted');
  else if (tab === 'emailed') list = list.filter((r) => r.status === 'emailed' || r.status === 'opened');
  else if (tab === 'replied') list = list.filter((r) => r.status === 'replied');
  else if (tab === 'interested') list = list.filter((r) => r.status === 'interested');
  if (!q) return list;
  return list.filter((row) => {
    const hay = `${row.company} ${row.website} ${row.contactEmail}`.toLowerCase();
    return hay.includes(q);
  });
}

export function paginateRows(rows, page, pageSize = OUTREACH_PAGE_SIZE) {
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    totalPages,
    totalItems,
    slice: rows.slice(start, start + pageSize),
  };
}
