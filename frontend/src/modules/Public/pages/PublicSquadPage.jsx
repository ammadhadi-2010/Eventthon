import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PublicSeoHead from '../components/PublicSeoHead';
import SquadShowroomView from '../components/showroom/squad/SquadShowroomView';
import { fetchPublicSquad } from '../services/publicApi';
import '../styles/publicViews.css';
import '../styles/squad-showroom-public.css';

export default function PublicSquadPage() {
  const { squadSlug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetchPublicSquad(squadSlug)
      .then((payload) => {
        if (active) setData(payload);
      })
      .catch((err) => {
        if (!active) return;
        const status = err.response?.status;
        const detail = err.response?.data?.detail;
        let msg = typeof detail === 'string' ? detail : 'Public squad is unavailable.';
        if (status === 403) {
          msg =
            'This squad is private. In the dashboard go to Squad → Settings and turn on “Public listing (show public showroom)”, then try Explore Squad again.';
        } else if (status === 404) {
          msg = 'Squad not found or slug is invalid.';
        }
        setError(msg);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [squadSlug]);

  if (loading) {
    return <p className="public-state">Loading public squad...</p>;
  }

  if (error || !data) {
    return <p className="public-state public-state--error">{error || 'Squad not found.'}</p>;
  }

  return (
    <>
      <PublicSeoHead
        displayName={data.displayName}
        professionalRole={data.professionalRole}
        dynamicBio={data.dynamicBio}
        canonicalPath={`/public/squads/${squadSlug}`}
      />
      <SquadShowroomView data={data} />
    </>
  );
}
