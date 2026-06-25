import React from 'react';
import useAdminHubAccess from './useAdminHubAccess';
import SwitchToAdminButton from './SwitchToAdminButton';

export default function AdminHubSwitch({ user }) {
  const { showSwitchToAdmin } = useAdminHubAccess(user);

  if (!showSwitchToAdmin) return null;

  return <SwitchToAdminButton />;
}
