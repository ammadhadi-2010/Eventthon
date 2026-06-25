import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, UserPlus } from 'lucide-react';
import UserManagementStats from './UserManagementStats';
import UserManagementToolbar from './UserManagementToolbar';
import UserManagementTable from './UserManagementTable';
import UserManagementPagination from './UserManagementPagination';
import AddUserModal from './AddUserModal';
import useUserManagement from './useUserManagement';
import { buildUserDetailPath } from './userProfileReviewUtils';
import '../../styles/AdminShell.css';
import '../../styles/AdminCards.css';
import './userManagement.css';

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const {
    statCards,
    rows,
    totalItems,
    totalPages,
    pageSize,
    listLoading,
    error,
    activeTab,
    setActiveTab,
    page,
    setPage,
    exportCsv,
    addUser,
    userAction,
  } = useUserManagement();

  const openUserDetail = (row) => {
    navigate(buildUserDetailPath(row), { state: { seedRow: row } });
  };

  return (
    <div className="um-page w-full max-w-full p-3 py-2 lg:p-0">
      {error ? (
        <div className="um-banner-error" role="alert">
          {typeof error === 'string' ? error : 'Something went wrong'}
        </div>
      ) : null}

      <header className="um-header um-header--tight">
        <h1 className="um-title um-title--mobile">User Management</h1>
        <div className="um-header-actions um-header-actions--inline">
          <button type="button" className="um-btn um-btn--ghost um-btn--compact" onClick={exportCsv}>
            <Download size={13} strokeWidth={2} />
            Export
          </button>
          <button type="button" className="um-btn um-btn--primary um-btn--compact" onClick={() => setAddOpen(true)}>
            <UserPlus size={13} strokeWidth={2} />
            Add
          </button>
        </div>
      </header>

      <UserManagementStats stats={statCards} />

      <section className="um-card um-card--tight">
        <UserManagementToolbar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="um-table-block um-table-block--tight">
          <UserManagementTable
            rows={rows}
            onUserAction={userAction}
            onOpenUser={openUserDetail}
            loading={listLoading}
          />
        </div>
        <UserManagementPagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      </section>

      <AddUserModal open={addOpen} onClose={() => setAddOpen(false)} onSubmit={addUser} />
    </div>
  );
}
