import React, { useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import useUserDetail from './useUserDetail';
import UserDetailView from './UserDetailView';
import { parseUserDetailLookup } from '../UserManagement/userProfileReviewUtils';
import '../../styles/AdminShell.css';
import './userDetail.css';
import '../UserManagement/userProfileReview.css';

export default function UserDetailPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const lookup = useMemo(() => parseUserDetailLookup(searchParams), [searchParams]);
  const seedRow = location.state?.seedRow || null;
  const { user, row, loading, error, actionKey, refetch } = useUserDetail(lookup, seedRow);
  const hasProfile = user && Object.keys(user).length > 0;

  if (!lookup) {
    return (
      <div className="ud-page">
        <p className="ud-empty">No user selected.</p>
        <Link to="/admin-control/users" className="ud-back-link">
          ← Back to User Management
        </Link>
      </div>
    );
  }

  return (
    <div className="ud-page">
      {error ? (
        <div className="ud-error ud-error--warn" role="status">
          {typeof error === 'string' ? error : 'Could not load full profile'} Showing available data.
        </div>
      ) : null}

      {loading && !hasProfile ? <p className="ud-loading">Loading full profile…</p> : null}

      {hasProfile ? (
        <UserDetailView user={user} row={row} actionKey={actionKey} loading={loading} onRefetch={refetch} />
      ) : null}

      {!loading && !hasProfile && !error ? (
        <p className="ud-empty">
          User not found.{' '}
          <Link to="/admin-control/users" className="ud-back-link">
            Back to list
          </Link>
        </p>
      ) : null}
    </div>
  );
}
