// UMLEdges.jsx — bỏ getEdgeCenter, tính điểm trực tiếp

import { useState } from "react";
import {
  BaseEdge,
  getSmoothStepPath,
  EdgeLabelRenderer,
  useReactFlow,
} from "reactflow";
// ← KHÔNG import getEdgeCenter

// ── Tính điểm trên path SmoothStep ───────────────────────────────
// getSmoothStepPath trả về SVG path string
// Dùng document.createElementNS để lấy điểm chính xác trên path
function getPointOnSVGPath(pathString, ratio) {
  try {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathString);
    const length = path.getTotalLength();
    const point = path.getPointAtLength(length * ratio);
    return { x: point.x, y: point.y };
  } catch {
    return null;
  }
}

// ── CardinalityLabels ─────────────────────────────────────────────
function CardinalityLabels({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  sourceLabel,
  targetLabel,
  onSourceChange,
  onTargetChange,
}) {
  const [showSource, setShowSource] = useState(false);
  const [showTarget, setShowTarget] = useState(false);

  // Lấy path thật để tính điểm chính xác
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  // Lấy điểm 20% và 80% trên path thật
  const srcPoint = getPointOnSVGPath(edgePath, 0.2) || {
    x: sourceX + (targetX - sourceX) * 0.2,
    y: sourceY + (targetY - sourceY) * 0.2,
  };
  const tgtPoint = getPointOnSVGPath(edgePath, 0.8) || {
    x: sourceX + (targetX - sourceX) * 0.8,
    y: sourceY + (targetY - sourceY) * 0.8,
  };

  const OPTIONS = ["1", "N", "0..1", "0..N", "1..*"];

  const Badge = ({ point, value, show, onToggle, onHide, onChange }) => (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="nodrag nopan"
        style={{
          position: "absolute",
          left: point.x,
          top: point.y,
          transform: "translate(-50%, -50%)",
          backgroundColor: show ? "#007AFF" : "#fff",
          color: show ? "#fff" : "#1C1C1E",
          fontSize: 10,
          fontWeight: 700,
          padding: "1px 6px",
          borderRadius: 4,
          border: `1.5px solid ${show ? "#007AFF" : "#cbd5e1"}`,
          cursor: "pointer",
          pointerEvents: "all",
          userSelect: "none",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          fontFamily: "monospace",
          whiteSpace: "nowrap",
          zIndex: 10,
          minWidth: 20,
          textAlign: "center",
        }}
      >
        {value}
      </div>

      {show && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 98 }}
            onClick={(e) => {
              e.stopPropagation();
              onHide();
            }}
          />
          <div
            className="nodrag nopan"
            style={{
              position: "absolute",
              left: point.x,
              top: point.y - 12,
              transform: "translate(-50%, -100%)",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              padding: "6px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              zIndex: 99,
              pointerEvents: "all",
              minWidth: 70,
            }}
          >
            <p
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "2px 6px 4px",
              }}
            >
              Bản số
            </p>
            {OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt);
                  onHide();
                }}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: value === opt ? "#007AFF" : "transparent",
                  color: value === opt ? "#fff" : "#1C1C1E",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "monospace",
                }}
                onMouseEnter={(e) => {
                  if (value !== opt)
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  if (value !== opt)
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );

  return (
    <EdgeLabelRenderer>
      <Badge
        point={srcPoint}
        value={sourceLabel}
        show={showSource}
        onToggle={() => {
          setShowSource((v) => !v);
          setShowTarget(false);
        }}
        onHide={() => setShowSource(false)}
        onChange={onSourceChange}
      />
      <Badge
        point={tgtPoint}
        value={targetLabel}
        show={showTarget}
        onToggle={() => {
          setShowTarget((v) => !v);
          setShowSource(false);
        }}
        onHide={() => setShowTarget(false)}
        onChange={onTargetChange}
      />
    </EdgeLabelRenderer>
  );
}

const getStroke = (selected) => (selected ? "#3b82f6" : "#1e293b");

// ── ASSOCIATION ───────────────────────────────────────────────────
export function AssociationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  selected,
}) {
  const { setEdges } = useReactFlow();

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const handleSourceChange = (val) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              data: {
                ...e.data,
                sourceLabel: val,
                cardinality: `${val}:${e.data?.targetLabel || "N"}`,
              },
            },
      ),
    );
  };

  const handleTargetChange = (val) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              data: {
                ...e.data,
                targetLabel: val,
                cardinality: `${e.data?.sourceLabel || "1"}:${val}`,
              },
            },
      ),
    );
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ stroke: getStroke(selected), strokeWidth: 2 }}
      />
      <CardinalityLabels
        sourceX={sourceX}
        sourceY={sourceY}
        targetX={targetX}
        targetY={targetY}
        sourcePosition={sourcePosition}
        targetPosition={targetPosition}
        sourceLabel={data?.sourceLabel || "1"}
        targetLabel={data?.targetLabel || "N"}
        onSourceChange={handleSourceChange}
        onTargetChange={handleTargetChange}
      />
    </>
  );
}

