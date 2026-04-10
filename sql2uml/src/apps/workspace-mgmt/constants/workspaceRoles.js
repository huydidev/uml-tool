// src/apps/workspace-mgmt/constants/workspaceRoles.js

export const WORKSPACE_ROLES = {
  OWNER: "OWNER",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  MEMBER: "MEMBER",
};

export const WORKSPACE_STATUS = {
  ACTIVE: "ACTIVE",
  PENDING: "PENDING",
};

export const WORKSPACE_TYPES = {
  TEAM: "TEAM",
  CLASSROOM: "CLASSROOM",
};

export const GRADE_VISIBLE = {
  SELF_ONLY: "SELF_ONLY",
  ALL: "ALL",
};

export const INVITE_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
};

// Label hiển thị
export const ROLE_LABELS = {
  OWNER: "Owner",
  TEACHER: "Giảng viên",
  STUDENT: "Sinh viên",
  MEMBER: "Thành viên",
};

export const ROLE_COLORS = {
  OWNER: { bg: "#dbeafe", color: "#1d4ed8" },
  TEACHER: { bg: "#dcfce7", color: "#15803d" },
  STUDENT: { bg: "#f3e8ff", color: "#7c3aed" },
  MEMBER: { bg: "#f1f5f9", color: "#475569" },
};

export const TYPE_LABELS = {
  TEAM: "Team",
  CLASSROOM: "Lớp học",
};

export const TYPE_COLORS = {
  TEAM: { bg: "#dbeafe", color: "#1d4ed8" },
  CLASSROOM: { bg: "#fef9c3", color: "#854d0e" },
};

// Check quyền
export const canManageMembers = (role) =>
  [WORKSPACE_ROLES.OWNER, WORKSPACE_ROLES.TEACHER].includes(role);

export const canGrade = (role) =>
  [WORKSPACE_ROLES.OWNER, WORKSPACE_ROLES.TEACHER].includes(role);

export const canDeleteWorkspace = (role) => role === WORKSPACE_ROLES.OWNER;

export const canChangeSettings = (role) => role === WORKSPACE_ROLES.OWNER;
