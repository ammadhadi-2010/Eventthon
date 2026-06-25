import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PublicSeoHead from '../components/PublicSeoHead';
import PublicProfileCard from '../components/PublicProfileCard';
import { fetchPublicUser } from '../services/publicApi';

export default function PublicUserPage() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetchPublicUser(username)
      .then((payload) => {
        if (active) setData(payload);
      })
      .catch((err) => {
        if (!active) return;
        const msg = err.response?.data?.detail || 'Public profile is unavailable.';
        setError(typeof msg === 'string' ? msg : 'Public profile is unavailable.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [username]);

  if (loading) {
    return <p className="public-state">Loading public profile...</p>;
  }

  if (error || !data) {
    return <p className="public-state public-state--error">{error || 'Profile not found.'}</p>;
  }

  return (
    <>
      <PublicSeoHead
        displayName={data.displayName}
        professionalRole={data.professionalRole}
        dynamicBio={data.dynamicBio}
        canonicalPath={`/public/users/${username}`}
      />
      <PublicProfileCard data={data} />
    </>
  );
}
