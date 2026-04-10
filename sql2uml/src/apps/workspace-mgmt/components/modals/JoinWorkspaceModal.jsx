// src/apps/workspace-mgmt/components/modals/JoinWorkspaceModal.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../../shared/constants/Tokens";
import { workspaceApi } from "../../api/workspaceApi";
import { memberApi } from "../../api/memberApi";
import { TYPE_LABELS, TYPE_COLORS } from "../../constants/workspaceRoles";

export default function JoinWorkspaceModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handlePreview = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setError(null);
    setPreview(null);
    setLoadingPreview(true);
    try {
      const data = await workspaceApi.getByInviteCode(trimmed);
      setPreview(data);
    } catch (e) {
      setError("Mã không hợp lệ hoặc đã hết hạn");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    setError(null);
    try {
      await memberApi.requestJoin(code.trim().toUpperCase());
      setSuccess(true);
      setTimeout(() => {
        handleClose();
        navigate("/workspaces");
      }, 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setJoining(false);
    }
  };

  const handleClose = () => {
    setCode("");
    setPreview(null);
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  const typeStyle = preview
    ? TYPE_COLORS[preview.type] || TYPE_COLORS.TEAM
    : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: tokens.color.white,
          borderRadius: tokens.radius.xl,
          width: 400,
          boxShadow: tokens.shadow.lg,
          border: `1px solid ${tokens.color.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px 14px",
            borderBottom: `1px solid ${tokens.color.border}`,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: tokens.font.lg,
                fontWeight: tokens.weight.bold,
                color: tokens.color.textBase,
                marginBottom: 2,
              }}
            >
              Tham gia Workspace
            </h3>
            <p
              style={{
                fontSize: tokens.font.sm,
                color: tokens.color.textSub,
              }}
            >
              Nhập mã invite để tham gia
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: tokens.radius.md,
              border: `1px solid ${tokens.color.border}`,
              backgroundColor: tokens.color.surface,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: tokens.color.textSub,
            }}
          >
            <svg
              width="13"
              height="13"
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
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: tokens.space.lg,
          }}
        >
          {/* Code input */}
          <div style={{ display: "flex", gap: tokens.space.sm }}>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setPreview(null);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handlePreview()}
              placeholder="VD: A1B2C3D4"
              maxLength={8}
              style={{
                flex: 1,
                padding: "10px 13px",
                borderRadius: tokens.radius.md,
                border: `1px solid ${tokens.color.border}`,
                backgroundColor: tokens.color.surface,
                fontSize: tokens.font.lg,
                fontWeight: tokens.weight.bold,
                color: tokens.color.textBase,
                outline: "none",
                letterSpacing: "0.1em",
                fontFamily: "monospace",
                textTransform: "uppercase",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = tokens.color.primary)
              }
              onBlur={(e) => (e.target.style.borderColor = tokens.color.border)}
            />
            <button
              onClick={handlePreview}
              disabled={!code.trim() || loadingPreview}
              style={{
                padding: "10px 16px",
                borderRadius: tokens.radius.md,
                border: "none",
                backgroundColor:
                  !code.trim() || loadingPreview
                    ? tokens.color.primary + "60"
                    : tokens.color.primary,
                color: tokens.color.white,
                fontSize: tokens.font.md,
                fontWeight: tokens.weight.semibold,
                cursor:
                  !code.trim() || loadingPreview ? "not-allowed" : "pointer",
              }}
            >
              {loadingPreview ? "..." : "Kiểm tra"}
            </button>
          </div>

          {/* Preview card */}
          {preview && (
            <div
              style={{
                padding: tokens.space.md,
                borderRadius: tokens.radius.lg,
                border: `1px solid ${tokens.color.border}`,
                backgroundColor: tokens.color.surface,
                display: "flex",
                flexDirection: "column",
                gap: tokens.space.sm,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <p
                  style={{
                    fontSize: tokens.font.lg,
                    fontWeight: tokens.weight.bold,
                    color: tokens.color.textBase,
                  }}
                >
                  {preview.name}
                </p>
                <span
                  style={{
                    fontSize: tokens.font.xs,
                    fontWeight: tokens.weight.bold,
                    padding: "3px 8px",
                    borderRadius: tokens.radius.sm,
                    backgroundColor: typeStyle?.bg,
                    color: typeStyle?.color,
                  }}
                >
                  {TYPE_LABELS[preview.type] || preview.type}
                </span>
              </div>
              {preview.description && (
                <p
                  style={{
                    fontSize: tokens.font.md,
                    color: tokens.color.textSub,
                  }}
                >
                  {preview.description}
                </p>
              )}
              <p
                style={{
                  fontSize: tokens.font.sm,
                  color: tokens.color.textMuted,
                }}
              >
                {preview.memberCount || 0} thành viên
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: tokens.radius.md,
                backgroundColor: "#fff1f2",
                border: "1px solid #fecdd3",
                fontSize: tokens.font.sm,
                color: tokens.color.danger,
              }}
            >
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: tokens.radius.md,
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                fontSize: tokens.font.sm,
                color: "#16a34a",
                fontWeight: tokens.weight.semibold,
              }}
            >
              ✓ Yêu cầu tham gia đã được gửi!
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: `1px solid ${tokens.color.border}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: tokens.space.sm,
          }}
        >
          <button
            onClick={handleClose}
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
          {preview && !success && (
            <button
              onClick={handleJoin}
              disabled={joining}
              style={{
                padding: "8px 22px",
                borderRadius: tokens.radius.md,
                border: "none",
                backgroundColor: joining
                  ? tokens.color.primary + "60"
                  : tokens.color.primary,
                fontSize: tokens.font.md,
                fontWeight: tokens.weight.semibold,
                color: tokens.color.white,
                cursor: joining ? "not-allowed" : "pointer",
              }}
            >
              {joining ? "Đang tham gia..." : "Tham gia"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
