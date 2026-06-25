/** Normalize API hub project rows for table components. */
export function mapHubTableRow(row) {
  return {
    ...row,
    name: row.name || row.title,
    iconTone: row.icon_tone || row.iconTone || 'web',
    teamExtra: row.team_extra ?? row.teamExtra ?? 0,
    iconGlyph: row.icon_glyph || row.iconGlyph || '',
  };
}

export function mapSavedRow(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    savedOn: row.saved_on_label || row.savedOn,
    category: row.category,
    ownerName: row.owner_name || row.ownerName,
    ownerInitials: row.owner_initials || row.ownerInitials,
    iconTone: row.icon_tone || row.iconTone || 'web',
    iconGlyph: row.icon_glyph || row.iconGlyph || '',
  };
}
