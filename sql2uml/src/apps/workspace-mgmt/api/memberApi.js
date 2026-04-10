// src/apps/workspace-mgmt/api/memberApi.js

import { authHeaders, handleResponse } from "./apiHelper";

const BASE = "/api/workspaces";

export const memberApi = {
  invite: (workspaceId, emails, role = "STUDENT") =>
    fetch(`${BASE}/${workspaceId}/invite`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ emails, role }),
    }).then(handleResponse),

  requestJoin: (inviteCode) =>
    fetch(`${BASE}/join/${inviteCode}`, {
      method: "POST",
      headers: authHeaders(),
    }).then(handleResponse),

  getMembers: (workspaceId) =>
    fetch(`${BASE}/${workspaceId}/members`, {
      headers: authHeaders(),
    }).then(handleResponse),

  getPendingMembers: (workspaceId) =>
    fetch(`${BASE}/${workspaceId}/members/pending`, {
      headers: authHeaders(),
    }).then(handleResponse),

  approveMember: (workspaceId, userId, action) =>
    fetch(`${BASE}/${workspaceId}/members/approve`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ userId, action }),
    }).then(handleResponse),

  changeRole: (workspaceId, userId, role) =>
    fetch(`${BASE}/${workspaceId}/members/${userId}/role`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ role }),
    }).then(handleResponse),

  removeMember: (workspaceId, userId) =>
    fetch(`${BASE}/${workspaceId}/members/${userId}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleResponse),

  leaveWorkspace: (workspaceId) =>
    fetch(`${BASE}/${workspaceId}/leave`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleResponse),

  getMyPendingInvites: () =>
    fetch(`${BASE}/invites/pending`, {
      headers: authHeaders(),
    }).then(handleResponse),
};
