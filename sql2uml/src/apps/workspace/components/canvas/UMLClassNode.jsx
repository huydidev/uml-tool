// src/apps/workspace/components/canvas/UMLClassNode.jsx
// Commit 9: Hiện border màu khi node bị lock bởi user khác

import { Handle, Position, useReactFlow, useStore } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { useState, useMemo, useCallback } from 'react';
import { THEME } from '../../../../shared/constants/theme';

function getBestHandlePosition(sourceNode, targetNode) {
  if (!sourceNode || !targetNode) return null;
  const sx = sourceNode.position.x + (sourceNode.width ?? 180) / 2;
  const sy = sourceNode.position.y + (sourceNode.height ?? 120) / 2;
  const tx = targetNode.position.x + (targetNode.width ?? 180) / 2;
  const ty = targetNode.position.y + (targetNode.height ?? 120) / 2;
  const dx = tx - sx;
  const dy = ty - sy;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0 ? Position.Right : Position.Left;
  } else {
    return dy > 0 ? Position.Bottom : Position.Top;
  }
}

function useNodeConnections(nodeId) {
  return useStore((s) => s.edges.filter(
    (e) => e.source === nodeId || e.target === nodeId
  ));
}

function Handles({ nodeId, visible }) {
  const edges = useNodeConnections(nodeId);
  const nodes = useStore((s) => s.nodeInternals);

  const usedPositions = useMemo(() => {
    const positions = new Set();
    edges.forEach((edge) => {
      const isSource    = edge.source === nodeId;
      const otherNodeId = isSource ? edge.target : edge.source;
      const selfNode    = nodes.get(nodeId);
      const otherNode   = nodes.get(otherNodeId);
      if (!selfNode || !otherNode) return;
      const pos = getBestHandlePosition(
        isSource ? selfNode : otherNode,
        isSource ? otherNode : selfNode
      );
      if (pos) positions.add(pos);
    });
    return positions;
  }, [edges, nodes, nodeId]);

  const dotStyle = () => ({
    width: 10, height: 10,
    background: THEME.colors.PRIMARY,
    border: '2px solid white',
    borderRadius: '50%',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.15s',
    zIndex: 10,
  });

  return (
    <>
      <Handle type="source" position={Position.Top}    id="top"    style={dotStyle()} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={dotStyle()} />
      <Handle type="source" position={Position.Left}   id="left"   style={dotStyle()} />
      <Handle type="source" position={Position.Right}  id="right"  style={dotStyle()} />
    </>
  );
}

// ── Lock indicator — hiện tên user đang giữ node ──────────────────────
function LockBadge({ color, userName }) {
  return (
    <div style={{
      position:        'absolute',
      top:             -22,
      left:            '50%',
      transform:       'translateX(-50%)',
      backgroundColor: color,
      color:           '#ffffff',
      fontSize:        9,
      fontWeight:      700,
      padding:         '2px 7px',
      borderRadius:    4,
      whiteSpace:      'nowrap',
      zIndex:          20,
      pointerEvents:   'none',
      boxShadow:       '0 1px 4px rgba(0,0,0,0.2)',
    }}>
      🔒 {userName || 'Editing...'}
    </div>
  );
}

