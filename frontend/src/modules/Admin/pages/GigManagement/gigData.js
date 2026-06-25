import { API_BASE_URL } from '../../../../api/axiosConfig';

export const GIG_FILTER_TABS = ['ALL GIGS', 'ACTIVE', 'PENDING', 'COMPLETED', 'CANCELLED'];

export const GIG_STATS = [
  { id: 'totalGigs', label: 'Total Gigs', value: '0', change: '+0%', detail: 'live count', color: '#8b5cf6', icon: 'users' },
  { id: 'activeGigs', label: 'Active Gigs', value: '0', change: '+0%', detail: 'published', color: '#10b981', icon: 'activity' },
  { id: 'pendingApproval', label: 'Pending Approval', value: '0', change: '+0%', detail: 'awaiting review', color: '#ef4444', icon: 'userX' },
  { id: 'completedGigs', label: 'Completed Gigs', value: '0', change: '+0%', detail: 'fulfilled', color: '#06b6d4', icon: 'badgeCheck' },
];

export const GIG_STATUS_CLASS = {
  ACTIVE: 'um-status--active',
  PENDING: 'um-status--pending',
  COMPLETED: 'um-status--active',
  CANCELLED: 'um-status--deleted',
};

export function resolveGigMediaUrl(path) {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return trimmed;
  return `${API_BASE_URL}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

export function gigAvatar(seed) {
  return `https://api.dicebear.com/8.x/personas/svg?seed=${encodeURIComponent(seed)}`;
}

export function resolveGigImageurl(row = {}) {
  const raw = String(row.imageurl || row.cover_imageurl || row.cover_image || '').trim();
  if (raw) return resolveGigMediaUrl(raw) || raw;
  return gigAvatar(row.title || 'gig');
}

export function gigInitials(title = '') {
  const words = String(title).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'GD';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function isMobileLike(value = '') {
  return /^\+?\d{10,15}$/.test(String(value).replace(/\s/g, ''));
}

export function displayPosterName(gig = {}) {
  if (gig.seller?.name) return gig.seller.name;
  if (gig.postedByName && !isMobileLike(gig.postedByName)) return gig.postedByName;
  const handle = String(gig.seller?.handle || gig.postedBy || '').replace('@', '');
  if (!handle || isMobileLike(handle)) return 'Seller';
  return handle
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function displayPosterHandle(gig = {}) {
  const handle = gig.seller?.handle || gig.postedBy || '@seller';
  const raw = String(handle).replace('@', '');
  if (isMobileLike(raw)) return '@seller';
  return handle.startsWith('@') ? handle : `@${handle}`;
}

export function posterAvatarUrl(gig = {}) {
  const seller = gig.seller || {};
  const raw = String(seller.imageurl || seller.avatarUrl || seller.profile_image_url || '').trim();
  if (raw) return resolveGigMediaUrl(raw) || raw;
  if (gig.posterAvatar) return resolveGigMediaUrl(gig.posterAvatar) || gig.posterAvatar;
  return gigAvatar(displayPosterName(gig));
}

function mapAdminStatus(item = {}) {
  if (item.admin_status) return item.admin_status;
  const statusRaw = String(item.status || '').toLowerCase();
  if (statusRaw === 'published' || statusRaw === 'active' || statusRaw === 'live') return 'ACTIVE';
  if (statusRaw === 'completed') return 'COMPLETED';
  if (statusRaw === 'cancelled' || statusRaw === 'canceled' || statusRaw === 'suspended') return 'CANCELLED';
  return 'PENDING';
}

function formatBudget(item = {}) {
  if (item.budget_label) return item.budget_label;
  const price = Number(item.starting_price || item.price || 0);
  if (price <= 0) return '—';
  const high = Number(item.max_price || Math.max(price * 2, price));
  return `$${price.toFixed(0)} - $${high.toFixed(0)}`;
}

export function mapProposalFromApi(item = {}) {
  const name = item.freelancerName || item.freelancer || 'Freelancer';
  const avatarRaw = item.imageurl || item.avatarUrl || '';
  return {
    id: String(item.id || item._id || ''),
    freelancerName: name,
    handle: item.handle || '@freelancer',
    avatarUrl: resolveGigMediaUrl(avatarRaw) || gigAvatar(name),
    amount: item.amount || item.bid || '$0',
    deliveryTime: item.deliveryTime || item.eta || '7 Days',
    status: item.status || 'Pending',
    coverLetter: item.coverLetter || '',
    skills: Array.isArray(item.skills) ? item.skills : [],
    attachments: Array.isArray(item.attachments) ? item.attachments : [],
    online: Boolean(item.online),
  };
}

export function mapMilestoneFromApi(item = {}, index = 0) {
  return {
    id: String(item.id || index),
    title: item.title || `Milestone ${index + 1}`,
    amount: item.amount || '$0',
    dueDate: item.dueDate || item.due || '—',
    status: item.status || 'Pending',
  };
}

export function mapActivityFromApi(item = {}, index = 0) {
  return {
    id: String(item.id || index),
    text: item.text || item.message || 'Activity update',
    at: item.at || item.time || '—',
    type: item.type || 'update',
  };
}

export function getGigById() {
  return null;
}

export function getGigDetailTabs(gig) {
  const proposals = Array.isArray(gig?.proposals) ? gig.proposals.length : 0;
  const milestones = Array.isArray(gig?.milestones) ? gig.milestones.length : 0;
  return ['Overview', `Proposals (${proposals})`, `Milestones (${milestones})`, 'Activity', 'Settings'];
}

export function mapGigFromApi(item = {}) {
  const status = mapAdminStatus(item);
  const seller = item.seller || {};
  const sellerImage = resolveGigMediaUrl(seller.imageurl || seller.avatarUrl || seller.profile_image_url || '');
  const cleanDesc = String(item.description || 'No description available.')
    .replace(/&nbsp;/g, ' ')
    .trim();
  const postedOn =
    item.posted_on ||
    (item.created_at
      ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '—');
  return {
    id: String(item._id || item.id || ''),
    title: item.title || 'Untitled Gig',
    category: item.category || 'General',
    subCategory: item.service_type || item.subCategory || 'General',
    imageurl: item.imageurl || item.cover_imageurl || '',
    seller: { ...seller, imageurl: sellerImage || seller.imageurl || seller.avatarUrl || '' },
    postedBy: displayPosterHandle({ seller, postedBy: item.seller_user_id ? `@${item.seller_user_id}` : '@seller' }),
    postedByName: seller.name || item.seller_name || displayPosterName({ seller }),
    posterAvatar: sellerImage || null,
    budget: formatBudget(item),
    startingPrice: Number(item.starting_price || item.price || 0),
    status,
    postedOn,
    deliveryTime: item.delivery_time || '7 Days',
    experienceLevel: item.seller_level || 'Mid Level',
    location: item.location || 'Remote',
    gigType: item.gig_type || 'Fixed Price',
    description: cleanDesc,
    requirements: Array.isArray(item.requirements) && item.requirements.length
      ? item.requirements
      : ['Clear scope and milestones', 'On-time communication', 'Production-ready delivery'],
    skills: Array.isArray(item.tags) && item.tags.length ? item.tags : ['General'],
    proposals: Array.isArray(item.proposals) ? item.proposals.map(mapProposalFromApi) : [],
    milestones: Array.isArray(item.milestones) ? item.milestones.map(mapMilestoneFromApi) : [],
    activities: Array.isArray(item.activities) ? item.activities.map(mapActivityFromApi) : [],
  };
}
