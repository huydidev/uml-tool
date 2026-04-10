// src/apps/workspace-mgmt/components/cards/WorkspaceCard.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../../shared/constants/Tokens";
import {
  ROLE_LABELS,
  ROLE_COLORS,
  TYPE_LABELS,
  TYPE_COLORS,
  WORKSPACE_TYPES,
} from "../../constants/workspaceRoles";

function TypeBadge({ type }) {
  const style = TYPE_COLORS[type] || TYPE_COLORS.TEAM;
  return (
    <span
      style={{
        fontSize: tokens.font.xs,
        fontWeight: tokens.weight.bold,
        padding: "3px 8px",
        borderRadius: tokens.radius.sm,
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {TYPE_LABELS[type] || type}
    </span>
  );
}

function RoleBadge({ role }) {
  const style = ROLE_COLORS[role] || ROLE_COLORS.MEMBER;
  return (
    <span
      style={{
        fontSize: tokens.font.xs,
        fontWeight: tokens.weight.bold,
        padding: "2px 7px",
        borderRadius: tokens.radius.sm,
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {ROLE_LABELS[role] || role}
    </span>
  );
}

export default function WorkspaceCard({ workspace, onDelete }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isClassroom = workspace.type === WORKSPACE_TYPES.CLASSROOM;
  const iconColor = isClassroom ? "#f59e0b" : "#3b82f6";

  const handleDelete = async (e) => {
    e.stopPropagation();
    setShowConfirm(false);
    setDeleting(true);
    try {
      await onDelete?.(workspace.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Confirm delete */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            style={{
              backgroundColor: tokens.color.white,
              borderRadius: tokens.radius.xl,
              padding: "24px 28px",
              width: 340,
              boxShadow: tokens.shadow.lg,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: tokens.font.lg,
                fontWeight: tokens.weight.bold,
                color: tokens.color.textBase,
                marginBottom: 8,
              }}
            >
              Xóa workspace?
            </h3>
            <p
              style={{
                fontSize: tokens.font.md,
                color: tokens.color.textSub,
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              <strong style={{ color: tokens.color.textBase }}>
                {workspace.name}
              </strong>{" "}
              sẽ bị xóa vĩnh viễn cùng toàn bộ dữ liệu.
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: "8px 18px",
                  borderRadius: tokens.radius.md,
                  border: `1px solid ${tokens.color.border}`,
                  backgroundColor: tokens.color.surface,
                  fontSize: tokens.font.md,
                  fontWeight: tokens.weight.semibold,
                  color: tokens.color.textBase,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: "8px 18px",
                  borderRadius: tokens.radius.md,
                  border: "none",
                  backgroundColor: tokens.color.danger,
                  fontSize: tokens.font.md,
                  fontWeight: tokens.weight.semibold,
                  color: tokens.color.white,
                  cursor: "pointer",
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        onClick={() => !deleting && navigate(`/workspaces/${workspace.id}`)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          backgroundColor: tokens.color.white,
          border: `1px solid ${
            hovered ? tokens.color.primary + "60" : tokens.color.border
          }`,
          borderRadius: tokens.radius.xl,
          padding: tokens.space.lg,
          cursor: "pointer",
          transition: "all 0.18s",
          display: "flex",
          flexDirection: "column",
          gap: tokens.space.md,
          minHeight: 160,
          position: "relative",
          boxShadow: hovered ? tokens.shadow.md : tokens.shadow.sm,
          transform: hovered ? "translateY(-1px)" : "none",
          opacity: deleting ? 0.4 : 1,
        }}
      >
        {/* Delete button — hiện khi hover + là owner */}
        {hovered && workspace.myRole === "OWNER" && !deleting && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(true);
            }}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 26,
              height: 26,
              borderRadius: tokens.radius.sm,
              border: "1px solid #fecdd3",
              backgroundColor: "#fff1f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: tokens.color.danger,
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        )}

        {/* Icon + type badge */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: tokens.radius.md,
              backgroundColor: iconColor + "18",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isClassroom ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={iconColor}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={iconColor}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            )}
          </div>
          <TypeBadge type={workspace.type} />
        </div>

        {/* Name + description */}
        <div>
          <p
            style={{
              fontSize: tokens.font.lg,
              fontWeight: tokens.weight.semibold,
              color: tokens.color.textBase,
              marginBottom: 4,
            }}
          >
            {workspace.name}
          </p>
          <p
            style={{
              fontSize: tokens.font.md,
              color: tokens.color.textSub,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {workspace.description || "Không có mô tả"}
          </p>
        </div>

        {/* Footer: role + stats */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <RoleBadge role={workspace.myRole} />
          <div
            style={{
              display: "flex",
              gap: tokens.space.md,
              fontSize: tokens.font.sm,
              color: tokens.color.textMuted,
            }}
          >
            <span>{workspace.memberCount || 0} thành viên</span>
            <span>{workspace.diagramCount || 0} diagram</span>
          </div>
        </div>
      </div>
    </>
  );
}
