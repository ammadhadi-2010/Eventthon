/** Resolve squad profile image from API payload (imageurl, banner, etc.). */
import { resolveDashboardMediaUrl, pickImageurl } from '../../utils/dashboardMedia';

export function getSquadImageUrl(squad) {
  if (!squad) return '';
  const raw = pickImageurl(squad) || squad.banner || '';
  if (!raw || raw.includes('ep-live-preview')) return '';
  return resolveDashboardMediaUrl(raw) || (raw.startsWith('http') ? raw : '');
}

export function getSquadInitials(squad) {
  const name = squad?.squad_name || squad?.name || 'Squad';
  const icon = squad?.icon;
  if (icon && String(icon).length <= 3) return String(icon).toUpperCase();
  return name.charAt(0).toUpperCase();
}
