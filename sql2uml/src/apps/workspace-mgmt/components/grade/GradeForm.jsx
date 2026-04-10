// src/apps/workspace-mgmt/components/grade/GradeForm.jsx

import { useState, useEffect } from "react";
import { tokens } from "../../../../shared/constants/Tokens";

export default function GradeForm({
  diagramId,
  diagramTitle,
  studentId,
  studentName,
  existingGrade,
  onSubmit,
  onCancel,
}) {
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load existing grade nếu có
  useEffect(() => {
    if (existingGrade) {
      setScore(existingGrade.score || "");
      setFeedback(existingGrade.feedback || "");
    } else {
      setScore("");
      setFeedback("");
    }
  }, [existingGrade, diagramId]);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        diagramId,
        studentId,
        score: score.trim(),
        feedback: feedback.trim(),
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: tokens.color.white,
        borderRadius: tokens.radius.lg,
        border: `1px solid ${tokens.color.border}`,
        padding: tokens.space.lg,
        display: "flex",
        flexDirection: "column",
        gap: tokens.space.md,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              fontSize: tokens.font.md,
              fontWeight: tokens.weight.bold,
              color: tokens.color.textBase,
              marginBottom: 3,
            }}
          >
            {diagramTitle || "Untitled Diagram"}
          </p>
          <p
            style={{
              fontSize: tokens.font.sm,
              color: tokens.color.textSub,
            }}
          >
            {studentName || studentId}
          </p>
        </div>
        {existingGrade && (
          <span
            style={{
              fontSize: tokens.font.xs,
              fontWeight: tokens.weight.bold,
              padding: "3px 8px",
              borderRadius: tokens.radius.sm,
              backgroundColor: "#dbeafe",
              color: "#1d4ed8",
            }}
          >
            Đã chấm
          </span>
        )}
      </div>

      {/* Score input */}
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
          Điểm
        </label>
        <input
          type="text"
          value={score}
          onChange={(e) => {
            setScore(e.target.value);
            setError(null);
          }}
          placeholder="VD: 8.5 hoặc A+ hoặc Đạt"
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
          onFocus={(e) => (e.target.style.borderColor = tokens.color.primary)}
          onBlur={(e) => (e.target.style.borderColor = tokens.color.border)}
        />
      </div>

      {/* Feedback */}
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
          Nhận xét
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Nhận xét của giảng viên..."
          rows={3}
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
            resize: "none",
            fontFamily: "inherit",
            lineHeight: 1.6,
          }}
          onFocus={(e) => (e.target.style.borderColor = tokens.color.primary)}
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

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: tokens.space.sm,
          justifyContent: "flex-end",
        }}
      >
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              padding: "7px 16px",
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
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "7px 18px",
            borderRadius: tokens.radius.md,
            border: "none",
            backgroundColor: loading
              ? tokens.color.primary + "60"
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
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ animation: "spin 1s linear infinite" }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
          {loading ? "Đang lưu..." : existingGrade ? "Cập nhật" : "Chấm điểm"}
        </button>
      </div>
    </div>
  );
}
