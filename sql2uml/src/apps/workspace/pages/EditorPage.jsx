// src/apps/workspace/pages/EditorPage.jsx

import { useState, useCallback, useRef, useEffect } from 'react';
import { ReactFlowProvider, useReactFlow } from 'reactflow';
import { THEME } from '../../../shared/constants/theme';
import EditorHeader     from '../components/layout/EditorHeader';
import EditorCanvas     from '../components/canvas/EditorCanvas';
import SidePanel        from '../components/layout/SidePanel';
import SaveDiagramModal from '../components/modals/SaveDiagramModal';
import ShareModal       from '../components/modals/ShareModal';

const STORAGE_KEY = 'uml_diagram';

// Tự động sắp xếp node mới theo grid nếu chưa có position
function autoLayout(parsedNodes, existingNodes) {
  const COLS = 3;
  const GAP_X = 280;
  const GAP_Y = 260;
  const START_X = 80;
  const START_Y = 80;

  return parsedNodes.map((parsed, i) => {
    // Giữ nguyên position nếu node đã tồn tại trên canvas
    const existing = existingNodes.find(n => n.data.label === parsed.data.label);
    if (existing) {
      return {
        ...parsed,
        id:       existing.id,
        position: existing.position,
        type:     'umlClass',
      };
    }
    // Node mới → đặt theo grid
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    return {
      ...parsed,
      type: 'umlClass',
      position: {
        x: START_X + col * GAP_X,
        y: START_Y + row * GAP_Y,
      },
    };
  });
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function EditorInner() {
  useReactFlow();

  const saved = loadSaved();
  const [nodes, setNodes]                       = useState(saved?.nodes ?? []);
  const [edges, setEdges]                       = useState(saved?.edges ?? []);
  const [diagramTitle, setDiagramTitle]         = useState(saved?.title ?? '');
  const [selectedEdgeType, setSelectedEdgeType] = useState('association');
  const [saveModalOpen, setSaveModalOpen]       = useState(false);
  const [shareModalOpen, setShareModalOpen]     = useState(false);
  const [selectedNode, setSelectedNode]         = useState(null);
  const [viewMode, setViewMode]                 = useState('class');
  const [saveStatus, setSaveStatus]             = useState('');

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, viewMode: mode } })));
  }, []);

  const handleNodeClick = useCallback((_, node) => setSelectedNode(node), []);
  const handlePaneClick = useCallback(() => setSelectedNode(null), []);

  // Canvas vẫn cho kéo di chuyển node, resize — chỉ không sync data ngược lại SQL
  const handleNodeUpdate = useCallback((nodeId, newData) => {
    setNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
    ));
    setSelectedNode(prev =>
      prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...newData } } : prev
    );
  }, []);

  // ── SQL → Canvas (source of truth) ──────────────────────────────
  // Gọi mỗi khi SQL thay đổi, replace hoàn toàn nodes/edges
  const handleSyncToCanvas = useCallback((parsedNodes, parsedEdges) => {
    if (parsedNodes.length === 0) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      return;
    }

    // Giữ position của node đã có, auto layout node mới
    const laidOut = autoLayout(parsedNodes, nodesRef.current).map(n => ({
      ...n,
      data: { ...n.data, viewMode },
    }));

    // Map edge: parsedNode id → real id
    const idMap = {};
    parsedNodes.forEach((pn, i) => { idMap[pn.id] = laidOut[i].id; });

    const mappedEdges = (parsedEdges || []).map(e => ({
      ...e,
      id:     `edge-${e.source}-${e.target}`,
      source: idMap[e.source] ?? e.source,
      target: idMap[e.target] ?? e.target,
      type:   selectedEdgeType,
    }));

    setNodes(laidOut);
    setEdges(mappedEdges);
    setSelectedNode(null);
  }, [viewMode, selectedEdgeType]);

  // ── Save ─────────────────────────────────────────────────────────
  const doSave = useCallback((title) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        title,
        nodes: nodesRef.current,
        edges: edgesRef.current,
      }));
      setDiagramTitle(title);
      setSaveStatus('saved');
    } catch (_) {
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus(''), 2000);
    }
  }, []);

  const handleSaveClick = useCallback(() => {
    if (!diagramTitle) setSaveModalOpen(true);
    else doSave(diagramTitle);
  }, [diagramTitle, doSave]);

  const saveStatusLabel = {
    saved: { text: '✓ Đã lưu', color: THEME.accentSuccess },
    error: { text: '✕ Lỗi',    color: THEME.accentDanger },
  }[saveStatus];

  return (
    <div className={`w-screen h-screen flex flex-col overflow-hidden ${THEME.bgApp}`}>
      <EditorHeader
        onSave={handleSaveClick}
        onOpenShare={() => setShareModalOpen(true)}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        diagramTitle={diagramTitle || 'Untitled Diagram'}
        saveStatusLabel={saveStatusLabel}
        isShared={false}
      />

      <div className="flex flex-1 overflow-hidden">
        <SidePanel
          nodes={nodes}
          edges={edges}
          selectedNode={selectedNode}
          onCloseNode={() => setSelectedNode(null)}
          onNodeUpdate={handleNodeUpdate}
          onSyncToCanvas={handleSyncToCanvas}
        />

        <EditorCanvas
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          selectedEdgeType={selectedEdgeType}
          onEdgeTypeChange={setSelectedEdgeType}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          onAddNode={null}       // toolbox kéo vào không dùng nữa
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
      </div>

      <SaveDiagramModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSave={(title) => { doSave(title); setSaveModalOpen(false); }}
      />
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        diagramId={null}
        shareLink={null}
      />
    </div>
  );
}

export default function EditorPage() {
  return (
    <ReactFlowProvider>
      <EditorInner />
    </ReactFlowProvider>
  );
}