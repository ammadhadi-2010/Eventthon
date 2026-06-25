export function slugifyProjectTitle(title) {
  return String(title || 'project')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function projectShowroomPath(project) {
  const slug =
    project?.public_slug ||
    project?.publicSlug ||
    project?.slug ||
    slugifyProjectTitle(project?.title);
  return `/public/projects/${slug}`;
}

export function openProjectShowroom(project) {
  const path = projectShowroomPath(project);
  window.open(path, '_blank', 'noopener,noreferrer');
}
