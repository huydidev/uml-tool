// src/apps/workspace/components/canvas/EditorCanvas.jsx

import { useRef, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  ConnectionMode,
  Position,
  useReactFlow,
  useStore,
} from 'reactflow';
import 'reactflow/dist/style.css';
import UMLClassNode from './UMLClassNode';
import { edgeTypes } from './UMLEdges';
import EditorToolbox from './EditorToolbox';

const nodeTypes = { umlClass: UMLClassNode };

// Tính handle id tốt nhất dựa vào vị trí 2 node
function getBestHandleId(sourceNode, targetNode) {
  if (!sourceNode || !targetNode) return { sourceHandle: null, targetHandle: null };

  const sw = sourceNode.width  ?? 180;
  const sh = sourceNode.height ?? 120;
  const tw = targetNode.width  ?? 180;
  const th = targetNode.height ?? 120;

  const sx = sourceNode.position.x + sw / 2;
  const sy = sourceNode.position.y + sh / 2;
  const tx = targetNode.position.x + tw / 2;
  const ty = targetNode.position.y + th / 2;

  const dx = tx - sx;
  const dy = ty - sy;

  let sourceHandle, targetHandle;

  if (Math.abs(dx) >= Math.abs(dy)) {
    // Nối ngang — dùng cạnh trái/phải
    if (dx > 0) {
      sourceHandle = 'right';
      targetHandle = 'left';
    } else {
      sourceHandle = 'left';
      targetHandle = 'right';
    }
  } else {
    // Nối dọc — dùng cạnh trên/dưới
    if (dy > 0) {
      sourceHandle = 'bottom';
      targetHandle = 'top';
    } else {
      sourceHandle = 'top';
      targetHandle = 'bottom';
    }
  }

  return { sourceHandle, targetHandle };
}

export default function EditorCanvas({
  nodes, edges,
  setNodes, setEdges,
  selectedEdgeType, onEdgeTypeChange,
  onNodeClick, onPaneClick,
  onAddNode,
  broadcastNodeMove, broadcastEdgeAdd,
  broadcastEdgeDelete, broadcastNodeDelete,
  viewMode, onViewModeChange,
}) {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition, getNodes } = useReactFlow();

  const onNodesChange = useCallback(
    (chs) => setNodes((nds) => applyNodeChanges(chs, nds)), [setNodes]
  );
  const onEdgesChange = useCallback(
    (chs) => setEdges((eds) => applyEdgeChanges(chs, eds)), [setEdges]
  );

  const onConnect = useCallback((params) => {
    // Tính lại handle tốt nhất dựa vào vị trí node lúc connect
    const allNodes = getNodes();
    const sourceNode = allNodes.find((n) => n.id === params.source);
    const targetNode = allNodes.find((n) => n.id === params.target);
    const { sourceHandle, targetHandle } = getBestHandleId(sourceNode, targetNode);

    const newEdge = {
      ...params,
      sourceHandle,
      targetHandle,
      type: selectedEdgeType,
      ...(selectedEdgeType === 'association' && {
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: '#1e293b',
        },
      }),
    };
    setEdges((eds) => addEdge(newEdge, eds));
    broadcastEdgeAdd?.(newEdge);
  }, [selectedEdgeType, setEdges, broadcastEdgeAdd, getNodes]);

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
    broadcastNodeMove?.(node.id, node.position);
  }, [broadcastNodeMove]);

  // Khi kéo node → cập nhật lại sourceHandle/targetHandle của tất cả edges liên quan
  const onNodeDrag = useCallback((_, draggedNode) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.source !== draggedNode.id && edge.target !== draggedNode.id) return edge;
        const allNodes = getNodes();
        const sourceNode = allNodes.find((n) => n.id === edge.source);
        const targetNode = allNodes.find((n) => n.id === edge.target);
        if (!sourceNode || !targetNode) return edge;
        // Cập nhật vị trí draggedNode
        const src = edge.source === draggedNode.id ? draggedNode : sourceNode;
        const tgt = edge.target === draggedNode.id ? draggedNode : targetNode;
        const { sourceHandle, targetHandle } = getBestHandleId(src, tgt);
        return { ...edge, sourceHandle, targetHandle };
      })
    );
  }, [setEdges, getNodes]);

  const onReconnect = useCallback((oldEdge, newConnection) => {
    setEdges((eds) =>
      eds.map((e) => e.id === oldEdge.id ? { ...e, ...newConnection } : e)
    );
  }, [setEdges]);

  const onEdgesDelete = useCallback((deleted) => {
    deleted.forEach((e) => broadcastEdgeDelete?.(e.id));
  }, [broadcastEdgeDelete]);

  const onNodesDelete = useCallback((deleted) => {
    deleted.forEach((n) => broadcastNodeDelete?.(n.id));
  }, [broadcastNodeDelete]);

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
        onEdgesDelete={onEdgesDelete}
        onNodesDelete={onNodesDelete}
        onReconnect={onReconnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        edgesReconnectable={true}
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