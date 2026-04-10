// src/apps/workspace-mgmt/components/settings/ClassroomSettings.jsx

import { useState } from "react";
import { tokens } from "../../../../shared/constants/Tokens";
import { GRADE_VISIBLE } from "../../constants/workspaceRoles";
import DeadlinePanel from "./DeadlinePanel";

function ToggleRow({ label, description, value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: `${tokens.space.md}px 0`,
        borderBottom: `1px solid ${tokens.color.surface}`,
        gap: tokens.space.lg,
      }}
    >
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: tokens.font.md,
            fontWeight: tokens.weight.semibold,
            color: tokens.color.textBase,
            marginBottom: 3,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: tokens.font.sm,
            color: tokens.color.textSub,
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      </div>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          backgroundColor: value ? tokens.color.primary : tokens.color.border,
          cursor: "pointer",
          transition: "background 0.2s",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            backgroundColor: tokens.color.white,
            position: "absolute",
            top: 3,
            left: value ? 23 : 3,
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </div>
  );
}

export default function ClassroomSettings({
  settings,
  workspaceId, // ← thêm
  onUpdate,
  loading,
}) {
  const [gradeVisible, setGradeVisible] = useState(
    settings?.gradeVisible || GRADE_VISIBLE.SELF_ONLY,
  );
  const [allowShare, setAllowShare] = useState(
    settings?.allowStudentShare || false,
  );
  const [requireApproval, setRequireApproval] = useState(
    settings?.requireApproval ?? true,
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isOwnerOrTeacher =
    settings?.myRole === "OWNER" || settings?.myRole === "TEACHER";

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await onUpdate({
        gradeVisible,
        allowStudentShare: allowShare,
        requireApproval,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const isDirty =
    gradeVisible !== (settings?.gradeVisible || GRADE_VISIBLE.SELF_ONLY) ||
    allowShare !== (settings?.allowStudentShare || false) ||
    requireApproval !== (settings?.requireApproval ?? true);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: tokens.space.lg,
      }}
    >
      {/* ── Deadline panel — Teacher + Owner đều dùng được ──────── */}
      {isOwnerOrTeacher && (
        <DeadlinePanel
          workspaceId={workspaceId}
          deadline={settings?.deadline}
          onUpdate={onUpdate}
          isOwnerOrTeacher={
            settings?.myRole === "OWNER" || settings?.myRole === "TEACHER"
          }
        />
      )}

      {/* ── Settings card — chỉ Owner ────────────────────────────── */}
      {settings?.myRole === "OWNER" && (
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
              Cài đặt lớp học
            </h3>
            <p
              style={{
                fontSize: tokens.font.sm,
                color: tokens.color.textSub,
              }}
            >
              Quản lý quyền hạn và hiển thị trong lớp
            </p>
          </div>

          {/* Grade visible */}
          <div
            style={{
              padding: `${tokens.space.md}px 0`,
              borderBottom: `1px solid ${tokens.color.surface}`,
            }}
          >
            <p
              style={{
                fontSize: tokens.font.md,
                fontWeight: tokens.weight.semibold,
                color: tokens.color.textBase,
                marginBottom: 4,
              }}
            >
              Hiển thị điểm
            </p>
            <p
              style={{
                fontSize: tokens.font.sm,
                color: tokens.color.textSub,
                marginBottom: tokens.space.md,
              }}
            >
              Sinh viên có thể xem điểm của ai
            </p>
            <div
              style={{
                display: "flex",
                border: `1px solid ${tokens.color.border}`,
                borderRadius: tokens.radius.md,
                overflow: "hidden",
                width: "fit-content",
              }}
            >
              {[
                { value: GRADE_VISIBLE.SELF_ONLY, label: "🔒 Chỉ của mình" },
                { value: GRADE_VISIBLE.ALL, label: "👁 Tất cả" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGradeVisible(opt.value)}
                  style={{
                    padding: "8px 18px",
                    border: "none",
                    fontSize: tokens.font.md,
                    fontWeight: tokens.weight.semibold,
                    backgroundColor:
                      gradeVisible === opt.value
                        ? tokens.color.primary
                        : tokens.color.surface,
                    color:
                      gradeVisible === opt.value
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

          {/* Toggles */}
          <ToggleRow
            label="Sinh viên chia sẻ diagram"
            description="Cho phép sinh viên chia sẻ diagram của mình với người khác trong lớp"
            value={allowShare}
            onChange={setAllowShare}
          />

          <ToggleRow
            label="Yêu cầu duyệt khi tham gia"
            description="Sinh viên tham gia qua invite link cần được giảng viên duyệt trước"
            value={requireApproval}
            onChange={setRequireApproval}
          />

          {/* Save */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: tokens.space.sm,
              paddingTop: tokens.space.sm,
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
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              style={{
                padding: "8px 20px",
                borderRadius: tokens.radius.md,
                border: "none",
                backgroundColor:
                  saving || !isDirty
                    ? tokens.color.primary + "60"
                    : tokens.color.primary,
                fontSize: tokens.font.md,
                fontWeight: tokens.weight.semibold,
                color: tokens.color.white,
                cursor: saving || !isDirty ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
