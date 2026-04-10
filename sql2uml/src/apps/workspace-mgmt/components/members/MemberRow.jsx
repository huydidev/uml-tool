// src/apps/workspace-mgmt/components/members/MemberRow.jsx

import { useState } from "react";
import { tokens } from "../../../../shared/constants/Tokens";
import {
  ROLE_LABELS,
  ROLE_COLORS,
  WORKSPACE_ROLES,
  canManageMembers,
} from "../../constants/workspaceRoles";

const ROLE_OPTIONS = [
  WORKSPACE_ROLES.TEACHER,
  WORKSPACE_ROLES.STUDENT,
  WORKSPACE_ROLES.MEMBER,
];

export default function MemberRow({ member, myRole, onRemove, onChangeRole }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const roleStyle = ROLE_COLORS[member.role] || ROLE_COLORS.MEMBER;
  const canManage = canManageMembers(myRole);
  const isOwner = member.role === WORKSPACE_ROLES.OWNER;

  const handleChangeRole = async (newRole) => {
    setShowRoleMenu(false);
    if (newRole === member.role) return;
    setLoading(true);
    try {
      await onChangeRole?.(member.userId, newRole);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await onRemove?.(member.userId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: tokens.space.md,
        padding: `${tokens.space.sm}px 0`,
        borderBottom: `1px solid ${tokens.color.surface}`,
        opacity: loading ? 0.5 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          flexShrink: 0,
          backgroundColor: roleStyle.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: tokens.font.sm,
          fontWeight: tokens.weight.bold,
          color: roleStyle.color,
        }}
      >
        {(member.userName || member.userId || "?").slice(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: tokens.font.md,
            fontWeight: tokens.weight.semibold,
            color: tokens.color.textBase,
            marginBottom: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {member.userName || member.userId}
        </p>
        <p
          style={{
            fontSize: tokens.font.sm,
            color: tokens.color.textMuted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {member.userId}
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          fontSize: tokens.font.sm,
          color: tokens.color.textMuted,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        <p>{member.diagramCount || 0} diagram</p>
        {member.hasGrade && <p style={{ color: "#16a34a" }}>✓ Đã chấm</p>}
      </div>

      {/* Role badge / dropdown */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={() => !isOwner && canManage && setShowRoleMenu((v) => !v)}
          style={{
            padding: "4px 10px",
            borderRadius: tokens.radius.sm,
            border: "none",
            backgroundColor: roleStyle.bg,
            color: roleStyle.color,
            fontSize: tokens.font.xs,
            fontWeight: tokens.weight.bold,
            cursor: !isOwner && canManage ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {ROLE_LABELS[member.role] || member.role}
          {!isOwner && canManage && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </button>

        {/* Role dropdown */}
        {showRoleMenu && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 4px)",
              backgroundColor: tokens.color.white,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: tokens.radius.lg,
              boxShadow: tokens.shadow.md,
              overflow: "hidden",
              zIndex: 50,
              minWidth: 130,
            }}
          >
            {ROLE_OPTIONS.map((role) => {
              const s = ROLE_COLORS[role];
              return (
                <button
                  key={role}
                  onClick={() => handleChangeRole(role)}
                  style={{
                    width: "100%",
                    padding: "8px 14px",
                    border: "none",
                    backgroundColor:
                      member.role === role ? s.bg : "transparent",
                    fontSize: tokens.font.md,
                    fontWeight: tokens.weight.medium,
                    color:
                      member.role === role ? s.color : tokens.color.textBase,
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: tokens.space.xs,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = s.bg + "80")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      member.role === role ? s.bg : "transparent")
                  }
                >
                  {member.role === role && (
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {ROLE_LABELS[role]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Remove button */}
      {canManage && !isOwner && (
        <button
          onClick={handleRemove}
          disabled={loading}
          style={{
            width: 28,
            height: 28,
            borderRadius: tokens.radius.sm,
            border: "1px solid #fecdd3",
            backgroundColor: "#fff1f2",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: tokens.color.danger,
            flexShrink: 0,
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
