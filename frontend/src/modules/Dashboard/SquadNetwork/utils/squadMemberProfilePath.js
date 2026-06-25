/** Best-effort profile route for squad invite / member rows. */
export function squadMemberProfilePath(user) {
  const ref = user?._id || user?.user_id || user?.email || user?.mobile;
  if (ref) return `/profile?ref=${encodeURIComponent(String(ref).trim())}`;
  return '/profile';
}
