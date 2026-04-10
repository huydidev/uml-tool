// src/apps/workspace-mgmt/pages/WorkspaceSettingsPage.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tokens } from "../../../shared/constants/Tokens";
import HomeHeader from "../../home/components/HomeHeader";
import ClassroomSettings from "../components/settings/ClassroomSettings";
import TeamSettings from "../components/settings/TeamSettings";
import { workspaceApi } from "../api/workspaceApi";
import { memberApi } from "../api/memberApi";
import {
  WORKSPACE_TYPES,
  canDeleteWorkspace,
  canChangeSettings,
} from "../constants/workspaceRoles";

function DangerZone({ workspaceName, onDelete }) {
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBox, setShowBox] = useState(false);

  const handleDelete = async () => {
    if (confirm !== workspaceName) return;
    setLoading(true);
    try {
      await onDelete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: tokens.color.white,
        borderRadius: tokens.radius.xl,
        border: `1px solid #fecdd3`,
        padding: tokens.space.xl,
        display: "flex",
        flexDirection: "column",
        gap: tokens.space.lg,
      }}
    >
      <div>
        <h3
          style={{
            fontSize: tokens.font.lg,
            fontWeight: tokens.weight.bold,
            color: tokens.color.danger,
            marginBottom: 4,
          }}
        >
          Vùng nguy hiểm
        </h3>
        <p
          style={{
            fontSize: tokens.font.sm,
            color: tokens.color.textSub,
          }}
        >
          Các thao tác này không thể hoàn tác
        </p>
      </div>

      {!showBox ? (
        <button
          onClick={() => setShowBox(true)}
          style={{
            padding: "9px 20px",
            borderRadius: tokens.radius.md,
            border: `1px solid ${tokens.color.danger}`,
            backgroundColor: "transparent",
            fontSize: tokens.font.md,
            fontWeight: tokens.weight.semibold,
            color: tokens.color.danger,
            cursor: "pointer",
            alignSelf: "flex-start",
          }}
        >
          Xóa workspace này
        </button>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space.md,
          }}
        >
          <p
            style={{
              fontSize: tokens.font.md,
              color: tokens.color.textBase,
              lineHeight: 1.6,
            }}
          >
            Nhập tên workspace{" "}
            <strong style={{ color: tokens.color.danger }}>
              {workspaceName}
            </strong>{" "}
            để xác nhận xóa:
          </p>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={workspaceName}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "9px 13px",
              borderRadius: tokens.radius.md,
              border: `1px solid ${tokens.color.danger}`,
              backgroundColor: "#fff1f2",
              fontSize: tokens.font.md,
              color: tokens.color.textBase,
              outline: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              gap: tokens.space.sm,
            }}
          >
            <button
              onClick={() => {
                setShowBox(false);
                setConfirm("");
              }}
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
              disabled={confirm !== workspaceName || loading}
              style={{
                padding: "8px 18px",
                borderRadius: tokens.radius.md,
                border: "none",
                backgroundColor:
                  confirm !== workspaceName || loading
                    ? "#fca5a5"
                    : tokens.color.danger,
                fontSize: tokens.font.md,
                fontWeight: tokens.weight.semibold,
                color: tokens.color.white,
                cursor:
                  confirm !== workspaceName || loading
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {loading ? "Đang xóa..." : "Xóa vĩnh viễn"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InviteCodeSection({ workspace, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const inviteLink = `${window.location.origin}/workspaces/join/${workspace.inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      await onRegenerate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: tokens.color.white,
        borderRadius: tokens.radius.xl,
        border: `1px solid ${tokens.color.border}`,
        padding: tokens.space.xl,
        display: "flex",
        flexDirection: "column",
        gap: tokens.space.lg,
      }}
    >
      <div>
        <h3
          style={{
            fontSize: tokens.font.lg,
            fontWeight: tokens.weight.bold,
            color: tokens.color.textBase,
            marginBottom: 4,
          }}
        >
          Invite Link
        </h3>
        <p
          style={{
            fontSize: tokens.font.sm,
            color: tokens.color.textSub,
          }}
        >
          Chia sẻ link này để mời thành viên tham gia
        </p>
      </div>

      {/* Link display */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: tokens.space.sm,
          padding: "10px 14px",
          borderRadius: tokens.radius.md,
          backgroundColor: tokens.color.surface,
          border: `1px solid ${tokens.color.border}`,
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke={tokens.color.primary}
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span
          style={{
            flex: 1,
            fontSize: tokens.font.sm,
            color: tokens.color.textBase,
            fontFamily: "monospace",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {inviteLink}
        </span>
        <button
          onClick={handleCopy}
          style={{
            fontSize: tokens.font.sm,
            fontWeight: tokens.weight.semibold,
            color: copied ? "#16a34a" : tokens.color.primary,
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      {/* Invite code badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space.sm,
          }}
        >
          <span
            style={{
              fontSize: tokens.font.sm,
              color: tokens.color.textSub,
            }}
          >
            Mã:
          </span>
          <span
            style={{
              fontSize: tokens.font.lg,
              fontWeight: tokens.weight.extrabold,
              color: tokens.color.textBase,
              letterSpacing: "0.1em",
              fontFamily: "monospace",
            }}
          >
            {workspace.inviteCode}
          </span>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={loading}
          style={{
            padding: "6px 14px",
            borderRadius: tokens.radius.md,
            border: `1px solid ${tokens.color.border}`,
            backgroundColor: tokens.color.surface,
            fontSize: tokens.font.sm,
            fontWeight: tokens.weight.semibold,
            color: tokens.color.textSub,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "..." : "↻ Tạo mã mới"}
        </button>
      </div>
    </div>
  );
}

export default function WorkspaceSettingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const data = await workspaceApi.getById(id);
        setWorkspace(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleUpdate = async (payload) => {
    const updated = await workspaceApi.update(id, payload);
    setWorkspace(updated);
  };

  const handleRegenerate = async () => {
    const updated = await workspaceApi.regenerateInviteCode(id);
    setWorkspace(updated);
  };

  const handleDelete = async () => {
    await workspaceApi.delete(id);
    navigate("/workspaces");
  };

  const handleLeave = async () => {
    await memberApi.leaveWorkspace(id);
    navigate("/workspaces");
  };

  if (loading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tokens.color.bg,
          fontSize: tokens.font.md,
          color: tokens.color.textMuted,
        }}
      >
        Đang tải...
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: tokens.space.lg,
        }}
      >
        <p
          style={{
            color: tokens.color.danger,
            fontSize: tokens.font.lg,
          }}
        >
          {error || "Không tìm thấy workspace"}
        </p>
        <button
          onClick={() => navigate("/workspaces")}
          style={{
            padding: "8px 20px",
            borderRadius: tokens.radius.md,
            border: "none",
            backgroundColor: tokens.color.primary,
            color: tokens.color.white,
            fontSize: tokens.font.md,
            fontWeight: tokens.weight.semibold,
            cursor: "pointer",
          }}
        >
          Quay lại
        </button>
      </div>
    );
  }

  const isOwner = canDeleteWorkspace(workspace.myRole);
  const canSettings =
    workspace.myRole === "OWNER" ||
    (workspace.myRole === "TEACHER" && isClassroom);
  const isClassroom = workspace.type === WORKSPACE_TYPES.CLASSROOM;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: tokens.color.bg,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      <HomeHeader activePage="Workspaces" onNavChange={() => {}} />

      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: tokens.space.xxl,
          display: "flex",
          flexDirection: "column",
          gap: tokens.space.lg,
        }}
      >
        {/* Back + title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space.md,
          }}
        >
          <button
            onClick={() => navigate(`/workspaces/${id}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space.xs,
              border: "none",
              background: "none",
              color: tokens.color.textSub,
              cursor: "pointer",
              fontSize: tokens.font.md,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Quay lại
          </button>
          <span style={{ color: tokens.color.border }}>|</span>
          <h1
            style={{
              fontSize: tokens.font.xl,
              fontWeight: tokens.weight.bold,
              color: tokens.color.textBase,
            }}
          >
            Cài đặt — {workspace.name}
          </h1>
        </div>

        {/* Invite code — owner only */}
        {isOwner && (
          <InviteCodeSection
            workspace={workspace}
            onRegenerate={handleRegenerate}
          />
        )}

        {/* Type-specific settings — owner only */}
        {canSettings &&
          (isClassroom ? (
            <ClassroomSettings settings={workspace} onUpdate={handleUpdate} workspaceId={id} />
          ) : (
            <TeamSettings settings={workspace} onUpdate={handleUpdate} />
          ))}

        {/* Leave workspace — non-owner */}
        {!isOwner && (
          <div
            style={{
              backgroundColor: tokens.color.white,
              borderRadius: tokens.radius.xl,
              border: `1px solid ${tokens.color.border}`,
              padding: tokens.space.xl,
            }}
          >
            <h3
              style={{
                fontSize: tokens.font.lg,
                fontWeight: tokens.weight.bold,
                color: tokens.color.textBase,
                marginBottom: 4,
              }}
            >
              Rời workspace
            </h3>
            <p
              style={{
                fontSize: tokens.font.sm,
                color: tokens.color.textSub,
                marginBottom: tokens.space.lg,
              }}
            >
              Bạn sẽ mất quyền truy cập vào workspace này
            </p>
            <button
              onClick={handleLeave}
              style={{
                padding: "8px 20px",
                borderRadius: tokens.radius.md,
                border: `1px solid ${tokens.color.danger}`,
                backgroundColor: "transparent",
                fontSize: tokens.font.md,
                fontWeight: tokens.weight.semibold,
                color: tokens.color.danger,
                cursor: "pointer",
              }}
            >
              Rời workspace
            </button>
          </div>
        )}

        {/* Danger zone — owner only */}
        {isOwner && (
          <DangerZone workspaceName={workspace.name} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
