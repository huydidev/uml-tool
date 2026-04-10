// src/apps/workspace-mgmt/api/workspaceApi.js

import { authHeaders, handleResponse } from "./apiHelper";

const BASE = "/api/workspaces";

export const workspaceApi = {
  create: (payload) =>
    fetch(BASE, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  getMyWorkspaces: () =>
    fetch(BASE, { headers: authHeaders() }).then(handleResponse),

  getById: (id) =>
    fetch(`${BASE}/${id}`, {
      headers: authHeaders(),
    }).then(handleResponse),

  update: (id, payload) =>
    fetch(`${BASE}/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  delete: (id) =>
    fetch(`${BASE}/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleResponse),

  getByInviteCode: (code) => fetch(`${BASE}/join/${code}`).then(handleResponse),

  regenerateInviteCode: (id) =>
    fetch(`${BASE}/${id}/regenerate-invite`, {
      method: "POST",
      headers: authHeaders(),
    }).then(handleResponse),

  getDiagrams: (id) =>
    fetch(`${BASE}/${id}/diagrams`, {
      headers: authHeaders(),
    }).then(handleResponse),

  updateDeadline: (id, deadline) =>
    fetch(`${BASE}/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({
        deadline: deadline, // null để xóa
        updateDeadline: true, // flag báo BE xử lý deadline
      }),
    }).then(handleResponse),
};
