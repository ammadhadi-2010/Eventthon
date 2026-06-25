import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifyAlertsRefresh } from '../../Alerts/utils/alertsNotify';
import {
  joinHubProject,
  submitProjectProposal,
} from '../services/projectsApi';
import { getProjectsActorId, hasProjectsSession } from '../services/projectsSession';
import { routeProjectChatFromResponse } from '../utils/projectsMessagesBridge';
import { buildPackageSelectionPayload, getContributorPackageKey } from '../utils/projectPackageUtils';
import { hasUserJoined, resolveProjectContributors } from '../utils/projectContributors';
import { joinSquadProject, selectSquadProjectPackage } from '../../SquadNetwork/api/squadProjectsApi';

function buildUserPayload(userData) {
  const userId =
    getProjectsActorId() ||
    userData?._id ||
    userData?.id ||
    (typeof window !== 'undefined' ? localStorage.getItem('userId') : '') ||
    '';
  const name =
    `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim() ||
    userData?.name ||
    'Member';
  const avatar = userData?.imageurl || userData?.profile_image_url || userData?.avatar || '';
  return { user_id: userId, name, avatar, role: 'collaborator' };
}

export default function useProjectCollaborate({ project, squadId, userData, onProjectUpdated }) {
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [selectingPackage, setSelectingPackage] = useState(false);
  const [packageError, setPackageError] = useState('');

  const userId = getProjectsActorId() || userData?._id || userData?.id || '';
  const contributors = useMemo(() => resolveProjectContributors(project), [project]);
  const hasJoined = useMemo(() => hasUserJoined(contributors, userId), [contributors, userId]);
  const confirmedPackageKey = useMemo(
    () => getContributorPackageKey(contributors, userId),
    [contributors, userId],
  );

  const joinProject = useCallback(async () => {
    if (!project?.id || hasJoined || joining) return null;
    if (!hasProjectsSession()) {
      setJoinError('Log in to join this project.');
      return null;
    }
    const payload = buildUserPayload(userData);
    if (!payload.user_id) {
      setJoinError('Sign in to join this project.');
      return null;
    }
    setJoining(true);
    setJoinError('');
    try {
      let data;
      if (squadId) {
        const updated = await joinSquadProject(squadId, project.id, payload);
        data = { project: updated };
      } else {
        data = await joinHubProject(project.id, payload);
      }
      onProjectUpdated?.(data.project);
      notifyAlertsRefresh();
      routeProjectChatFromResponse(data, navigate);
      return data.project;
    } catch (err) {
      setJoinError(err?.message || 'Could not join project.');
      return null;
    } finally {
      setJoining(false);
    }
  }, [project?.id, hasJoined, joining, userData, squadId, onProjectUpdated, navigate]);

  const selectPackage = useCallback(
    async (packageKey, tier) => {
      if (!project?.id || selectingPackage) return null;
      if (!hasProjectsSession()) {
        setPackageError('Log in to submit a proposal.');
        return null;
      }
      const userPayload = buildUserPayload(userData);
      if (!userPayload.user_id) {
        setPackageError('Sign in to submit a proposal.');
        return null;
      }
      const body = buildPackageSelectionPayload(packageKey, tier, userPayload);
      setSelectingPackage(true);
      setPackageError('');
      try {
        let data;
        if (squadId) {
          const updated = await selectSquadProjectPackage(squadId, project.id, body);
          data = { project: updated };
        } else {
          data = await submitProjectProposal(project.id, {
            bidder_user_id: body.user_id,
            bidder_name: body.name,
            package_key: body.package_key,
            package_label: body.package_label,
            price: body.price,
            delivery_days: body.delivery_days,
            revisions: body.revisions,
            message: `Proposal for "${project.title}" — ${body.package_label} package.`,
          });
        }
        onProjectUpdated?.(data.project);
        notifyAlertsRefresh();
        routeProjectChatFromResponse(data, navigate);
        return data.project;
      } catch (err) {
        setPackageError(err?.message || 'Could not submit proposal.');
        return null;
      } finally {
        setSelectingPackage(false);
      }
    },
    [project?.id, project?.title, selectingPackage, userData, squadId, onProjectUpdated, navigate],
  );

  return {
    joinProject,
    joining,
    joinError,
    hasJoined,
    contributors,
    selectPackage,
    selectingPackage,
    packageError,
    confirmedPackageKey,
  };
}
