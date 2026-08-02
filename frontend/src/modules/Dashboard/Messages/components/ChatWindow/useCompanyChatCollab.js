import { useEffect, useState } from 'react';
import { fetchCompanyHiringContext } from '../../services/companyHiringApi';

/** Loads assignment + candidate profile for company chat collab / AI. */
export default function useCompanyChatCollab(selectedMessage, enabled) {
  const [assignment, setAssignment] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!enabled || !selectedMessage) {
      setAssignment(null);
      setProfile(null);
      return undefined;
    }
    let alive = true;
    fetchCompanyHiringContext(selectedMessage)
      .then((data) => {
        if (!alive || !data) return;
        const raw = data.assignment || null;
        setAssignment(raw?.assigneeName ? raw : null);
        setProfile(data.profile || null);
      })
      .catch(() => {
        if (!alive) return;
        setAssignment(null);
        setProfile(null);
      });
    return () => {
      alive = false;
    };
  }, [enabled, selectedMessage]);

  return { assignment, setAssignment, profile };
}
