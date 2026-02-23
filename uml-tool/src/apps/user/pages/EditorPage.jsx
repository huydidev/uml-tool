import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  applyEdgeChanges, 
  applyNodeChanges 
} from 'reactflow';
import 'reactflow/dist/style.css';
import UMLClassNode from '../components/UMLClassNode';

const nodeTypes = { umlClass: UMLClassNode };

export default function EditorPage() {
  const [nodes, setNodes] = useState([
    { 
      id: 'node-1', 
      type: 'umlClass', 
      position: { x: 250, y: 150 }, 
      data: { label: 'STUDENT', attributes: ['id: int'], methods: ['study()'] } 
    }
  ]);
  const [edges, setEdges] = useState([]);

  const onNodesChange = useCallback((chs) => setNodes((nds) => applyNodeChanges(chs, nds)), []);
  const onEdgesChange = useCallback((chs) => setEdges((eds) => applyEdgeChanges(chs, eds)), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds)), []);

  const addClass = () => {
    const id = `node-${Date.now()}`;
    const newNode = {
      id,
      type: 'umlClass',
      position: { x: 100, y: 100 },
      data: { label: 'NEW_CLASS', attributes: [], methods: [] },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const saveToMongo = () => {
    console.log("Dữ liệu gửi lên Spring Boot:", { nodes, edges });
    alert("Đã log dữ liệu ra Console để chuẩn bị kết nối MongoDB!");
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-50">
      {/* Header Toolbar */}
      <div className="h-16 bg-slate-900 text-white flex justify-between items-center px-6 shadow-lg">
        <h1 className="font-black text-xl tracking-widest text-blue-400">UML ARCHITECT</h1>
        <div className="flex gap-3">
          <button onClick={addClass} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md font-bold text-sm transition-all">
            + NEW CLASS
          </button>
          <button onClick={saveToMongo} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-bold text-sm transition-all text-white">
            SAVE TO DB
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#cbd5e1" gap={20} variant="dots" />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}