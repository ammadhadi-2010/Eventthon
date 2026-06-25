import { getPostIdentifier } from './postWizardApi';
import { AI_HIGHLIGHT_TYPES } from './postWizardTypes';

export function buildWizardFormData({
  content,
  postType,
  userData,
  imageFile,
  videoFile,
  meta = {},
}) {
  const formData = new FormData();
  formData.append('content', content);
  formData.append('post_type', postType);
  formData.append('identifier', getPostIdentifier(userData));

  if (postType === 'PROJECT') {
    const progress = Number(meta.progress_percent ?? 0);
    formData.append('progress_percent', String(Math.min(100, Math.max(0, progress))));
  }

  if (postType === 'WIN' && meta.achievement_metric) {
    formData.append('achievement_metric', String(meta.achievement_metric));
  }

  if (postType === 'SQUAD' && meta.attach_to_squad) {
    formData.append('attach_to_squad', 'true');
    if (meta.squad_id) {
      formData.append('squad_id', String(meta.squad_id));
    }
  }

  if (AI_HIGHLIGHT_TYPES.includes(postType)) {
    formData.append('ai_highlight_review', 'true');
  }

  if (imageFile) formData.append('files', imageFile);
  if (videoFile) formData.append('files', videoFile);

  return formData;
}
