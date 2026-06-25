import API from '../../../../api/axiosConfig';
import { buildWizardFormData } from './postWizardFormData';

export function getPostIdentifier(userData) {
  return userData?.email || userData?.mobile || localStorage.getItem('userEmail') || localStorage.getItem('userMobile') || '';
}

export async function enhancePostText(text, postType = 'POST') {
  const res = await API.post('/api/posts/enhance', { text, post_type: postType }, { timeout: 45000 });
  return res?.data?.enhanced_text || '';
}

export async function submitPostWizard({
  content,
  postType,
  userData,
  imageFile,
  videoFile,
  meta = {},
}) {
  const identifier = getPostIdentifier(userData);
  if (!identifier) throw new Error('Login required to post');

  const formData = buildWizardFormData({
    content,
    postType,
    userData,
    imageFile,
    videoFile,
    meta,
  });

  const res = await API.post('/api/posts/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
  return res?.data;
}