// ── ERD View ───────────────────────────────────────────────────────────
function ERDView({ id, data, selected }) {
  const { setNodes } = useReactFlow();
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftLabel, setDraftLabel]       = useState(data.label || '');
  const [hovered, setHovered]             = useState(false);

  const isLocked    = !!data.lockedBy;
  const lockColor   = data.lockedColor || '#ef4444';
  const borderColor = isLocked ? lockColor : selected ? THEME.colors.PRIMARY : '#cbd5e1';

  const commitLabel = useCallback((value) => {
    const newLabel = value.trim().toUpperCase() || data.label;
    setIsEditingName(false);
    setNodes((nds) => nds.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, label: newLabel } } : n
    ));
    if (typeof data.onUpdate === 'function') {
      data.onUpdate(id, {
        label:     newLabel,
        tableName: newLabel.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      });
    }
  }, [id, data, setNodes]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative' }}
      className={`bg-white shadow-md min-w-[180px] flex flex-col font-sans transition-all rounded-xl overflow-visible`}
      //style={{
        //border:   `2px solid ${borderColor}`,
        //position: 'relative',
        // Shake animation nếu bị lock
        //boxShadow: isLocked ? `0 0 0 3px ${lockColor}33` : undefined,
     // }}
    >
      {isLocked && <LockBadge color={lockColor} userName={data.lockedBy} />}

      <NodeResizer minWidth={160} minHeight={60} isVisible={selected && !isLocked}
        lineClassName="border-blue-400 border-dashed"
        handleClassName="h-3 w-3 bg-white border-2 border-blue-400 rounded-sm"
      />
      <Handles nodeId={id} visible={(hovered || selected) && !isLocked} />

      <div className={`px-3 py-2 ${THEME.bgPanel} flex justify-center items-center border-b-2 rounded-t-xl`}
        style={{ borderColor }}>
        {isEditingName && !isLocked ? (
          <input
            autoFocus
            className={`w-full text-center font-bold text-xs outline-none rounded px-1 ${THEME.bgInput} text-white`}
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value.toUpperCase())}
            onBlur={() => commitLabel(draftLabel)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commitLabel(draftLabel); }
              if (e.key === 'Escape') { setDraftLabel(data.label); setIsEditingName(false); }
            }}
          />
        ) : (
          <div
            className="font-bold text-xs text-white uppercase tracking-wide cursor-text select-none"
            onDoubleClick={() => !isLocked && (setDraftLabel(data.label), setIsEditingName(true))}
          >
            {data.label || 'TABLE'}
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-100 bg-white rounded-b-xl overflow-hidden">
        {(data.attributes || []).filter(a => a.trim()).map((attr, i) => {
          const clean = attr.replace(/^[-+#~]\s*/, '');
          const [name, type] = clean.split(':').map(s => s.trim());
          const isPK = name?.toLowerCase() === 'id';
          return (
            <div key={i} className={`flex items-center justify-between px-3 py-1.5 text-[11px] ${isPK ? 'bg-yellow-50/50' : ''}`}>
              <span className="flex items-center gap-1 font-mono text-slate-700">
                {isPK && <span className={`${THEME.pkBadge} text-[9px] font-bold`}>PK</span>}
                {name}
              </span>
              <span className={`${THEME.textMuted} font-mono text-[10px]`}>{type || 'VARCHAR'}</span>
            </div>
          );
        })}
        {(!data.attributes || data.attributes.filter(a => a.trim()).length === 0) && (
          <div className="px-3 py-1.5 text-[10px] text-slate-400 italic">no columns</div>
        )}
      </div>
    </div>
  );
}

// ── Class View ─────────────────────────────────────────────────────────
function ClassView({ id, data, selected }) {
  const { setNodes } = useReactFlow();
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftLabel, setDraftLabel]       = useState(data.label || '');
  const [hovered, setHovered]             = useState(false);

  const isLocked    = !!data.lockedBy;
  const lockColor   = data.lockedColor || '#ef4444';
  const borderColor = isLocked ? lockColor : selected ? THEME.colors.PRIMARY : '#cbd5e1';

  const commitField = useCallback((field, value) => {
    setNodes((nds) => nds.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n
    ));
    const payload = { [field]: value };
    if (field === 'label') {
      payload.tableName = value.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
    if (typeof data.onUpdate === 'function') {
      data.onUpdate(id, payload);
    }
  }, [id, data, setNodes]);

  const commitLabel = useCallback((value) => {
    const newLabel = value.trim().toUpperCase() || data.label;
    setIsEditingName(false);
    commitField('label', newLabel);
  }, [commitField, data.label]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border:    `2px solid ${borderColor}`,
        boxShadow: isLocked ? `0 0 0 3px ${lockColor}33` : undefined,
        position:  'relative',
      }}
      className="bg-white shadow-md min-w-[180px] flex flex-col font-sans transition-all rounded-xl overflow-visible"
    >
      {isLocked && <LockBadge color={lockColor} userName={data.lockedBy} />}

      <NodeResizer minWidth={180} minHeight={100} isVisible={selected && !isLocked}
        lineClassName="border-blue-400 border-dashed"
        handleClassName="h-3 w-3 bg-white border-2 border-blue-400 rounded-sm"
      />
      <Handles nodeId={id} visible={(hovered || selected) && !isLocked} />

      {/* Class name header */}
      <div className="p-2 border-b-2 flex justify-center items-center min-h-[35px] bg-slate-50 rounded-t-xl"
        style={{ borderColor }}>
        {isEditingName && !isLocked ? (
          <input
            autoFocus
            className="w-full text-center font-bold uppercase text-sm outline-none bg-blue-50 rounded"
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value.toUpperCase())}
            onBlur={() => commitLabel(draftLabel)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commitLabel(draftLabel); }
              if (e.key === 'Escape') { setDraftLabel(data.label); setIsEditingName(false); }
            }}
          />
        ) : (
          <div
            className="font-bold uppercase text-sm cursor-text select-none text-slate-800"
            onDoubleClick={() => !isLocked && (setDraftLabel(data.label), setIsEditingName(true))}
          >
            {data.label || 'NewClass'}
          </div>
        )}
      </div>

      {/* Attributes */}
      <div className="p-2 bg-white flex-1">
        <textarea
          placeholder="- attributes"
          className="w-full text-[12px] italic border-none outline-none resize-none leading-relaxed overflow-hidden bg-transparent"
          value={data.attributes?.join('\n') || ''}
          rows={Math.max(1, data.attributes?.length || 1)}
          disabled={isLocked}
          onChange={(e) => {
            const newAttrs = e.target.value.split('\n');
            setNodes((nds) => nds.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, attributes: newAttrs } } : n
            ));
          }}
          onBlur={(e) => { if (!isLocked) commitField('attributes', e.target.value.split('\n')); }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              commitField('attributes', e.target.value.split('\n'));
              e.target.blur();
            }
          }}
        />
      </div>

      {/* Methods */}
      <div className="p-2 border-t-2 bg-white flex-1 rounded-b-xl" style={{ borderColor }}>
        <textarea
          placeholder="+ methods()"
          className="w-full text-[12px] border-none outline-none resize-none leading-relaxed overflow-hidden bg-transparent"
          value={data.methods?.join('\n') || ''}
          rows={Math.max(1, data.methods?.length || 1)}
          disabled={isLocked}
          onChange={(e) => {
            const newMethods = e.target.value.split('\n');
            setNodes((nds) => nds.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, methods: newMethods } } : n
            ));
          }}
          onBlur={(e) => { if (!isLocked) commitField('methods', e.target.value.split('\n')); }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              commitField('methods', e.target.value.split('\n'));
              e.target.blur();
            }
          }}
        />
      </div>
    </div>
  );
}

export default function UMLClassNode(props) {
  return props.data.viewMode === 'erd' ? <ERDView {...props} /> : <ClassView {...props} />;
}