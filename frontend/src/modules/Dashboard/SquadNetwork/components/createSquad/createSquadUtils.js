export const SQUAD_CATEGORIES = [
  'SEO & Marketing',
  'Web Development',
  'UI/UX Design',
  'AI & Machine Learning',
  'Content Writing',
  'Freelancing & Business',
];

export const INITIAL_CREATE_SQUAD_FORM = {
  name: '',
  category: '',
  description: '',
  privacy: 'public',
  bannerPreview: '',
  bannerFile: null,
  allowMemberInvites: true,
  requireAdminApproval: true,
  enableProjects: true,
  enableChat: true,
  invitedUserIds: [],
};

export function validateCreateSquadForm(form, { draft = false } = {}) {
  const errors = {};
  const name = form.name.trim();
  const description = form.description.trim();

  if (!name) errors.name = 'Squad name is required.';
  else if (name.length > 50) errors.name = 'Name must be 50 characters or less.';

  if (!draft) {
    if (!form.category) errors.category = 'Select a category.';
    if (!description) errors.description = 'Description is required.';
    else if (description.length < 20) errors.description = 'Description must be at least 20 characters.';
    else if (description.length > 200) errors.description = 'Description must be 200 characters or less.';
  }

  return errors;
}

export function buildCreateSquadSettings(form) {
  return {
    publicListing: form.privacy === 'public',
    inviteOthers: form.allowMemberInvites,
    memberApproval: form.requireAdminApproval,
    enableProjects: form.enableProjects,
    enableChat: form.enableChat,
    adminProjectCreate: !form.enableProjects,
  };
}
