// src/apps/workspace/components/canvas/UMLEdges.jsx

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
} from 'reactflow';

// Style chung cho edge được select
const getStroke = (selected) => selected ? '#3b82f6' : '#1e293b';

// ─── ASSOCIATION (→) ────────────────────────────────────────────────
export function AssociationEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, markerEnd, selected,
}) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 16,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ stroke: getStroke(selected), strokeWidth: 2 }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 11,
              background: 'white',
              padding: '1px 4px',
              border: '1px solid #cbd5e1',
              borderRadius: 3,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

// ─── INHERITANCE (▷) — hollow triangle ──────────────────────────────
export function InheritanceEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, selected,
}) {
  const [edgePath] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 16,
  });
  const stroke = getStroke(selected);

  return (
    <>
      <defs>
        <marker id={`inheritance-${id}`} markerWidth="12" markerHeight="12" refX="10" refY="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="white" stroke={stroke} strokeWidth="1.5" />
        </marker>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke, strokeWidth: 2, markerEnd: `url(#inheritance-${id})` }}
      />
    </>
  );
}

// ─── AGGREGATION (◇→) — hollow diamond ──────────────────────────────
export function AggregationEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, selected,
}) {
  const [edgePath] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 16,
  });
  const stroke = getStroke(selected);

  return (
    <>
      <defs>
        <marker id={`agg-diamond-${id}`} markerWidth="14" markerHeight="10" refX="1" refY="5" orient="auto">
          <path d="M 12 5 L 7 1 L 2 5 L 7 9 Z" fill="white" stroke={stroke} strokeWidth="1.5" />
        </marker>
        <marker id={`agg-arrow-${id}`} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <path d="M 0 0 L 9 4 L 0 8" fill="none" stroke={stroke} strokeWidth="1.5" />
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
    </>
  );
}

// ─── COMPOSITION (◆→) — filled diamond ──────────────────────────────
export function CompositionEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, selected,
}) {
  const [edgePath] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 16,
  });
  const stroke = getStroke(selected);

  return (
    <>
      <defs>
        <marker id={`comp-diamond-${id}`} markerWidth="14" markerHeight="10" refX="1" refY="5" orient="auto">
          <path d="M 12 5 L 7 1 L 2 5 L 7 9 Z" fill={stroke} stroke={stroke} strokeWidth="1" />
        </marker>
        <marker id={`comp-arrow-${id}`} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <path d="M 0 0 L 9 4 L 0 8" fill="none" stroke={stroke} strokeWidth="1.5" />
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
    </>
  );
}

export const edgeTypes = {
  association: AssociationEdge,
  inheritance: InheritanceEdge,
  aggregation: AggregationEdge,
  composition: CompositionEdge,
};