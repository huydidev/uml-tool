// src/apps/workspace-mgmt/api/gradeApi.js

import { authHeaders, handleResponse } from "./apiHelper";

const BASE = "/api/workspaces";

export const gradeApi = {
  upsertGrade: (workspaceId, payload) =>
    fetch(`${BASE}/${workspaceId}/grades`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  getWorkspaceGrades: (workspaceId) =>
    fetch(`${BASE}/${workspaceId}/grades`, {
      headers: authHeaders(),
    }).then(handleResponse),

  getDiagramGrade: (workspaceId, diagramId) =>
    fetch(`${BASE}/${workspaceId}/grades/diagram/${diagramId}`, {
      headers: authHeaders(),
    }).then(handleResponse),

  deleteGrade: (workspaceId, gradeId) =>
    fetch(`${BASE}/${workspaceId}/grades/${gradeId}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleResponse),
};
