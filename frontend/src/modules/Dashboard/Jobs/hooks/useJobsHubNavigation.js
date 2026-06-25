import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { jobMenu } from '../data/jobsMenuData';

const MENU_IDS = new Set(jobMenu.map((item) => item.id));

export function useJobsHubNavigation(defaultSection = 'browse') {
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeSection = useMemo(() => {
    if (sectionId && MENU_IDS.has(sectionId)) return sectionId;
    const querySection = searchParams.get('section');
    if (querySection && MENU_IDS.has(querySection)) return querySection;
    return MENU_IDS.has(defaultSection) ? defaultSection : 'browse';
  }, [sectionId, searchParams, defaultSection]);

  const setActiveSection = useCallback(
    (section) => {
      if (!MENU_IDS.has(section) || section === 'browse') {
        navigate('/jobs', { replace: true });
        return;
      }
      navigate(`/jobs/${section}`, { replace: true });
    },
    [navigate],
  );

  useEffect(() => {
    const legacy = searchParams.get('section');
    if (legacy && MENU_IDS.has(legacy) && !sectionId) {
      setActiveSection(legacy);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, sectionId, setActiveSection, setSearchParams]);

  return { activeSection, setActiveSection };
}
