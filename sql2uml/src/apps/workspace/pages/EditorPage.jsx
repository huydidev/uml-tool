// src/apps/workspace/pages/EditorPage.jsx

import { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlowProvider, useReactFlow } from 'reactflow';
import { THEME } from '../../../shared/constants/theme';
import EditorHeader     from '../components/layout/EditorHeader';
import EditorCanvas     from '../components/canvas/EditorCanvas';
import SidePanel        from '../components/layout/SidePanel';
import SaveDiagramModal from '../components/modals/SaveDiagramModal';
import ShareModal       from '../components/modals/ShareModal';
import { nodeToSQL, genTableId } from '../../../shared/utils/Sqlparser';

const STORAGE_KEY      = 'uml_diagram';
const POSITIONS_KEY    = 'uml_positions';   // lưu riêng position để không bị mất khi SQL đổi

// ── localStorage helpers ──────────────────────────────────────────────
function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function loadPositions() {
  try {
    const raw = localStorage.getItem(POSITIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {};
}

function savePositions(posMap) {
  try {
    localStorage.setItem(POSITIONS_KEY, JSON.stringify(posMap));
  } catch (_) {}
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

  const nodesRef    = useRef(nodes);
  const edgesRef    = useRef(edges);
  const sqlPanelRef = useRef(null);

  // Position cache: { [tableId]: {x, y} } — persist to localStorage
  const positionCacheRef = useRef(loadPositions());

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  const handleNodeUpdateRef = useRef(null);

  // ── handleNodeUpdate ─────────────────────────────────────────────
  const handleNodeUpdate = useCallback((nodeId, newData) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== nodeId) return n;
      const newLabel     = newData.label     ?? n.data.label;
      const newTableName = newData.tableName
        ?? (newData.label
            ? newData.label.toLowerCase().replace(/[^a-z0-9]/g, '_')
            : n.data.tableName);
      const updated = {
        ...n,
        data: {
          ...n.data, ...newData,
          tableId:   n.data.tableId || n.id,
          tableName: newTableName,
          label:     newLabel,
          onUpdate:  handleNodeUpdateRef.current,
        },
      };
      sqlPanelRef.current?.updateNode(updated);
      return updated;
    }));

    setSelectedNode(prev => {
      if (!prev || prev.id !== nodeId) return prev;
      const newLabel     = newData.label     ?? prev.data.label;
      const newTableName = newData.tableName
        ?? (newData.label
            ? newData.label.toLowerCase().replace(/[^a-z0-9]/g, '_')
            : prev.data.tableName);
      return {
        ...prev,
        data: { ...prev.data, ...newData, tableId: prev.data.tableId || prev.id, tableName: newTableName, label: newLabel },
      };
    });
  }, []);

  handleNodeUpdateRef.current = handleNodeUpdate;

  const nodesWithCallback = nodes.map(n => ({
    ...n,
    data: { ...n.data, onUpdate: handleNodeUpdateRef.current },
  }));

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, viewMode: mode } })));
  }, []);

  const handleNodeClick = useCallback((_, node) => setSelectedNode(node), []);
  const handlePaneClick = useCallback(() => setSelectedNode(null), []);

  // ── Add node từ toolbox ──────────────────────────────────────────
  // KEY FIX: dùng genTableId() (tbl_xxx) thay vì node-timestamp
  // để @id trong SQL và node.id luôn khớp nhau
  const handleAddNode = useCallback((newNode) => {
    const tableId   = genTableId();               // ← luôn là tbl_xxx
    const tableName = newNode.data.label?.toLowerCase().replace(/[^a-z0-9]/g, '_') ?? 'new_table';

    const node = {
      ...newNode,
      id: tableId,                                // ← override id = tableId
      data: {
        ...newNode.data,
        viewMode,
        tableId,
        tableName,
      },
    };

    // Lưu position ban đầu vào cache
    positionCacheRef.current[tableId] = newNode.position;
    savePositions(positionCacheRef.current);

    setNodes(nds => [...nds, node]);
    sqlPanelRef.current?.appendBlock(nodeToSQL(node));
  }, [viewMode]);

  // ── Delete node ──────────────────────────────────────────────────
  const handleDeleteNode = useCallback((nodeId) => {
    const node = nodesRef.current.find(n => n.id === nodeId);
    if (node) {
      const tableId = node.data.tableId || node.id;
      sqlPanelRef.current?.removeNode(tableId);
      delete positionCacheRef.current[tableId];
      savePositions(positionCacheRef.current);
    }

    const relatedEdges = edgesRef.current.filter(
      e => e.source === nodeId || e.target === nodeId
    );
    for (const e of relatedEdges) {
      sqlPanelRef.current?.removeRelation(e, nodesRef.current);
    }

    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(prev => prev?.id === nodeId ? null : prev);
  }, []);

  // ── Node drag stop → persist position ───────────────────────────
  const handleNodeDragStop = useCallback((nodeId, position) => {
    positionCacheRef.current[nodeId] = position;
    savePositions(positionCacheRef.current);
    sqlPanelRef.current?.updateNodePosition(nodeId, position);
  }, []);

  // ── Edge connect → upsert @relation ─────────────────────────────
  const handleEdgeConnect = useCallback((newEdge) => {
    setEdges(eds => {
      const updated = [...eds, newEdge];
      edgesRef.current = updated;
      setTimeout(() => {
        sqlPanelRef.current?.upsertRelation(newEdge, nodesRef.current);
      }, 0);
      return updated;
    });
  }, []);

  // ── Edges delete → remove @relation ─────────────────────────────
  const handleEdgesDelete = useCallback((deletedEdges) => {
    for (const edge of deletedEdges) {
      sqlPanelRef.current?.removeRelation(edge, nodesRef.current);
    }
    setEdges(eds => eds.filter(e => !deletedEdges.find(d => d.id === e.id)));
  }, []);

  // ── SQL → Canvas (từ editor gõ tay) ─────────────────────────────
  // SQLParserPanel tự quản lý positionCache của nó (in-memory).
  // EditorPage chỉ nhận nodes đã có position đúng và set vào state.
  const handleSyncToCanvas = useCallback((parsedNodes, parsedEdges) => {
    if (parsedNodes.length === 0) {
      setNodes([]); setEdges([]); setSelectedNode(null);
      return;
    }
    // Merge với positionCache của EditorPage (ưu tiên SQLParserPanel đã tính)
    const withMode = parsedNodes.map(n => ({
      ...n,
      data: { ...n.data, viewMode },
      // Nếu SQLParserPanel chưa có position cho node này, dùng cache của EditorPage
      position: n.position ?? positionCacheRef.current[n.id] ?? n.position,
    }));
    const idSet = new Set(withMode.map(n => n.id));
    setNodes(withMode);
    setEdges((parsedEdges || []).filter(e => idSet.has(e.source) && idSet.has(e.target)));
  }, [viewMode]);

  // ── Save ─────────────────────────────────────────────────────────
  const doSave = useCallback((title) => {
    try {
      const nodesToSave = nodesRef.current.map(n => {
        const { onUpdate, ...dataRest } = n.data;
        return { ...n, data: dataRest };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        title, nodes: nodesToSave, edges: edgesRef.current,
      }));
      // Cũng persist positions
      savePositions(positionCacheRef.current);
      setDiagramTitle(title);
      setSaveStatus('saved');
    } catch (_) { setSaveStatus('error'); }
    setTimeout(() => setSaveStatus(''), 2000);
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
          sqlPanelRef={sqlPanelRef}
        />
        <EditorCanvas
          nodes={nodesWithCallback}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          selectedEdgeType={selectedEdgeType}
          onEdgeTypeChange={setSelectedEdgeType}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
          onEdgeConnect={handleEdgeConnect}
          onEdgesDelete={handleEdgesDelete}
          onNodeDragStop={handleNodeDragStop}
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
  return <ReactFlowProvider><EditorInner /></ReactFlowProvider>;
}