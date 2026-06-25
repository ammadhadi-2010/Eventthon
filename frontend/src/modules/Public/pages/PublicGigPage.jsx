import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PublicShowroomSeo from '../components/PublicShowroomSeo';
import GigShowroomView from '../components/showroom/gig/GigShowroomView';
import { mapPublicGigShowroom } from '../components/showroom/gig/mapPublicGigShowroom';
import { fetchPublicGig } from '../services/publicApi';
import '../styles/showroom-gig-mobile.css';

export default function PublicGigPage({ forceGuest = true }) {
  const { gigId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetchPublicGig(gigId)
      .then((payload) => {
        if (active) setData(mapPublicGigShowroom(payload));
      })
      .catch((err) => {
        if (!active) return;
        const msg = err.response?.data?.detail || 'Public gig is unavailable.';
        setError(typeof msg === 'string' ? msg : 'Public gig is unavailable.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [gigId]);

  if (loading) {
    return <p className="public-state">Loading public gig...</p>;
  }

  if (error || !data) {
    return <p className="public-state public-state--error">{error || 'Gig not found.'}</p>;
  }

  return (
    <>
      <PublicShowroomSeo
        title={data.seo_title}
        description={data.seo_description || data.serviceDescription}
        keywords={data.keywords || data.skills_tags}
        canonicalPath={`/public/gigs/${gigId}`}
        ogType="website"
      />
      <GigShowroomView data={data} forceGuest={forceGuest} />
    </>
  );
}
