// src/apps/workspace/components/canvas/edges/EdgeLabel.jsx

import { useState } from "react";
import { EdgeLabelRenderer } from "reactflow";

const CARDINALITY_OPTIONS = [
  { value: "1", label: "1" },
  { value: "N", label: "N" },
  { value: "0..1", label: "0..1" },
  { value: "0..N", label: "0..N" },
  { value: "1..*", label: "1..*" },
];

function CardinalityBadge({ value, x, y, onClick, selected }) {
  return (
    <div
      onClick={onClick}
      className="nodrag nopan"
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        backgroundColor: selected ? "#007AFF" : "#ffffff",
        color: selected ? "#ffffff" : "#1C1C1E",
        fontSize: 10,
        fontWeight: 700,
        padding: "1px 6px",
        borderRadius: 4,
        border: `1.5px solid ${selected ? "#007AFF" : "#cbd5e1"}`,
        cursor: "pointer",
        pointerEvents: "all",
        userSelect: "none",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        fontFamily: "monospace",
        lineHeight: "16px",
        whiteSpace: "nowrap",
        zIndex: 10,
      }}
    >
      {value || "1"}
    </div>
  );
}

function CardinalityPopup({ x, y, value, onChange, onClose }) {
  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 998 }}
        onClick={onClose}
      />
      <div
        className="nodrag nopan"
        style={{
          position: "absolute",
          left: x,
          top: y - 10,
          transform: "translate(-50%, -100%)",
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          padding: "6px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          zIndex: 999,
          pointerEvents: "all",
          minWidth: 72,
        }}
      >
        <p
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: "2px 6px",
            marginBottom: 2,
          }}
        >
          Bản số
        </p>
        {CARDINALITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={(e) => {
              e.stopPropagation();
              onChange(opt.value);
              onClose();
            }}
            style={{
              padding: "5px 10px",
              borderRadius: 6,
              border: "none",
              backgroundColor: value === opt.value ? "#007AFF" : "transparent",
              color: value === opt.value ? "#ffffff" : "#1C1C1E",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "monospace",
            }}
            onMouseEnter={(e) => {
              if (value !== opt.value)
                e.currentTarget.style.backgroundColor = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              if (value !== opt.value)
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </>
  );
}

export default function EdgeLabel({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourceLabel,
  targetLabel,
  onSourceChange,
  onTargetChange,
}) {
  const [showSourcePopup, setShowSourcePopup] = useState(false);
  const [showTargetPopup, setShowTargetPopup] = useState(false);

  // ── Tính điểm nằm trên đường thẳng source → target ───────────
  // Dùng nội suy tuyến tính đúng với tọa độ viewport
  const getPointOnPath = (ratio) => ({
    x: sourceX + (targetX - sourceX) * ratio,
    y: sourceY + (targetY - sourceY) * ratio,
  });

  const sourcePoint = getPointOnPath(0.18);
  const targetPoint = getPointOnPath(0.82);

  return (
    <EdgeLabelRenderer>
      {/* Source label */}
      <CardinalityBadge
        value={sourceLabel}
        x={sourcePoint.x}
        y={sourcePoint.y}
        selected={showSourcePopup}
        onClick={(e) => {
          e.stopPropagation();
          setShowSourcePopup((v) => !v);
          setShowTargetPopup(false);
        }}
      />

      {showSourcePopup && (
        <CardinalityPopup
          x={sourcePoint.x}
          y={sourcePoint.y}
          value={sourceLabel}
          onChange={onSourceChange}
          onClose={() => setShowSourcePopup(false)}
        />
      )}

      {/* Target label */}
      <CardinalityBadge
        value={targetLabel}
        x={targetPoint.x}
        y={targetPoint.y}
        selected={showTargetPopup}
        onClick={(e) => {
          e.stopPropagation();
          setShowTargetPopup((v) => !v);
          setShowSourcePopup(false);
        }}
      />

      {showTargetPopup && (
        <CardinalityPopup
          x={targetPoint.x}
          y={targetPoint.y}
          value={targetLabel}
          onChange={onTargetChange}
          onClose={() => setShowTargetPopup(false)}
        />
      )}
    </EdgeLabelRenderer>
  );
}
