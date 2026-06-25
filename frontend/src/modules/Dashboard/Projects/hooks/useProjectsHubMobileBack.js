import { useCallback } from 'react';

export default function useProjectsHubMobileBack({ activeMenu, setActiveMenu, pathname, navigate, onCancelCreate }) {
  const showMobileBack = activeMenu !== 'overview' && activeMenu !== 'create-project';

  const handleMobileBack = useCallback(() => {
    if (activeMenu === 'create-project') {
      onCancelCreate();
      return;
    }
    const path = pathname.replace(/\/+$/, '');
    if (path.endsWith('/projects/activity') || path.endsWith('/projects/top-collaborators')) {
      setActiveMenu('overview');
      navigate('/projects');
      return;
    }
    if (activeMenu !== 'overview') {
      setActiveMenu('overview');
      return;
    }
    if (window.history.length > 1) navigate(-1);
    else navigate('/projects');
  }, [activeMenu, setActiveMenu, pathname, navigate, onCancelCreate]);

  return { showMobileBack, handleMobileBack };
}
