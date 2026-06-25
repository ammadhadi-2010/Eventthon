export function notifyAlertsRefresh() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('et:alerts-changed'));
  }
}
