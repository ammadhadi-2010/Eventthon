/** Session headers for messaging API ownership checks. */

export function getMessagesSessionHeaders() {
  const headers = {};
  const email = localStorage.getItem('userEmail');
  const mobile = localStorage.getItem('userMobile');
  if (email) headers['X-User-Email'] = email;
  if (mobile) headers['X-User-Mobile'] = mobile;
  return headers;
}

export function getMessagesSenderId(userData) {
  return String(
    userData?.email ||
      userData?.mobile ||
      userData?.user_id ||
      userData?._id ||
      localStorage.getItem('userEmail') ||
      localStorage.getItem('userMobile') ||
      localStorage.getItem('userId') ||
      localStorage.getItem('user_id') ||
      '',
  ).trim();
}

export function hasMessagesSession() {
  return Boolean(localStorage.getItem('userEmail') || localStorage.getItem('userMobile'));
}
