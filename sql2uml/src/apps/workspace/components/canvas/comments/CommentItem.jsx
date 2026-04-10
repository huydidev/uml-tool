// src/apps/workspace/components/canvas/comments/CommentItem.jsx

import { useState } from "react";
import { tokens } from "../../../../../shared/constants/Tokens";

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentItem({
  comment,
  currentUserId,
  onResolve,
  onDelete,
  onReply,
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isOwner = comment.userId === currentUserId;
  const isResolved = comment.status === "RESOLVED";

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onReply(replyText.trim(), comment.id);
      setReplyText("");
      setShowReply(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        padding: `${tokens.space.sm}px 0`,
        borderBottom: `1px solid ${tokens.color.surface}`,
        opacity: isResolved ? 0.6 : 1,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Avatar */}
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              backgroundColor: tokens.color.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
              fontWeight: 700,
              color: "#ffffff",
              flexShrink: 0,
            }}
          >
            {(comment.userName || comment.userId || "?")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <p
              style={{
                fontSize: tokens.font.sm,
                fontWeight: tokens.weight.semibold,
                color: tokens.color.textBase,
              }}
            >
              {comment.userName || comment.userId}
            </p>
            <p
              style={{
                fontSize: 9,
                color: tokens.color.textMuted,
              }}
            >
              {formatTime(comment.createdAt)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 4 }}>
          {!isResolved && (
            <button
              onClick={() => onResolve?.(comment.id)}
              title="Đánh dấu đã giải quyết"
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: "#16a34a",
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: "2px 4px",
              }}
            >
              ✓
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => onDelete?.(comment.id)}
              title="Xóa"
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: tokens.color.danger,
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: "2px 4px",
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <p
        style={{
          fontSize: tokens.font.md,
          color: tokens.color.textBase,
          lineHeight: 1.5,
          marginBottom: 6,
          wordBreak: "break-word",
        }}
      >
        {isResolved && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#16a34a",
              backgroundColor: "#dcfce7",
              padding: "1px 6px",
              borderRadius: 4,
              marginRight: 6,
            }}
          >
            RESOLVED
          </span>
        )}
        {comment.content}
      </p>

      {/* Replies */}
      {comment.replies?.length > 0 && (
        <div
          style={{
            marginLeft: 16,
            paddingLeft: 10,
            borderLeft: `2px solid ${tokens.color.surface}`,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginBottom: 6,
          }}
        >
          {comment.replies.map((reply) => (
            <div key={reply.id}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 2,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    backgroundColor: tokens.color.secondary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 7,
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  {(reply.userName || "?").slice(0, 2).toUpperCase()}
                </div>
                <span
                  style={{
                    fontSize: tokens.font.sm,
                    fontWeight: tokens.weight.semibold,
                    color: tokens.color.textBase,
                  }}
                >
                  {reply.userName}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: tokens.color.textMuted,
                  }}
                >
                  {formatTime(reply.createdAt)}
                </span>
              </div>
              <p
                style={{
                  fontSize: tokens.font.md,
                  color: tokens.color.textBase,
                  lineHeight: 1.5,
                  marginLeft: 24,
                }}
              >
                {reply.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Reply button + input */}
      {!isResolved && (
        <>
          {!showReply ? (
            <button
              onClick={() => setShowReply(true)}
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: tokens.color.primary,
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Trả lời
            </button>
          ) : (
            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 4,
              }}
            >
              <input
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleReply();
                  }
                  if (e.key === "Escape") setShowReply(false);
                }}
                placeholder="Trả lời..."
                style={{
                  flex: 1,
                  padding: "5px 8px",
                  borderRadius: tokens.radius.md,
                  border: `1px solid ${tokens.color.border}`,
                  backgroundColor: tokens.color.surface,
                  fontSize: tokens.font.sm,
                  outline: "none",
                }}
              />
              <button
                onClick={handleReply}
                disabled={submitting || !replyText.trim()}
                style={{
                  padding: "5px 10px",
                  borderRadius: tokens.radius.md,
                  border: "none",
                  backgroundColor: tokens.color.primary,
                  color: "#ffffff",
                  fontSize: tokens.font.sm,
                  fontWeight: tokens.weight.semibold,
                  cursor:
                    submitting || !replyText.trim() ? "not-allowed" : "pointer",
                  opacity: submitting || !replyText.trim() ? 0.6 : 1,
                }}
              >
                Gửi
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
