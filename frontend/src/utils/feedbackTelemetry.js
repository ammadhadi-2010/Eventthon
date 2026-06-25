export function capturePageUrl() {
  if (typeof window === 'undefined') return '';
  return String(window.location.href || '').trim();
}

export function parseClientDevice(userAgent = '') {
  const ua = String(userAgent || navigator.userAgent || '').trim();
  const isTablet = /iPad|Tablet|PlayBook/i.test(ua);
  const isMobile = !isTablet && /Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua);

  let browser = 'Unknown Browser';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
  else if (/Chrome\//i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua)) browser = 'Safari';

  const device = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';
  return {
    userAgent: ua,
    browser,
    device,
    summary: `${browser} on ${device}`,
  };
}

export function captureClientDevice() {
  return parseClientDevice(navigator.userAgent);
}
