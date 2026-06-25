/** Resolve squad profile image from API payload (imageurl, banner, etc.). */
export function getSquadImageUrl(squad) {
  if (!squad) return '';
  const url =
    squad.imageurl ||
    squad.imageUrl ||
    squad.image_url ||
    squad.banner ||
    squad.avatar ||
    '';
  return typeof url === 'string' && url.trim() ? url.trim() : '';
}

export function getSquadInitials(squad) {
  const name = squad?.squad_name || squad?.name || 'Squad';
  const icon = squad?.icon;
  if (icon && String(icon).length <= 3) return String(icon).toUpperCase();
  return name.charAt(0).toUpperCase();
}
