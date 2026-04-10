// src/apps/workspace-mgmt/components/grade/GradeCard.jsx

import { tokens } from "../../../../shared/constants/Tokens";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function GradeCard({ grade, showStudent = true }) {
  return (
    <div
      style={{
        backgroundColor: tokens.color.white,
        borderRadius: tokens.radius.lg,
        border: `1px solid ${tokens.color.border}`,
        padding: tokens.space.lg,
        display: "flex",
        flexDirection: "column",
        gap: tokens.space.sm,
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: tokens.space.sm,
        }}
      >
        {/* Diagram title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: tokens.font.md,
              fontWeight: tokens.weight.semibold,
              color: tokens.color.textBase,
              marginBottom: 3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {grade.diagramTitle || "Untitled Diagram"}
          </p>
          {showStudent && (
            <p
              style={{
                fontSize: tokens.font.sm,
                color: tokens.color.textSub,
              }}
            >
              {grade.studentName === "Ẩn danh"
                ? "👤 Ẩn danh"
                : grade.studentName || grade.studentId}
            </p>
          )}
        </div>

        {/* Score badge */}
        <div
          style={{
            flexShrink: 0,
            padding: "6px 14px",
            borderRadius: tokens.radius.md,
            backgroundColor: grade.score
              ? tokens.color.primary + "12"
              : tokens.color.surface,
            border: `1px solid ${
              grade.score ? tokens.color.primary + "30" : tokens.color.border
            }`,
            textAlign: "center",
            minWidth: 52,
          }}
        >
          <p
            style={{
              fontSize: 18,
              fontWeight: tokens.weight.extrabold,
              color: grade.score
                ? tokens.color.primary
                : tokens.color.textMuted,
              lineHeight: 1,
            }}
          >
            {grade.score || "—"}
          </p>
          <p
            style={{
              fontSize: 9,
              fontWeight: tokens.weight.semibold,
              color: tokens.color.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginTop: 2,
            }}
          >
            Điểm
          </p>
        </div>
      </div>

      {/* Feedback */}
      {grade.feedback && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: tokens.radius.md,
            backgroundColor: tokens.color.surface,
            borderLeft: `3px solid ${tokens.color.primary}`,
          }}
        >
          <p
            style={{
              fontSize: tokens.font.md,
              color: tokens.color.textSub,
              lineHeight: 1.6,
            }}
          >
            {grade.feedback}
          </p>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: tokens.space.xs,
        }}
      >
        <p
          style={{
            fontSize: tokens.font.sm,
            color: tokens.color.textMuted,
          }}
        >
          Chấm bởi {grade.teacherName || grade.teacherId}
        </p>
        <p
          style={{
            fontSize: tokens.font.sm,
            color: tokens.color.textMuted,
          }}
        >
          {formatDate(grade.gradedAt)}
        </p>
      </div>
    </div>
  );
}
