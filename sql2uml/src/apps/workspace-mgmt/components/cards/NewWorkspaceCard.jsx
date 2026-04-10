// src/apps/workspace-mgmt/components/cards/NewWorkspaceCard.jsx

import { useState } from "react";
import { tokens } from "../../../../shared/constants/Tokens";

export default function NewWorkspaceCard({ onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? tokens.color.primary + "06" : "#fafbfc",
        border: `1.5px dashed ${
          hovered ? tokens.color.primary : tokens.color.border
        }`,
        borderRadius: tokens.radius.xl,
        padding: tokens.space.lg,
        cursor: "pointer",
        transition: "all 0.18s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: tokens.space.md,
        minHeight: 160,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: `1.5px solid ${tokens.color.primary}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tokens.color.primary,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontSize: tokens.font.md,
            fontWeight: tokens.weight.semibold,
            color: tokens.color.textBase,
            marginBottom: 3,
          }}
        >
          Tạo Workspace
        </p>
        <p
          style={{
            fontSize: tokens.font.sm,
            color: tokens.color.textMuted,
          }}
        >
          Team hoặc lớp học mới
        </p>
      </div>
    </div>
  );
}
