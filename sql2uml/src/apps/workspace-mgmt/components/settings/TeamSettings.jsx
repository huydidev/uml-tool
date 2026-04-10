// src/apps/workspace-mgmt/components/settings/TeamSettings.jsx

import { useState } from "react";
import { tokens } from "../../../../shared/constants/Tokens";

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

export default function TeamSettings({ settings, onUpdate }) {
  const [allowMemberInvite, setAllowMemberInvite] = useState(
    settings?.allowMemberInvite || false,
  );
  const [requireApproval, setRequireApproval] = useState(
    settings?.requireApproval || false,
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await onUpdate({
        allowMemberInvite,
        requireApproval,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const isDirty =
    allowMemberInvite !== (settings?.allowMemberInvite || false) ||
    requireApproval !== (settings?.requireApproval || false);

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
          Cài đặt team
        </h3>
        <p
          style={{
            fontSize: tokens.font.sm,
            color: tokens.color.textSub,
          }}
        >
          Quản lý quyền hạn trong team
        </p>
      </div>

      {/* Toggles */}
      <ToggleRow
        label="Thành viên có thể mời người khác"
        description="Cho phép member thường invite thêm người vào team, không chỉ owner"
        value={allowMemberInvite}
        onChange={setAllowMemberInvite}
      />

      <ToggleRow
        label="Yêu cầu duyệt khi tham gia qua link"
        description="Người tham gia qua invite link cần được owner duyệt trước"
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
  );
}
