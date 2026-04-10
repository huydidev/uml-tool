// src/apps/workspace/components/canvas/comments/CommentBubble.jsx
// Icon nhỏ hiện trên node có comment

import { tokens } from "../../../../../shared/constants/Tokens";

export default function CommentBubble({ count, onClick }) {
  if (!count || count === 0) return null;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      style={{
        position: "absolute",
        top: -10,
        right: -10,
        width: 20,
        height: 20,
        borderRadius: "50%",
        backgroundColor: "#f59e0b",
        border: "2px solid #ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 20,
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }}
    >
      <span
        style={{
          fontSize: 8,
          fontWeight: 700,
          color: "#ffffff",
        }}
      >
        {count > 9 ? "9+" : count}
      </span>
    </div>
  );
}
