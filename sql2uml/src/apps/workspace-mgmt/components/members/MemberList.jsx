// src/apps/workspace-mgmt/components/members/MemberList.jsx

import { tokens } from "../../../../shared/constants/Tokens";
import MemberRow from "./MemberRow";
import { WORKSPACE_ROLES } from "../../constants/workspaceRoles";

function PendingRow({ member, onApprove, onReject }) {
  const [loading, setLoading] = useState(false);

  const handle = async (action) => {
    setLoading(true);
    try {
      if (action === "approve") await onApprove?.(member.userId);
      else await onReject?.(member.userId);
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
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: "#f1f5f9",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: tokens.font.sm,
          fontWeight: tokens.weight.bold,
          color: tokens.color.textMuted,
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
          }}
        >
          {member.userName || member.userId}
        </p>
        <span
          style={{
            fontSize: tokens.font.xs,
            fontWeight: tokens.weight.bold,
            padding: "2px 7px",
            borderRadius: tokens.radius.sm,
            backgroundColor: "#fef9c3",
            color: "#854d0e",
          }}
        >
          Chờ duyệt
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: tokens.space.xs }}>
        <button
          onClick={() => handle("reject")}
          disabled={loading}
          style={{
            padding: "6px 12px",
            borderRadius: tokens.radius.md,
            border: `1px solid ${tokens.color.border}`,
            backgroundColor: tokens.color.surface,
            fontSize: tokens.font.sm,
            fontWeight: tokens.weight.semibold,
            color: tokens.color.textSub,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          Từ chối
        </button>
        <button
          onClick={() => handle("approve")}
          disabled={loading}
          style={{
            padding: "6px 12px",
            borderRadius: tokens.radius.md,
            border: "none",
            backgroundColor: tokens.color.primary,
            fontSize: tokens.font.sm,
            fontWeight: tokens.weight.semibold,
            color: tokens.color.white,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          Duyệt
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";

export default function MemberList({
  members,
  pending,
  myRole,
  loading,
  onRemove,
  onChangeRole,
  onApprove,
  onReject,
}) {
  const canManage = [WORKSPACE_ROLES.OWNER, WORKSPACE_ROLES.TEACHER].includes(
    myRole,
  );

  if (loading) {
    return (
      <div
        style={{
          padding: "32px 0",
          textAlign: "center",
          color: tokens.color.textMuted,
          fontSize: tokens.font.md,
        }}
      >
        Đang tải...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: tokens.space.xl,
      }}
    >
      {/* Pending section */}
      {canManage && pending?.length > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space.sm,
              marginBottom: tokens.space.md,
            }}
          >
            <h3
              style={{
                fontSize: tokens.font.md,
                fontWeight: tokens.weight.semibold,
                color: tokens.color.textBase,
              }}
            >
              Chờ duyệt
            </h3>
            <span
              style={{
                fontSize: tokens.font.xs,
                fontWeight: tokens.weight.bold,
                padding: "2px 7px",
                borderRadius: tokens.radius.sm,
                backgroundColor: "#fef9c3",
                color: "#854d0e",
              }}
            >
              {pending.length}
            </span>
          </div>

          <div
            style={{
              backgroundColor: tokens.color.white,
              borderRadius: tokens.radius.lg,
              border: `1px solid ${tokens.color.border}`,
              padding: `0 ${tokens.space.lg}px`,
            }}
          >
            {pending.map((member) => (
              <PendingRow
                key={member.userId}
                member={member}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active members */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space.sm,
            marginBottom: tokens.space.md,
          }}
        >
          <h3
            style={{
              fontSize: tokens.font.md,
              fontWeight: tokens.weight.semibold,
              color: tokens.color.textBase,
            }}
          >
            Thành viên
          </h3>
          <span
            style={{
              fontSize: tokens.font.xs,
              fontWeight: tokens.weight.bold,
              padding: "2px 7px",
              borderRadius: tokens.radius.sm,
              backgroundColor: tokens.color.surface,
              color: tokens.color.textMuted,
            }}
          >
            {members.length}
          </span>
        </div>

        {members.length === 0 ? (
          <div
            style={{
              padding: "32px 0",
              textAlign: "center",
              color: tokens.color.textMuted,
              fontSize: tokens.font.md,
            }}
          >
            Chưa có thành viên nào
          </div>
        ) : (
          <div
            style={{
              backgroundColor: tokens.color.white,
              borderRadius: tokens.radius.lg,
              border: `1px solid ${tokens.color.border}`,
              padding: `0 ${tokens.space.lg}px`,
            }}
          >
            {members.map((member) => (
              <MemberRow
                key={member.userId}
                member={member}
                myRole={myRole}
                onRemove={onRemove}
                onChangeRole={onChangeRole}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
