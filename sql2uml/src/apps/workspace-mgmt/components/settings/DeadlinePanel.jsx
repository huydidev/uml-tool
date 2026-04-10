// src/apps/workspace-mgmt/components/settings/DeadlinePanel.jsx

import { useState } from "react";
import { tokens } from "../../../../shared/constants/Tokens";
import { workspaceApi } from "../../api/workspaceApi";

function formatDeadline(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CountdownBadge({ deadline }) {
  if (!deadline) return null;

  const now = new Date();
  const deadlineD = new Date(deadline);
  const diff = deadlineD - now;

  if (diff <= 0) {
    return (
      <span
        style={{
          fontSize: tokens.font.xs,
          fontWeight: tokens.weight.bold,
          padding: "3px 9px",
          borderRadius: tokens.radius.sm,
          backgroundColor: "#fee2e2",
          color: tokens.color.danger,
        }}
      >
        🔒 Đã kết thúc
      </span>
    );
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  const text =
    days > 0
      ? `Còn ${days} ngày ${hours} giờ`
      : hours > 0
        ? `Còn ${hours} giờ ${minutes} phút`
        : `Còn ${minutes} phút`;

  const color =
    days === 0 && hours < 2
      ? tokens.color.danger
      : days < 1
        ? tokens.color.warning
        : "#16a34a";

  return (
    <span
      style={{
        fontSize: tokens.font.xs,
        fontWeight: tokens.weight.bold,
        padding: "3px 9px",
        borderRadius: tokens.radius.sm,
        backgroundColor: color + "15",
        color,
      }}
    >
      ⏰ {text}
    </span>
  );
}

export default function DeadlinePanel({ deadline, onUpdate, isOwnerOrTeacher, workspaceId }) {
  // datetime-local input cần format: "YYYY-MM-DDTHH:mm"
  const toInputValue = (iso) => {
    if (!iso) return "";
    return new Date(iso).toISOString().slice(0, 16);
  };

  const [value, setValue] = useState(toInputValue(deadline));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!value) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await workspaceApi.updateDeadline(
        workspaceId,
        new Date(value).toISOString(),
      );
      onUpdate?.(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      const updated = await workspaceApi.updateDeadline(workspaceId, null);
      setValue("");
      onUpdate?.(updated);
    } finally {
      setSaving(false);
    }
  };

  const isDirty = toInputValue(deadline) !== value;

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
      {/* Title */}
      <div>
        <h3
          style={{
            fontSize: tokens.font.lg,
            fontWeight: tokens.weight.bold,
            color: tokens.color.textBase,
            marginBottom: 4,
          }}
        >
          Hạn nộp bài
        </h3>
        <p
          style={{
            fontSize: tokens.font.sm,
            color: tokens.color.textSub,
          }}
        >
          Sau thời hạn, sinh viên không thể chỉnh sửa diagram
        </p>
      </div>

      {/* Current deadline status */}
      {deadline && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: tokens.space.md,
            borderRadius: tokens.radius.lg,
            backgroundColor: tokens.color.surface,
            border: `1px solid ${tokens.color.border}`,
          }}
        >
          <div>
            <p
              style={{
                fontSize: tokens.font.sm,
                fontWeight: tokens.weight.semibold,
                color: tokens.color.textBase,
                marginBottom: 3,
              }}
            >
              {formatDeadline(deadline)}
            </p>
            <CountdownBadge deadline={deadline} />
          </div>
        </div>
      )}

      {/* Date picker — chỉ owner */}
      {isOwnerOrTeacher && (
        <>
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
              {deadline ? "Thay đổi hạn nộp" : "Đặt hạn nộp"}
            </label>
            <input
              type="datetime-local"
              value={value}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setValue(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "9px 13px",
                borderRadius: tokens.radius.md,
                border: `1px solid ${tokens.color.border}`,
                backgroundColor: tokens.color.surface,
                fontSize: tokens.font.md,
                color: tokens.color.textBase,
                outline: "none",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = tokens.color.primary)
              }
              onBlur={(e) => (e.target.style.borderColor = tokens.color.border)}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: tokens.space.sm,
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            {saved && (
              <span
                style={{
                  fontSize: tokens.font.sm,
                  color: "#16a34a",
                  fontWeight: tokens.weight.semibold,
                }}
              >
                ✓ Đã lưu
              </span>
            )}

            {deadline && (
              <button
                onClick={handleClear}
                disabled={saving}
                style={{
                  padding: "7px 14px",
                  borderRadius: tokens.radius.md,
                  border: `1px solid ${tokens.color.border}`,
                  backgroundColor: tokens.color.surface,
                  fontSize: tokens.font.sm,
                  fontWeight: tokens.weight.semibold,
                  color: tokens.color.danger,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                Xóa deadline
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !isDirty || !value}
              style={{
                padding: "7px 18px",
                borderRadius: tokens.radius.md,
                border: "none",
                backgroundColor:
                  saving || !isDirty || !value
                    ? tokens.color.primary + "60"
                    : tokens.color.primary,
                fontSize: tokens.font.sm,
                fontWeight: tokens.weight.semibold,
                color: tokens.color.white,
                cursor:
                  saving || !isDirty || !value ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </>
      )}

      {/* Info cho student */}
      {!isOwnerOrTeacher && !deadline && (
        <p
          style={{
            fontSize: tokens.font.md,
            color: tokens.color.textMuted,
            fontStyle: "italic",
          }}
        >
          Chưa có hạn nộp bài
        </p>
      )}
    </div>
  );
}
