export function buildAdminProfileForm(profile = {}) {
  return {
    full_name: profile?.full_name || 'Super Administrator',
    email: profile?.email || localStorage.getItem('userEmail') || '',
    imageurl_link: profile?.imageurl || '',
    password: '',
    confirm_password: '',
  };
}

export function buildAdminProfileUpdateFormData(form, avatarFile) {
  const fd = new FormData();
  fd.append('full_name', String(form.full_name || '').trim());
  fd.append('email', String(form.email || '').trim());
  fd.append('imageurl_link', String(form.imageurl_link || '').trim());
  fd.append('password', String(form.password || ''));
  fd.append('confirm_password', String(form.confirm_password || ''));
  if (avatarFile instanceof File) {
    fd.append('imageurl', avatarFile);
  }
  return fd;
}
