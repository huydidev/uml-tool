// src/apps/workspace/components/canvas/EditorCanvas.jsx

import { useRef, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  ConnectionMode,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import UMLClassNode from './UMLClassNode';
import { edgeTypes } from './UMLEdges';
import EditorToolbox from './EditorToolbox';

const nodeTypes = { umlClass: UMLClassNode };

function getBestHandleId(sourceNode, targetNode) {
  if (!sourceNode || !targetNode) return { sourceHandle: null, targetHandle: null };

  const sx = sourceNode.position.x + (sourceNode.width  ?? 180) / 2;
  const sy = sourceNode.position.y + (sourceNode.height ?? 120) / 2;
  const tx = targetNode.position.x + (targetNode.width  ?? 180) / 2;
  const ty = targetNode.position.y + (targetNode.height ?? 120) / 2;

  const dx = tx - sx;
  const dy = ty - sy;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0
      ? { sourceHandle: 'right', targetHandle: 'left' }
      : { sourceHandle: 'left',  targetHandle: 'right' };
  } else {
    return dy > 0
      ? { sourceHandle: 'bottom', targetHandle: 'top' }
      : { sourceHandle: 'top',    targetHandle: 'bottom' };
  }
}

export default function EditorCanvas({
  nodes, edges,
  setNodes, setEdges,
  selectedEdgeType, onEdgeTypeChange,
  onNodeClick, onPaneClick,
  onAddNode,
  onDeleteNode,
  onEdgeConnect,
  onEdgesDelete,
  onNodeDragStop: onNodeDragStopProp,   // ← notify EditorPage để update position cache
  broadcastNodeMove, broadcastEdgeAdd,
  broadcastEdgeDelete, broadcastNodeDelete,
  viewMode, onViewModeChange,
}) {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition, getNodes } = useReactFlow();

  const onNodesChange = useCallback(
    (chs) => setNodes((nds) => applyNodeChanges(chs, nds)), [setNodes]
  );

  // onEdgesChange: detect remove → gọi onEdgesDelete để sync SQL
  const onEdgesChange = useCallback((chs) => {
    const removals = chs.filter(c => c.type === 'remove');
    if (removals.length && onEdgesDelete) {
      // Lấy edge objects trước khi apply changes
      setEdges(eds => {
        const deleted = removals.map(c => eds.find(e => e.id === c.id)).filter(Boolean);
        if (deleted.length) onEdgesDelete(deleted);
        return applyEdgeChanges(chs, eds);
      });
      return;
    }
    setEdges((eds) => applyEdgeChanges(chs, eds));
  }, [setEdges, onEdgesDelete]);

  const onConnect = useCallback((params) => {
    const allNodes = getNodes();
    const sourceNode = allNodes.find(n => n.id === params.source);
    const targetNode = allNodes.find(n => n.id === params.target);
    const { sourceHandle, targetHandle } = getBestHandleId(sourceNode, targetNode);

    const newEdge = {
      ...params,
      id: 'edge_' + Math.random().toString(36).slice(2, 9),
      sourceHandle,
      targetHandle,
      type: selectedEdgeType,
      ...(selectedEdgeType === 'association' && {
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16, height: 16,
          color: '#1e293b',
        },
      }),
    };

    // Thêm vào ReactFlow state
    setEdges(eds => addEdge(newEdge, eds));

    // Sync sang SQL editor
    onEdgeConnect?.(newEdge);
    broadcastEdgeAdd?.(newEdge);
  }, [selectedEdgeType, setEdges, onEdgeConnect, broadcastEdgeAdd, getNodes]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow-type');
    if (!type) return;
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    onAddNode({
      id: `node-${Date.now()}`,
      type,
      position,
      data: { label: 'NEW_CLASS', attributes: ['- id: uuid'], methods: [] },
    });
  }, [screenToFlowPosition, onAddNode]);

  const onNodeDragStop = useCallback((_, node) => {
    onNodeDragStopProp?.(node.id, node.position);   // sync position cache
    broadcastNodeMove?.(node.id, node.position);
  }, [onNodeDragStopProp, broadcastNodeMove]);

  const onNodeDrag = useCallback((_, draggedNode) => {
    setEdges(eds =>
      eds.map(edge => {
        if (edge.source !== draggedNode.id && edge.target !== draggedNode.id) return edge;
        const allNodes = getNodes();
        const src = edge.source === draggedNode.id ? draggedNode : allNodes.find(n => n.id === edge.source);
        const tgt = edge.target === draggedNode.id ? draggedNode : allNodes.find(n => n.id === edge.target);
        if (!src || !tgt) return edge;
        const { sourceHandle, targetHandle } = getBestHandleId(src, tgt);
        return { ...edge, sourceHandle, targetHandle };
      })
    );
  }, [setEdges, getNodes]);

  const onReconnect = useCallback((oldEdge, newConnection) => {
    setEdges(eds => eds.map(e => e.id === oldEdge.id ? { ...e, ...newConnection } : e));
  }, [setEdges]);

  const handleNodesDelete = useCallback((deleted) => {
    deleted.forEach(n => {
      onDeleteNode?.(n.id);
      broadcastNodeDelete?.(n.id);
    });
  }, [onDeleteNode, broadcastNodeDelete]);

  const handleEdgesDelete = useCallback((deleted) => {
    // onEdgesDelete đã được xử lý qua onEdgesChange (detect remove)
    // Đây chỉ để broadcast nếu cần
    deleted.forEach(e => broadcastEdgeDelete?.(e.id));
  }, [broadcastEdgeDelete]);

  return (
    <div className="flex-1 relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onEdgesDelete={handleEdgesDelete}
        onNodesDelete={handleNodesDelete}
        onReconnect={onReconnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        reconnectable={true}
        fitView
        deleteKeyCode="Delete"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#94a3b8" gap={24} variant="dots" size={1.5} />
      </ReactFlow>

      <EditorToolbox
        selectedEdgeType={selectedEdgeType}
        onEdgeTypeChange={onEdgeTypeChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />
    </div>
  );
}