// ── INHERITANCE ───────────────────────────────────────────────────
export function InheritanceEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });
  const stroke = getStroke(selected);

  return (
    <>
      <defs>
        <marker
          id={`inheritance-${id}`}
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="5"
          orient="auto"
        >
          <path
            d="M 0 0 L 10 5 L 0 10 Z"
            fill="white"
            stroke={stroke}
            strokeWidth="1.5"
          />
        </marker>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke,
          strokeWidth: 2,
          markerEnd: `url(#inheritance-${id})`,
        }}
      />
    </>
  );
}

// ── AGGREGATION ───────────────────────────────────────────────────
export function AggregationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}) {
  const { setEdges } = useReactFlow();

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });
  const stroke = getStroke(selected);

  const handleSourceChange = (val) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              data: {
                ...e.data,
                sourceLabel: val,
                cardinality: `${val}:${e.data?.targetLabel || "N"}`,
              },
            },
      ),
    );
  };

  const handleTargetChange = (val) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              data: {
                ...e.data,
                targetLabel: val,
                cardinality: `${e.data?.sourceLabel || "1"}:${val}`,
              },
            },
      ),
    );
  };

  return (
    <>
      <defs>
        <marker
          id={`agg-diamond-${id}`}
          markerWidth="14"
          markerHeight="10"
          refX="1"
          refY="5"
          orient="auto"
        >
          <path
            d="M 12 5 L 7 1 L 2 5 L 7 9 Z"
            fill="white"
            stroke={stroke}
            strokeWidth="1.5"
          />
        </marker>
        <marker
          id={`agg-arrow-${id}`}
          markerWidth="10"
          markerHeight="8"
          refX="9"
          refY="4"
          orient="auto"
        >
          <path
            d="M 0 0 L 9 4 L 0 8"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
        </marker>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke,
          strokeWidth: 2,
          markerStart: `url(#agg-diamond-${id})`,
          markerEnd: `url(#agg-arrow-${id})`,
        }}
      />
      <CardinalityLabels
        sourceX={sourceX}
        sourceY={sourceY}
        targetX={targetX}
        targetY={targetY}
        sourcePosition={sourcePosition}
        targetPosition={targetPosition}
        sourceLabel={data?.sourceLabel || "1"}
        targetLabel={data?.targetLabel || "N"}
        onSourceChange={handleSourceChange}
        onTargetChange={handleTargetChange}
      />
    </>
  );
}

// ── COMPOSITION ───────────────────────────────────────────────────
export function CompositionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}) {
  const { setEdges } = useReactFlow();

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });
  const stroke = getStroke(selected);

  const handleSourceChange = (val) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              data: {
                ...e.data,
                sourceLabel: val,
                cardinality: `${val}:${e.data?.targetLabel || "1"}`,
              },
            },
      ),
    );
  };

  const handleTargetChange = (val) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              data: {
                ...e.data,
                targetLabel: val,
                cardinality: `${e.data?.sourceLabel || "1"}:${val}`,
              },
            },
      ),
    );
  };

  return (
    <>
      <defs>
        <marker
          id={`comp-diamond-${id}`}
          markerWidth="14"
          markerHeight="10"
          refX="1"
          refY="5"
          orient="auto"
        >
          <path
            d="M 12 5 L 7 1 L 2 5 L 7 9 Z"
            fill={stroke}
            stroke={stroke}
            strokeWidth="1"
          />
        </marker>
        <marker
          id={`comp-arrow-${id}`}
          markerWidth="10"
          markerHeight="8"
          refX="9"
          refY="4"
          orient="auto"
        >
          <path
            d="M 0 0 L 9 4 L 0 8"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
        </marker>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke,
          strokeWidth: 2,
          markerStart: `url(#comp-diamond-${id})`,
          markerEnd: `url(#comp-arrow-${id})`,
        }}
      />
      <CardinalityLabels
        sourceX={sourceX}
        sourceY={sourceY}
        targetX={targetX}
        targetY={targetY}
        sourcePosition={sourcePosition}
        targetPosition={targetPosition}
        sourceLabel={data?.sourceLabel || "1"}
        targetLabel={data?.targetLabel || "1"}
        onSourceChange={handleSourceChange}
        onTargetChange={handleTargetChange}
      />
    </>
  );
}

export const edgeTypes = {
  association: AssociationEdge,
  inheritance: InheritanceEdge,
  aggregation: AggregationEdge,
  composition: CompositionEdge,
};
