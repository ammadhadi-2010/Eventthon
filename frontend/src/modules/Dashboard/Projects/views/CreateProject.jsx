import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateProjectWizardProvider } from '../createProject/context/CreateProjectWizardContext';
import CreateProjectWizardView from '../createProject/CreateProjectWizardView';
import { useProjectsHub } from '../context/ProjectsHubContext';
import {
  createSquadProject,
  updateSquadProject,
  wizardDataToSquadProjectPayload,
} from '../../SquadNetwork/api/squadProjectsApi';
import { clearWizardStorage } from '../createProject/context/wizardStorage';

function CreateProjectWizardConnected({ onCancel, searchQuery = '' }) {
  const navigate = useNavigate();
  const {
    publishProject,
    loadHub,
    setActiveMenu,
    squadId,
    squadProjectId,
    isSquadProjectEdit,
    editWizardStatus,
  } = useProjectsHub();

  const handlePublish = async (wizardData) => {
    if (isSquadProjectEdit && squadId && squadProjectId) {
      const payload = wizardDataToSquadProjectPayload(wizardData, { forUpdate: true });
      if (payload.title) await updateSquadProject(squadId, squadProjectId, payload);
      clearWizardStorage();
      navigate('/squads', {
        replace: true,
        state: { squadProjectsRefresh: true, openTab: 'Projects' },
      });
      return;
    }

    await publishProject(wizardData);
    if (squadId) {
      const payload = wizardDataToSquadProjectPayload(wizardData);
      if (payload.title) await createSquadProject(squadId, payload);
    }
    await loadHub();
    if (squadId) {
      navigate('/squads', {
        replace: true,
        state: { squadProjectsRefresh: true, squadId, openTab: 'Projects' },
      });
      return;
    }
    setActiveMenu('overview');
    onCancel();
  };

  return (
    <CreateProjectWizardView
      onCancel={onCancel}
      onPublish={handlePublish}
      searchQuery={searchQuery}
    />
  );
}

export default function CreateProject({ onCancel, searchQuery = '' }) {
  const { editWizardData, squadProjectId, isSquadProjectEdit, editWizardStatus } =
    useProjectsHub();

  if (isSquadProjectEdit && editWizardStatus !== 'ready') {
    if (editWizardStatus === 'error') {
      return (
        <p className="ph-create-loading ph-create-loading--error">
          Could not load this project. Return to Squads and try again.
        </p>
      );
    }
    return <p className="ph-create-loading">Loading squad project…</p>;
  }

  const providerKey = isSquadProjectEdit ? `edit-${squadProjectId}` : 'create';
  return (
    <CreateProjectWizardProvider
      key={providerKey}
      initialData={editWizardData}
      editMode={isSquadProjectEdit}
    >
      <CreateProjectWizardConnected onCancel={onCancel} searchQuery={searchQuery} />
    </CreateProjectWizardProvider>
  );
}
