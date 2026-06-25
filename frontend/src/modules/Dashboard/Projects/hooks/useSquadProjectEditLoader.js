import { useEffect, useState } from 'react';
import { fetchSquadProjects, squadProjectToWizardData } from '../../SquadNetwork/api/squadProjectsApi';

export default function useSquadProjectEditLoader({ squadId, squadProjectId, isSquadProjectEdit }) {
  const [editWizardData, setEditWizardData] = useState(null);
  const [editWizardStatus, setEditWizardStatus] = useState(() =>
    isSquadProjectEdit && squadProjectId ? 'loading' : 'idle',
  );

  useEffect(() => {
    if (!squadId || !squadProjectId || !isSquadProjectEdit) {
      setEditWizardData(null);
      setEditWizardStatus('idle');
      return undefined;
    }
    let active = true;
    setEditWizardStatus('loading');
    setEditWizardData(null);
    fetchSquadProjects(squadId)
      .then((list) => {
        if (!active) return;
        const project = list.find((item) => item.id === squadProjectId);
        if (!project) {
          setEditWizardData(null);
          setEditWizardStatus('error');
          return;
        }
        setEditWizardData(squadProjectToWizardData(project));
        setEditWizardStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setEditWizardData(null);
        setEditWizardStatus('error');
      });
    return () => {
      active = false;
    };
  }, [squadId, squadProjectId, isSquadProjectEdit]);

  return { editWizardData, editWizardStatus };
}
