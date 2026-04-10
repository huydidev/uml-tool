// src/apps/workspace-mgmt/components/modals/InviteMemberModal.jsx

import { useState } from "react";
import { tokens } from "../../../../shared/constants/Tokens";
import {
  WORKSPACE_TYPES,
  WORKSPACE_ROLES,
} from "../../constants/workspaceRoles";

export default function InviteMemberModal({
  isOpen,
  onClose,
  workspaceType,
  onInvite,
}) {
  const [input, setInput] = useState("");
  const [role, setRole] = useState(
    workspaceType === WORKSPACE_TYPES.CLASSROOM
      ? WORKSPACE_ROLES.STUDENT
      : WORKSPACE_ROLES.MEMBER,
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Parse emails từ input — hỗ trợ comma, newline, space
  const parseEmails = (raw) => {
    return raw
      .split(/[\n,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes("@"));
  };

  const emailList = parseEmails(input);

  const handleInvite = async () => {
    if (emailList.length === 0) {
      setError("Vui lòng nhập ít nhất 1 email hợp lệ");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await onInvite(emailList, role);
      setResult(data);
      setInput("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInput("");
    setResult(null);
    setError(null);
    onClose();
  };

  const ROLE_OPTIONS =
    workspaceType === WORKSPACE_TYPES.CLASSROOM
      ? [
          { value: WORKSPACE_ROLES.STUDENT, label: "👨‍🎓 Sinh viên" },
          { value: WORKSPACE_ROLES.TEACHER, label: "👨‍🏫 Giảng viên" },
        ]
      : [
          { value: WORKSPACE_ROLES.MEMBER, label: "👤 Thành viên" },
          { value: WORKSPACE_ROLES.TEACHER, label: "⚡ Admin" },
        ];

  if (!isOpen) return null;

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
          width: 440,
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
              Mời thành viên
            </h3>
            <p
              style={{
                fontSize: tokens.font.sm,
                color: tokens.color.textSub,
              }}
            >
              Nhập email — nhiều email phân cách bởi dấu phẩy
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
          {/* Email input */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: tokens.font.sm,
                fontWeight: tokens.weight.semibold,
                color: tokens.color.textSub,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: tokens.space.xs,
              }}
            >
              Email
            </label>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
                setResult(null);
              }}
              placeholder={"email1@example.com\nemail2@example.com\n..."}
              rows={4}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 13px",
                borderRadius: tokens.radius.md,
                border: `1px solid ${
                  error ? tokens.color.danger : tokens.color.border
                }`,
                backgroundColor: tokens.color.surface,
                fontSize: tokens.font.md,
                color: tokens.color.textBase,
                outline: "none",
                resize: "none",
                fontFamily: "monospace",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = tokens.color.primary)
              }
              onBlur={(e) =>
                (e.target.style.borderColor = error
                  ? tokens.color.danger
                  : tokens.color.border)
              }
            />
            {emailList.length > 0 && (
              <p
                style={{
                  fontSize: tokens.font.sm,
                  color: tokens.color.textMuted,
                  marginTop: 4,
                }}
              >
                {emailList.length} email được nhận diện
              </p>
            )}
          </div>

          {/* Role selector */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: tokens.font.sm,
                fontWeight: tokens.weight.semibold,
                color: tokens.color.textSub,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: tokens.space.xs,
              }}
            >
              Quyền
            </label>
            <div
              style={{
                display: "flex",
                border: `1px solid ${tokens.color.border}`,
                borderRadius: tokens.radius.md,
                overflow: "hidden",
              }}
            >
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRole(opt.value)}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    border: "none",
                    fontSize: tokens.font.md,
                    fontWeight: tokens.weight.semibold,
                    backgroundColor:
                      role === opt.value
                        ? tokens.color.primary
                        : tokens.color.surface,
                    color:
                      role === opt.value
                        ? tokens.color.white
                        : tokens.color.textSub,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

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

          {/* Result */}
          {result && (
            <div
              style={{
                padding: "12px",
                borderRadius: tokens.radius.md,
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                display: "flex",
                flexDirection: "column",
                gap: tokens.space.xs,
              }}
            >
              <p
                style={{
                  fontSize: tokens.font.md,
                  fontWeight: tokens.weight.semibold,
                  color: "#16a34a",
                }}
              >
                ✓ Đã gửi lời mời
              </p>
              {result.totalSuccess > 0 && (
                <p
                  style={{
                    fontSize: tokens.font.sm,
                    color: "#16a34a",
                  }}
                >
                  {result.totalSuccess} email thành công
                </p>
              )}
              {result.failed?.length > 0 && (
                <p
                  style={{
                    fontSize: tokens.font.sm,
                    color: tokens.color.warning,
                  }}
                >
                  {result.failed.length} đã là thành viên hoặc đã mời rồi
                </p>
              )}
              {result.notFound?.length > 0 && (
                <p
                  style={{
                    fontSize: tokens.font.sm,
                    color: tokens.color.danger,
                  }}
                >
                  {result.notFound.length} email không tồn tại trong hệ thống
                </p>
              )}
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
            Đóng
          </button>
          <button
            onClick={handleInvite}
            disabled={loading || emailList.length === 0}
            style={{
              padding: "8px 22px",
              borderRadius: tokens.radius.md,
              border: "none",
              backgroundColor:
                loading || emailList.length === 0
                  ? tokens.color.primary + "60"
                  : tokens.color.primary,
              fontSize: tokens.font.md,
              fontWeight: tokens.weight.semibold,
              color: tokens.color.white,
              cursor:
                loading || emailList.length === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: tokens.space.xs,
            }}
          >
            {loading
              ? "Đang gửi..."
              : `Mời ${emailList.length > 0 ? `(${emailList.length})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
