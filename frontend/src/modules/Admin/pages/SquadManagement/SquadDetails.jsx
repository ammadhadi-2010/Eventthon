import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { fetchAdminSquadDetail, fetchAdminSquadMembers } from '../../../../services/adminSquadService';
import { mapSquadSummaryFromApi } from './squadData';
import SquadDetailPane from './SquadDetailPane';
import '../../styles/AdminShell.css';
import '../../styles/AdminCards.css';
import '../UserManagement/userManagement.css';
import './squadDetails.css';

export default function SquadDetails() {
  const { squadId } = useParams();
  const [squad, setSquad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [data, members] = await Promise.all([
          fetchAdminSquadDetail(squadId),
          fetchAdminSquadMembers(squadId).catch(() => []),
        ]);
        if (!data) {
          setNotFound(true);
          return;
        }
        setSquad(
          mapSquadSummaryFromApi({
            ...data,
            members: members.length ? members : data.members,
          }),
        );
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [squadId]);

  if (notFound) return <Navigate to="/admin-control/squads" replace />;
  if (loading || !squad) return null;

  return (
    <div className="um-page sm-page w-full max-w-full p-3 py-2 lg:p-0">
      <header className="um-header sm-header--desktop">
        <div className="um-header-copy">
          <h1 className="um-title">Squad Details</h1>
          <p className="sd-breadcrumb">
            <Link to="/admin-control/squads">Squad Management</Link>
            <ChevronRight size={13} />
            <span>Squad Details</span>
          </p>
        </div>
      </header>
      <SquadDetailPane squad={squad} loading={loading} showClose={false} />
    </div>
  );
}
