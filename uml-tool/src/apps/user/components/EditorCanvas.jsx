// src/apps/user/components/EditorCanvas.jsx

import { useRef, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import UMLClassNode from './UMLClassNode';
import { edgeTypes } from './UMLEdges';
import EditorToolbox from './EditorToolbox';
// import CanvasControls from './CanvasControls';
import ClassNode from './ClassNode';


// const nodeTypes = { umlClass: UMLClassNode };
const nodeTypes = { umlClass: ClassNode };

export default function EditorCanvas({
  nodes, edges,
  setNodes, setEdges,
  selectedEdgeType, onEdgeTypeChange,
  onOpenSQLParser,
  onNodeClick, onPaneClick,
  onAddNode,
  broadcastNodeMove, broadcastEdgeAdd,
  broadcastEdgeDelete, broadcastNodeDelete,
  theme,
}) {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const isDark = theme === 'dark';

  const onNodesChange = useCallback(
    (chs) => setNodes((nds) => applyNodeChanges(chs, nds)), [setNodes]
  );
  const onEdgesChange = useCallback(
    (chs) => setEdges((eds) => applyEdgeChanges(chs, eds)), [setEdges]
  );
  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params, type: selectedEdgeType,
      ...(selectedEdgeType === 'association' && {
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '#1e293b' },
      }),
    };
    setEdges((eds) => addEdge(newEdge, eds));
    broadcastEdgeAdd?.(newEdge);
  }, [selectedEdgeType, setEdges, broadcastEdgeAdd]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow-type');
    if (!type) return;
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    onAddNode({ id: `node-${Date.now()}`, type, position, data: { label: 'NEW_CLASS', attributes: ['- id: uuid'], methods: [] } });
  }, [screenToFlowPosition, onAddNode]);

  return (
    <div className="flex-1 relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect} onDrop={onDrop} onDragOver={onDragOver}
        onNodeClick={onNodeClick} onPaneClick={onPaneClick}
        nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        fitView deleteKeyCode="Delete"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color={isDark ? '#334155' : '#cbd5e1'}
          gap={24} variant="dots" size={1.5}
        />
      </ReactFlow>

      {/* SQL Parser button */}
      <button
        onClick={onOpenSQLParser}
        className={`absolute top-4 left-4 z-10 px-3 py-2 rounded-lg text-xs font-bold shadow-lg transition-all flex items-center gap-2 border ${
          isDark
            ? 'bg-violet-600 hover:bg-violet-500 text-white border-violet-500'
            : 'bg-violet-100 hover:bg-violet-200 text-violet-700 border-violet-300'
        }`}
      >
        <span className="text-base leading-none">⚡</span> SQL Parser
      </button>

      {/* Canvas controls (zoom) */}
      {/* <CanvasControls theme={theme} /> */}

      {/* Floating Toolbox */}
      <EditorToolbox
        selectedEdgeType={selectedEdgeType}
        onEdgeTypeChange={onEdgeTypeChange}
        theme={theme}
      />
    </div>
  );
}