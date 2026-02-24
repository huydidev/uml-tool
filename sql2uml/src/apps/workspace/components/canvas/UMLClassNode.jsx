// src/apps/workspace/components/canvas/UMLClassNode.jsx
// FIX: gọi data.onUpdate(id, newData) sau khi edit xong → EditorPage sync SQL

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
      const isSource = edge.source === nodeId;
      const otherNodeId = isSource ? edge.target : edge.source;
      const selfNode = nodes.get(nodeId);
      const otherNode = nodes.get(otherNodeId);
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
    width: 10,
    height: 10,
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

// ── ERD View ───────────────────────────────────────────────────────
function ERDView({ id, data, selected }) {
  const { setNodes } = useReactFlow();
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftLabel, setDraftLabel]       = useState(data.label || '');
  const [hovered, setHovered]             = useState(false);

  // Commit label lên cả ReactFlow state VÀ EditorPage (để sync SQL)
  const commitLabel = useCallback((value) => {
    const newLabel = value.trim().toUpperCase() || data.label;
    setIsEditingName(false);

    // 1. Cập nhật ReactFlow node state
    setNodes((nds) => nds.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, label: newLabel } } : n
    ));

    // 2. Gọi onUpdate để EditorPage sync SQL
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
      className={`bg-white border-2 shadow-md min-w-[180px] flex flex-col font-sans transition-all rounded-xl overflow-visible ${selected ? THEME.borderAccent : 'border-slate-300'}`}
    >
      <NodeResizer minWidth={160} minHeight={60} isVisible={selected}
        lineClassName="border-blue-400 border-dashed"
        handleClassName="h-3 w-3 bg-white border-2 border-blue-400 rounded-sm"
      />
      <Handles nodeId={id} visible={hovered || selected} />

      <div className={`px-3 py-2 ${THEME.bgPanel} flex justify-center items-center border-b-2 rounded-t-xl ${selected ? THEME.borderAccent : 'border-slate-300'}`}>
        {isEditingName ? (
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
            onDoubleClick={() => { setDraftLabel(data.label); setIsEditingName(true); }}
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

// ── Class View ─────────────────────────────────────────────────────
function ClassView({ id, data, selected }) {
  const { setNodes } = useReactFlow();
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftLabel, setDraftLabel]       = useState(data.label || '');
  const [hovered, setHovered]             = useState(false);

  // Commit bất kỳ field nào → cập nhật ReactFlow + gọi onUpdate để sync SQL
  const commitField = useCallback((field, value) => {
    // 1. Cập nhật ReactFlow
    setNodes((nds) => nds.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n
    ));

    // 2. Build payload cho onUpdate
    const payload = { [field]: value };
    if (field === 'label') {
      payload.tableName = value.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    // 3. Gọi onUpdate → EditorPage → sqlPanelRef.updateNode()
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
      className={`bg-white border-2 shadow-md min-w-[180px] flex flex-col font-sans transition-all rounded-xl overflow-visible ${selected ? THEME.borderAccent : 'border-slate-300'}`}
    >
      <NodeResizer minWidth={180} minHeight={100} isVisible={selected}
        lineClassName="border-blue-400 border-dashed"
        handleClassName="h-3 w-3 bg-white border-2 border-blue-400 rounded-sm"
      />
      <Handles nodeId={id} visible={hovered || selected} />

      {/* Class name header */}
      <div className={`p-2 border-b-2 flex justify-center items-center min-h-[35px] bg-slate-50 rounded-t-xl ${selected ? THEME.borderAccent : 'border-slate-300'}`}>
        {isEditingName ? (
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
            onDoubleClick={() => { setDraftLabel(data.label); setIsEditingName(true); }}
          >
            {data.label || 'NewClass'}
          </div>
        )}
      </div>

      {/* Attributes textarea */}
      <div className="p-2 bg-white flex-1">
        <textarea
          placeholder="- attributes"
          className="w-full text-[12px] italic border-none outline-none resize-none leading-relaxed overflow-hidden bg-transparent"
          value={data.attributes?.join('\n') || ''}
          rows={Math.max(1, data.attributes?.length || 1)}
          onChange={(e) => {
            // Cập nhật local ReactFlow state ngay để UI responsive
            const newAttrs = e.target.value.split('\n');
            setNodes((nds) => nds.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, attributes: newAttrs } } : n
            ));
          }}
          onBlur={(e) => {
            // Chỉ sync SQL khi blur (tránh flood updates)
            commitField('attributes', e.target.value.split('\n'));
          }}
          onKeyDown={(e) => {
            // Ctrl+Enter hoặc Shift+Enter để commit sớm
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              commitField('attributes', e.target.value.split('\n'));
              e.target.blur();
            }
          }}
        />
      </div>

      {/* Methods textarea */}
      <div className={`p-2 border-t-2 bg-white flex-1 rounded-b-xl ${selected ? THEME.borderAccent : 'border-slate-300'}`}>
        <textarea
          placeholder="+ methods()"
          className="w-full text-[12px] border-none outline-none resize-none leading-relaxed overflow-hidden bg-transparent"
          value={data.methods?.join('\n') || ''}
          rows={Math.max(1, data.methods?.length || 1)}
          onChange={(e) => {
            const newMethods = e.target.value.split('\n');
            setNodes((nds) => nds.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, methods: newMethods } } : n
            ));
          }}
          onBlur={(e) => {
            commitField('methods', e.target.value.split('\n'));
          }}
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