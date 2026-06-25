/** Dedicated video attachment helpers for the post wizard modal. */

export const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime,video/x-msvideo';
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const MAX_VIDEO_MB = 50;

const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
]);

export function validateVideoFile(file) {
  if (!file) return { ok: false, error: 'No video selected' };
  if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
    return { ok: false, error: 'Use MP4, WebM, MOV, or AVI video' };
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return { ok: false, error: `Video must be under ${MAX_VIDEO_MB}MB` };
  }
  return { ok: true, error: '' };
}

export function createVideoPreviewState(file) {
  const check = validateVideoFile(file);
  if (!check.ok) return { ok: false, error: check.error, state: null };
  return {
    ok: true,
    error: '',
    state: {
      file,
      name: file.name,
      size: file.size,
      mime: file.type,
      previewUrl: URL.createObjectURL(file),
    },
  };
}

export function revokeVideoPreview(videoState) {
  if (videoState?.previewUrl) {
    URL.revokeObjectURL(videoState.previewUrl);
  }
}

export function formatVideoSize(bytes = 0) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function pickVideoFileFromEvent(event) {
  const file = event?.target?.files?.[0] || null;
  if (event?.target) event.target.value = '';
  return file;
}

export function buildVideoPreviewMarkup(videoState) {
  if (!videoState?.previewUrl) return null;
  return {
    previewUrl: videoState.previewUrl,
    name: videoState.name,
    sizeLabel: formatVideoSize(videoState.size),
  };
}
