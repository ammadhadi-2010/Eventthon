import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PublicShowroomSeo from '../components/PublicShowroomSeo';
import ProjectShowroomView from '../components/showroom/project/ProjectShowroomView';
import { fetchPublicProject } from '../services/publicApi';
import { mapPublicProjectShowroom } from '../components/showroom/project/mapPublicProjectShowroom';

export default function PublicProjectPage({ forceGuest = true }) {
  const { projectId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetchPublicProject(projectId)
      .then((payload) => {
        if (active) setData(mapPublicProjectShowroom(payload));
      })
      .catch((err) => {
        if (!active) return;
        console.error('Public project fetch failed:', err);
        const msg = err.response?.data?.detail || 'Public project is unavailable.';
        setError(typeof msg === 'string' ? msg : 'Public project is unavailable.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  if (loading) {
    return <p className="public-state">Loading public project...</p>;
  }

  if (error || !data) {
    return <p className="public-state public-state--error">{error || 'Project not found.'}</p>;
  }

  const slug = data.publicSlug || projectId;

  return (
    <>
      <PublicShowroomSeo
        title={data.seo_title}
        description={data.seo_description || data.summary}
        keywords={data.keywords || data.techStackTags}
        canonicalPath={`/public/projects/${slug}`}
      />
      <ProjectShowroomView data={data} forceGuest={forceGuest} />
    </>
  );
}
