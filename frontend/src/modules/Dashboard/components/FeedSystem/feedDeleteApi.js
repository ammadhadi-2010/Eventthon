import API from '../../../../api/axiosConfig';

function getSessionIdentifier(userData) {
  return (
    userData?.email ||
    userData?.mobile ||
    (userData?._id ? String(userData._id) : '') ||
    localStorage.getItem('userEmail') ||
    localStorage.getItem('userMobile') ||
    localStorage.getItem('userId') ||
    localStorage.getItem('user_id') ||
    ''
  );
}

/** Permanent hard delete for home feed items (posts or articles). */
export async function hardDeleteFeedItem(item, userData) {
  const id = item?._id || item?.id;
  if (!id) throw new Error('Missing item id');

  const postType = String(item?.post_type || 'POST').toUpperCase();
  if (postType === 'ARTICLE') {
    const identifier = getSessionIdentifier(userData);
    if (!identifier) throw new Error('Login required to delete article');
    const res = await API.delete(`/api/articles/articles/${encodeURIComponent(id)}`, {
      params: { identifier },
    });
    return res?.data;
  }

  const res = await API.delete(`/api/posts/delete/${encodeURIComponent(id)}`);
  return res?.data;
}
