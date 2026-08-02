import API from '../../../api/axiosConfig';

export async function subscribeNewsletter(email) {
  const { data } = await API.post(
    '/api/newsletter/subscribe',
    { email },
    { timeout: 15000 },
  );
  return data;
}
