import API from '../../../../api/axiosConfig';
import { assertProfileIdentifier, getProfileSessionHeaders } from '../utils/profileSession';

function profileHeaders(identifier) {
  return {
    ...getProfileSessionHeaders(),
    'Content-Type': 'application/json',
  };
}

function multipartHeaders(identifier) {
  return getProfileSessionHeaders();
}

export async function blobUrlToFile(blobUrl, filename) {
  const res = await fetch(blobUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}

export async function fetchProfileMe(identifier) {
  const id = assertProfileIdentifier(identifier);
  const response = await API.get(`/api/profile/me/${encodeURIComponent(id)}`, {
    headers: profileHeaders(id),
    timeout: 15000,
  });
  return response.data;
}

export async function updateProfileData(identifier, payload) {
  const id = assertProfileIdentifier(identifier);
  const response = await API.post(
    `/api/profile/update-profile-data/${encodeURIComponent(id)}`,
    payload,
    { headers: profileHeaders(id), timeout: 30000 },
  );
  return response.data;
}

export async function updateProfileProjects(identifier, projects) {
  const id = assertProfileIdentifier(identifier);
  const response = await API.post(
    `/api/profile/update-projects/${encodeURIComponent(id)}`,
    { projects },
    { headers: profileHeaders(id), timeout: 30000 },
  );
  return response.data;
}

export async function updateIdentityStatus(identifier, payload) {
  const id = assertProfileIdentifier(identifier);
  const response = await API.post(
    `/api/profile/update-status/${encodeURIComponent(id)}`,
    payload,
    { headers: profileHeaders(id), timeout: 60000 },
  );
  return response.data;
}

export async function uploadProjectImage(file, identifier) {
  const id = assertProfileIdentifier(identifier);
  const formData = new FormData();
  formData.append('file', file);
  const response = await API.post(
    `/api/profile/upload-project-image/${encodeURIComponent(id)}`,
    formData,
    { headers: multipartHeaders(id), timeout: 60000 },
  );
  return response.data;
}

export async function saveProfilePreferences(identifier, payload) {
  const id = assertProfileIdentifier(identifier);
  const response = await API.post(
    `/api/profile/preferences/${encodeURIComponent(id)}`,
    {
      public_visibility: Boolean(payload.public_visibility),
      message_notifications: Boolean(payload.message_notifications),
      order_alerts: Boolean(payload.order_alerts),
    },
    { headers: profileHeaders(id), timeout: 15000 },
  );
  return response.data;
}

export async function uploadUserImage(file, type, identifier) {
  const id = assertProfileIdentifier(identifier);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  const response = await API.post(
    `/api/profile/upload-profile-image/${encodeURIComponent(id)}`,
    formData,
    { headers: multipartHeaders(id), timeout: 60000 },
  );
  return response.data;
}
