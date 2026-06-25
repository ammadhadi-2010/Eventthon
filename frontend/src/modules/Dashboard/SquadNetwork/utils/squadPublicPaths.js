export function slugifySquadName(name) {
  return String(name || 'squad')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isSquadPubliclyListed(squad) {
  return squad?.settings?.publicListing !== false;
}

export function squadPublicPath(squad) {
  if (!squad) return '/public/squads/seo-masters';
  const slug = squad.slug || slugifySquadName(squad.squad_name) || String(squad._id || '').trim();
  if (!slug) return '/public/squads/seo-masters';
  return `/public/squads/${encodeURIComponent(slug)}`;
}
