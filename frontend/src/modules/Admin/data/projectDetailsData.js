import { mapProjectDetailFromApi } from '../pages/ProjectManagement/projectData';

export function getProjectDetailById() {
  return null;
}

export function buildProjectDetailFromApi(item) {
  return item ? mapProjectDetailFromApi(item) : null;
}
