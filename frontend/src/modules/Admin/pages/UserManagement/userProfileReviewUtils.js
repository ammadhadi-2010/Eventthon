import { API_BASE_URL } from '../../../../api/axiosConfig';

function coalesceUser(user) {
  return user && typeof user === 'object' && !Array.isArray(user) ? user : {};
}

function coalesceRow(row) {
  return row && typeof row === 'object' && !Array.isArray(row) ? row : {};
}

export function resolveMediaUrl(path) {
  if (!path || typeof path !== 'string') return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return trimmed;
  return `${API_BASE_URL}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

export function getDisplayName(user, row) {
  const combined = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
  return combined || row?.displayName || 'User';
}

export function getProfileAvatar(user, row) {
  const seed = encodeURIComponent(getDisplayName(user, row));
  const raw = user?.profile_image_url || user?.imageurl || row?.imageurl || user?.avatar;
  return resolveMediaUrl(raw) || `https://api.dicebear.com/8.x/avataaars/svg?seed=${seed}`;
}

export function getSkills(user) {
  const record = coalesceUser(user);
  const raw = record.skills || record.top_skills || [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      const name = item?.name || item?.label || item?.skill || '';
      const pct = item?.proficiency != null ? ` (${item.proficiency}%)` : '';
      return `${name}${pct}`.trim();
    })
    .filter(Boolean);
}

export function getRoleLabel(user, row) {
  const record = coalesceUser(user);
  const source = coalesceRow(row);
  const role = (record.role || source.role || 'user').toString();
  const niche = record.niche || record.designation || record.headline || '';
  const base = role.charAt(0).toUpperCase() + role.slice(1);
  return niche ? `${base} · ${niche}` : base;
}

export function getLocationLabel(user) {
  const record = coalesceUser(user);
  const city = (record.city || '').trim();
  const country = (record.country || '').trim();
  if (city && country) return `${city}, ${country}`;
  return city || country || '';
}

export function getLanguages(user) {
  const record = coalesceUser(user);
  if (Array.isArray(record.languages) && record.languages.length) {
    return record.languages.map((l) => String(l).trim()).filter(Boolean);
  }
  if (record.language_preference) return [String(record.language_preference)];
  return [];
}

export function buildPortfolioLinks(user) {
  const record = coalesceUser(user);
  const links = [];
  const push = (id, label, url) => {
    const href = (url || '').trim();
    if (!href) return;
    links.push({ id, label, href: href.startsWith('http') ? href : `https://${href}` });
  };

  push('website', 'Website', record.link_website);
  push('linkedin', 'LinkedIn', record.link_linkedin);
  push('github', 'GitHub', record.link_github);

  if (Array.isArray(record.social_links)) {
    record.social_links.forEach((item, index) => {
      push(
        `social-${index}`,
        item?.platform || item?.label || `Social link ${index + 1}`,
        item?.url || item?.href,
      );
    });
  }

  return links;
}

export function buildVerificationAttachments(user) {
  const record = coalesceUser(user);
  const items = [];
  const add = (id, label, url, kind = 'image') => {
    const resolved = resolveMediaUrl(url);
    if (resolved) items.push({ id, label, url: resolved, kind });
  };

  add('id-front', 'Government ID — Front', record.id_front);
  add('id-back', 'Government ID — Back', record.id_back);
  add('banner', 'Profile banner', record.banner_url || record.banner_image_url);

  if (Array.isArray(record.portfolio_files)) {
    record.portfolio_files.forEach((file, index) => {
      add(
        `portfolio-${index}`,
        file?.label || file?.name || `Portfolio document ${index + 1}`,
        file?.url || file?.path || file?.src,
        file?.kind || 'document',
      );
    });
  }

  if (Array.isArray(record.projects)) {
    record.projects.forEach((project, index) => {
      const title = project?.title || project?.name || `Project ${index + 1}`;
      add(`project-${index}`, title, project?.image_url || project?.cover || project?.thumbnail);
    });
  } else if (Array.isArray(record.project_images)) {
    record.project_images.forEach((url, index) => {
      add(`project-img-${index}`, `Project asset ${index + 1}`, url);
    });
  }

  if (Array.isArray(record.qualifications)) {
    record.qualifications.forEach((doc, index) => {
      add(
        `qual-${index}`,
        doc?.title || doc?.name || `Qualification ${index + 1}`,
        doc?.url || doc?.file_url || doc?.path,
        'document',
      );
    });
  }

  if (Array.isArray(record.experiences)) {
    record.experiences.forEach((exp, index) => {
      if (exp?.logo_url) {
        add(`exp-logo-${index}`, `${exp?.company || 'Company'} logo`, exp.logo_url);
      }
    });
  }

  return items;
}

export function buildProfileSummaryRows(user, row) {
  const record = coalesceUser(user);
  const source = coalesceRow(row);
  const rows = [
    { id: 'email', label: 'Email', value: record.email || source.email },
    { id: 'mobile', label: 'Mobile', value: record.mobile || source.mobile },
    { id: 'role', label: 'System role', value: getRoleLabel(record, source) },
    { id: 'identity', label: 'Identity status', value: record.identity_status || '—' },
    { id: 'admin', label: 'Admin status', value: record.admin_status || source.adminStatus || '—' },
    { id: 'location', label: 'Location', value: getLocationLabel(record) },
    { id: 'availability', label: 'Availability', value: record.availability || '—' },
    { id: 'joined', label: 'Joined', value: source.joined || '—' },
    { id: 'publicId', label: 'Public ID', value: source.publicId, mono: true },
  ];
  return rows.filter((r) => r.value && r.value !== '—');
}

export function isReviewableStatus(adminStatus) {
  return adminStatus === 'pending' || adminStatus === 'unverified';
}

export function resolveUserLookup(row) {
  if (!row || typeof row !== 'object') return null;
  if (row.id) return { id: row.id };
  if (row.email) return { email: row.email };
  const mobile = String(row.mobile || '').trim();
  if (mobile && mobile !== row.handle) return { mobile };
  if (row.handle) return { id: row.handle };
  if (mobile) return { mobile };
  return null;
}

export function buildUserDetailPath(row) {
  const lookup = resolveUserLookup(row);
  if (!lookup) return '/admin-control/users';
  const qs = lookup.id
    ? `id=${encodeURIComponent(lookup.id)}`
    : lookup.email
      ? `email=${encodeURIComponent(lookup.email)}`
      : `mobile=${encodeURIComponent(lookup.mobile)}`;
  return `/admin-control/users/detail?${qs}`;
}

export function parseUserDetailLookup(searchParams) {
  const id = searchParams.get('id')?.trim();
  const email = searchParams.get('email')?.trim();
  const mobile = searchParams.get('mobile')?.trim();
  if (id) return { id };
  if (email) return { email };
  if (mobile) return { mobile };
  return null;
}

export function buildUserFallbackFromRow(row = {}) {
  if (!row || typeof row !== 'object') return null;
  const parts = String(row.displayName || 'User').trim().split(/\s+/);
  return {
    first_name: parts[0] || 'User',
    last_name: parts.slice(1).join(' '),
    email: row.email || '',
    mobile: row.mobile || row.handle || '',
    user_id: row.handle || '',
    profile_image_url: row.imageurl || '',
    role: String(row.role || 'user').toLowerCase(),
    identity_status: row.identityStatus || '',
    admin_status: row.adminStatus || '',
  };
}

export function mergeReviewProfile(seedRow, fetchedUser, fetchedRow) {
  const row = coalesceRow(fetchedRow || seedRow);
  const user = coalesceUser(fetchedUser || buildUserFallbackFromRow(row));
  return { user, row };
}
