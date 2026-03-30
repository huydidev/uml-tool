import { BaseEdge, EdgeLabelRenderer, getStraightPath, getBezierPath, MarkerType } from 'reactflow';

// ─── ASSOCIATION (→) ────────────────────────────────────────────────
export function AssociationEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd, selected }) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{ stroke: selected ? '#3b82f6' : '#1e293b', strokeWidth: 2 }} />
      {data?.label && (
        <EdgeLabelRenderer>
          <div style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`, fontSize: 11, background: 'white', padding: '1px 4px', border: '1px solid #cbd5e1', borderRadius: 3, pointerEvents: 'all' }} className="nodrag nopan">
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

// ─── INHERITANCE (▷) — hollow triangle ──────────────────────────────
export function InheritanceEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected }) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <defs>
        <marker id={`inheritance-${id}`} markerWidth="12" markerHeight="12" refX="10" refY="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="white" stroke={selected ? '#3b82f6' : '#1e293b'} strokeWidth="1.5" />
        </marker>
      </defs>
      <BaseEdge id={id} path={edgePath} style={{ stroke: selected ? '#3b82f6' : '#1e293b', strokeWidth: 2, markerEnd: `url(#inheritance-${id})` }} />
    </>
  );
}

// ─── AGGREGATION (◇→) — hollow diamond ──────────────────────────────
export function AggregationEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected }) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <defs>
        <marker id={`aggregation-${id}`} markerWidth="14" markerHeight="10" refX="1" refY="5" orient="auto">
          <path d="M 12 5 L 7 1 L 2 5 L 7 9 Z" fill="white" stroke={selected ? '#3b82f6' : '#1e293b'} strokeWidth="1.5" />
        </marker>
        <marker id={`aggregation-arrow-${id}`} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <path d="M 0 0 L 9 4 L 0 8" fill="none" stroke={selected ? '#3b82f6' : '#1e293b'} strokeWidth="1.5" />
        </marker>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#3b82f6' : '#1e293b',
          strokeWidth: 2,
          markerStart: `url(#aggregation-${id})`,
          markerEnd: `url(#aggregation-arrow-${id})`,
        }}
      />
    </>
  );
}

// ─── COMPOSITION (◆→) — filled diamond ──────────────────────────────
export function CompositionEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected }) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <defs>
        <marker id={`composition-${id}`} markerWidth="14" markerHeight="10" refX="1" refY="5" orient="auto">
          <path d="M 12 5 L 7 1 L 2 5 L 7 9 Z" fill={selected ? '#3b82f6' : '#1e293b'} stroke={selected ? '#3b82f6' : '#1e293b'} strokeWidth="1" />
        </marker>
        <marker id={`composition-arrow-${id}`} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <path d="M 0 0 L 9 4 L 0 8" fill="none" stroke={selected ? '#3b82f6' : '#1e293b'} strokeWidth="1.5" />
        </marker>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#3b82f6' : '#1e293b',
          strokeWidth: 2,
          markerStart: `url(#composition-${id})`,
          markerEnd: `url(#composition-arrow-${id})`,
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