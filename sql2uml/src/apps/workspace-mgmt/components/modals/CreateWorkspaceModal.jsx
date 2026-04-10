// src/apps/workspace-mgmt/components/modals/CreateWorkspaceModal.jsx

import { useState } from "react";
import { tokens } from "../../../../shared/constants/Tokens";
import { WORKSPACE_TYPES } from "../../constants/workspaceRoles";

const TYPE_OPTIONS = [
  {
    type: WORKSPACE_TYPES.TEAM,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    label: "Team",
    desc: "Cộng tác nhóm, tất cả thành viên cùng làm việc trên diagram chung",
  },
  {
    type: WORKSPACE_TYPES.CLASSROOM,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    label: "Lớp học",
    desc: "Giảng viên quản lý và chấm điểm diagram của từng sinh viên",
  },
];

export default function CreateWorkspaceModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDesc] = useState("");
  const [type, setType] = useState(WORKSPACE_TYPES.TEAM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Vui lòng nhập tên workspace");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onCreate({ name: name.trim(), description, type });
      handleClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDesc("");
    setType(WORKSPACE_TYPES.TEAM);
    setError(null);
    onClose();
  };

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
          width: 460,
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
              Tạo Workspace mới
            </h3>
            <p
              style={{
                fontSize: tokens.font.sm,
                color: tokens.color.textSub,
              }}
            >
              Chọn loại và điền thông tin
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
          {/* Type selector */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: tokens.font.sm,
                fontWeight: tokens.weight.semibold,
                color: tokens.color.textSub,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: tokens.space.sm,
              }}
            >
              Loại workspace
            </label>
            <div style={{ display: "flex", gap: tokens.space.sm }}>
              {TYPE_OPTIONS.map((opt) => {
                const isActive = type === opt.type;
                return (
                  <div
                    key={opt.type}
                    onClick={() => setType(opt.type)}
                    style={{
                      flex: 1,
                      padding: tokens.space.md,
                      borderRadius: tokens.radius.lg,
                      border: `2px solid ${
                        isActive ? tokens.color.primary : tokens.color.border
                      }`,
                      backgroundColor: isActive
                        ? tokens.color.primary + "08"
                        : tokens.color.surface,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        color: isActive
                          ? tokens.color.primary
                          : tokens.color.textSub,
                        marginBottom: tokens.space.xs,
                      }}
                    >
                      {opt.icon}
                    </div>
                    <p
                      style={{
                        fontSize: tokens.font.md,
                        fontWeight: tokens.weight.semibold,
                        color: isActive
                          ? tokens.color.primary
                          : tokens.color.textBase,
                        marginBottom: 3,
                      }}
                    >
                      {opt.label}
                    </p>
                    <p
                      style={{
                        fontSize: tokens.font.sm,
                        color: tokens.color.textMuted,
                        lineHeight: 1.4,
                      }}
                    >
                      {opt.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Name */}
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
              Tên workspace
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={
                type === WORKSPACE_TYPES.CLASSROOM
                  ? "VD: CSDL - Nhóm 02 - HK1 2024"
                  : "VD: Backend Team"
              }
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
          </div>

          {/* Description */}
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
              Mô tả (tùy chọn)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Mô tả ngắn về workspace này..."
              rows={2}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 13px",
                borderRadius: tokens.radius.md,
                border: `1px solid ${tokens.color.border}`,
                backgroundColor: tokens.color.surface,
                fontSize: tokens.font.md,
                color: tokens.color.textBase,
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = tokens.color.primary)
              }
              onBlur={(e) => (e.target.style.borderColor = tokens.color.border)}
            />
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
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "8px 22px",
              borderRadius: tokens.radius.md,
              border: "none",
              backgroundColor: loading
                ? tokens.color.primary + "80"
                : tokens.color.primary,
              fontSize: tokens.font.md,
              fontWeight: tokens.weight.semibold,
              color: tokens.color.white,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: tokens.space.xs,
            }}
          >
            {loading && (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{ animation: "spin 1s linear infinite" }}
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            )}
            {loading ? "Đang tạo..." : "Tạo workspace"}
          </button>
        </div>
      </div>
    </div>
  );
}
