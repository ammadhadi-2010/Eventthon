import React from 'react';
import useAdminProfile from './useAdminProfile';
import AdminProfileSidebar from './AdminProfileSidebar';
import AdminProfileCommandConsole from './AdminProfileCommandConsole';
import AdminProfileActivityFeed from './AdminProfileActivityFeed';
import AdminProfileEditModal from './AdminProfileEditModal';
import AdminProfileSuccessToast from './AdminProfileSuccessToast';
import './admin-profile.css';
import './admin-profile-feed.css';
import './admin-profile-edit.css';

export default function AdminProfilePage() {
  const state = useAdminProfile();

  return (
    <div className="ap-profile-page admin-panel">
      <header className="ap-page-head">
        <div>
          <h1>Admin Profile Core</h1>
          <p>Premium command identity wrapped in the user-profile experience with admin metrics.</p>
        </div>
        <button type="button" className="ap-edit-btn" onClick={() => state.setEditOpen(true)}>
          📝 Edit Profile
        </button>
      </header>

      <div className="ap-profile-layout">
        <AdminProfileSidebar profile={state.profile} />

        <main className="ap-profile-main">
          <AdminProfileCommandConsole
            profile={state.profile}
            onCommand={state.executeCommand}
            runningCommand={state.runningCommand}
            statusText={state.statusText}
          />
          <AdminProfileActivityFeed
            items={state.profile?.activity_feed || []}
            loading={state.loading}
          />
        </main>
      </div>

      <AdminProfileEditModal
        open={state.editOpen}
        profile={state.profile}
        saving={state.savingProfile}
        errorText={state.editError}
        onClose={() => state.setEditOpen(false)}
        onSubmit={state.saveProfile}
      />

      <AdminProfileSuccessToast open={state.successOpen} onClose={() => state.setSuccessOpen(false)} />
    </div>
  );
}
