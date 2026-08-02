/** Browse Jobs — feed tab labels + client filters on live API rows. */

export const JOBS_FEED_TABS = [
  'Recommended',
  'Latest Jobs',
  'Most Popular',
  'Remote Jobs',
  'Top Companies',
];

function isRemote(job) {
  return Boolean(
    job?.remote ||
      /remote/i.test(String(job?.workMode || '')) ||
      /remote/i.test(String(job?.location || '')),
  );
}

export function filterJobsByTab(jobs, tab) {
  const list = Array.isArray(jobs) ? jobs : [];
  if (tab === 'Remote Jobs') {
    return list.filter(isRemote);
  }
  if (tab === 'Top Companies') {
    return list.filter(
      (j) => String(j?.listingKind || 'company') !== 'opportunity' && Boolean(j?.company),
    );
  }
  // Recommended / Latest / Most Popular — show live search results as returned
  return list;
}
