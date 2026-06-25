import API from '../../../api/axiosConfig';
import { getAlertsSessionHeaders } from '../Alerts/utils/alertsSession';

export async function fetchDashboardUpdates() {
  try {
    const res = await API.get('/api/updates', {
      headers: getAlertsSessionHeaders(),
      timeout: 8000,
    });
    return res?.data?.status === 'success' ? res.data.data || [] : [];
  } catch (err) {
    console.error('Updates fetch failed:', err);
    return [];
  }
}
