// src/apps/workspace/components/canvas/comments/CommentPanel.jsx

import { useState } from "react";
import { tokens } from "../../../../../shared/constants/Tokens";
import CommentItem from "./CommentItem";

export default function CommentPanel({
  diagramId,
  nodeId,
  nodeName,
  comments,
  loading,
  currentUserId,
  onAdd,
  onResolve,
  onDelete,
  onClose,
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("OPEN");

  // Filter theo node nếu có nodeId
  const filtered = comments
    .filter((c) => (nodeId ? c.nodeId === nodeId : true))
    .filter((c) => (filter === "ALL" ? true : c.status === filter));

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await onAdd(text.trim(), nodeId || null, null);
      setText("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (content, parentId) => {
    await onAdd(content, nodeId || null, parentId);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: `${tokens.space.md}px ${tokens.space.lg}px`,
          borderBottom: `1px solid ${tokens.color.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: tokens.font.md,
              fontWeight: tokens.weight.bold,
              color: tokens.color.textBase,
              marginBottom: 2,
            }}
          >
            {nodeId ? `Comments — ${nodeName || nodeId}` : "Comments"}
          </h3>
          <p
            style={{
              fontSize: tokens.font.sm,
              color: tokens.color.textMuted,
            }}
          >
            {filtered.length} comment
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              width: 26,
              height: 26,
              borderRadius: tokens.radius.md,
              border: `1px solid ${tokens.color.border}`,
              backgroundColor: tokens.color.surface,
              cursor: "pointer",
              color: tokens.color.textSub,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="12"
              height="12"
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
        )}
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: `${tokens.space.sm}px ${tokens.space.lg}px`,
          borderBottom: `1px solid ${tokens.color.surface}`,
          flexShrink: 0,
        }}
      >
        {["OPEN", "RESOLVED", "ALL"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "4px 10px",
              borderRadius: tokens.radius.sm,
              border: "none",
              backgroundColor:
                filter === f ? tokens.color.primary + "15" : "transparent",
              color: filter === f ? tokens.color.primary : tokens.color.textSub,
              fontSize: tokens.font.sm,
              fontWeight:
                filter === f ? tokens.weight.semibold : tokens.weight.normal,
              cursor: "pointer",
            }}
          >
            {f === "ALL" ? "Tất cả" : f === "OPEN" ? "Mở" : "Đã giải quyết"}
          </button>
        ))}
      </div>

      {/* Comment list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: `0 ${tokens.space.lg}px`,
        }}
      >
        {loading ? (
          <div
            style={{
              padding: "24px 0",
              textAlign: "center",
              color: tokens.color.textMuted,
              fontSize: tokens.font.md,
            }}
          >
            Đang tải...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: "24px 0",
              textAlign: "center",
              color: tokens.color.textMuted,
              fontSize: tokens.font.md,
            }}
          >
            Chưa có comment nào
          </div>
        ) : (
          filtered.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onResolve={onResolve}
              onDelete={onDelete}
              onReply={handleReply}
            />
          ))
        )}
      </div>

      {/* Input */}
      <div
        style={{
          padding: tokens.space.md,
          borderTop: `1px solid ${tokens.color.border}`,
          flexShrink: 0,
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Thêm comment... (Ctrl+Enter để gửi)"
          rows={3}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "8px 10px",
            borderRadius: tokens.radius.md,
            border: `1px solid ${tokens.color.border}`,
            backgroundColor: tokens.color.surface,
            fontSize: tokens.font.md,
            color: tokens.color.textBase,
            outline: "none",
            resize: "none",
            fontFamily: "inherit",
            lineHeight: 1.5,
            marginBottom: tokens.space.sm,
          }}
          onFocus={(e) => (e.target.style.borderColor = tokens.color.primary)}
          onBlur={(e) => (e.target.style.borderColor = tokens.color.border)}
        />
        <button
          onClick={handleSubmit}
          disabled={submitting || !text.trim()}
          style={{
            width: "100%",
            padding: "7px 0",
            borderRadius: tokens.radius.md,
            border: "none",
            backgroundColor:
              submitting || !text.trim()
                ? tokens.color.primary + "60"
                : tokens.color.primary,
            color: "#ffffff",
            fontSize: tokens.font.md,
            fontWeight: tokens.weight.semibold,
            cursor: submitting || !text.trim() ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Đang gửi..." : "Gửi comment"}
        </button>
      </div>
    </div>
  );
}
