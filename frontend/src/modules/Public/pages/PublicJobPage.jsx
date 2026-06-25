import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PublicShowroomSeo from '../components/PublicShowroomSeo';
import JobShowroomView from '../components/showroom/job/JobShowroomView';
import { fetchPublicJob } from '../services/publicApi';

export default function PublicJobPage({ forceGuest = true }) {
  const { jobId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetchPublicJob(jobId)
      .then((payload) => {
        if (active) setData(payload);
      })
      .catch((err) => {
        if (!active) return;
        const msg = err.response?.data?.detail || 'Public job is unavailable.';
        setError(typeof msg === 'string' ? msg : 'Public job is unavailable.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [jobId]);

  if (loading) {
    return <p className="public-state">Loading public job...</p>;
  }

  if (error || !data) {
    return <p className="public-state public-state--error">{error || 'Job not found.'}</p>;
  }

  const slug = data.publicSlug || jobId;

  return (
    <>
      <PublicShowroomSeo
        title={data.seo_title}
        description={data.seo_description || data.summary}
        keywords={data.keywords || data.skills_tags}
        canonicalPath={`/public/jobs/${slug}`}
      />
      <JobShowroomView data={data} forceGuest={forceGuest} />
    </>
  );
}
