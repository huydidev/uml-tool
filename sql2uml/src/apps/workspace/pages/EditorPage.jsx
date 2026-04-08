// src/apps/workspace/pages/EditorPage.jsx
// Commit 10: Thêm VersionHistoryPanel + ShareModal kết nối API thật

import { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlowProvider, useReactFlow } from 'reactflow';
import { useParams, useNavigate } from 'react-router-dom';
import { THEME } from '../../../shared/constants/theme';
import { useDiagramStore } from '../../../shared/store/diagramStore';
import { useCollab } from '../hooks/useCollab';
import EditorHeader          from '../components/layout/EditorHeader';
import EditorCanvas          from '../components/canvas/EditorCanvas';
import SidePanel             from '../components/layout/SidePanel';
import SaveDiagramModal      from '../components/modals/SaveDiagramModal';
import ShareModal            from '../components/modals/ShareModal';
import VersionHistoryPanel   from '../components/modals/VersionHistoryPanel';
import { nodeToSQL, genTableId } from '../../../shared/utils/Sqlparser';
import { useExport } from '../hooks/useExport';

// ── position cache ────────────────────────────────────────────────────
const POSITIONS_KEY = 'uml_positions';
function loadPositions() {
  try { return JSON.parse(localStorage.getItem(POSITIONS_KEY) ?? '{}'); } catch { return {}; }
}
function savePositions(posMap) {
  try { localStorage.setItem(POSITIONS_KEY, JSON.stringify(posMap)); } catch {}
}

// ── Convert API ↔ ReactFlow ───────────────────────────────────────────
function apiNodesToFlow(apiNodes = [], viewMode = 'class') {
  return apiNodes.map(n => ({
    id:       n.id,
    type:     n.type || 'umlClass',
    position: { x: n.x ?? 0, y: n.y ?? 0 },
    width:    n.width,
    height:   n.height,
    data: {
      label:      n.label || 'TABLE',
      tableName:  (n.label || 'table').toLowerCase().replace(/[^a-z0-9]/g, '_'),
      tableId:    n.id,
      attributes: (n.attributes || []).map(a =>
        typeof a === 'string' ? a
          : `${a.isPK ? '+' : '-'} ${a.name}: ${(a.type || 'string').toLowerCase()}`
      ),
      methods:  [],
      viewMode,
    },
  }));
}

function apiEdgesToFlow(apiEdges = []) {
  return apiEdges.map(e => ({
    id:     e.id,
    source: e.from,
    target: e.to,
    type:   'association',
    label:  e.label || '',
    data:   { cardinality: e.cardinality, points: e.points },
  }));
}

function flowNodesToApi(nodes = []) {
  return nodes.map(n => ({
    id:         n.id,
    type:       n.type || 'umlClass',
    label:      n.data.label,
    x:          n.position?.x ?? 0,
    y:          n.position?.y ?? 0,
    width:      n.width  ?? 180,
    height:     n.height ?? 120,
    attributes: (n.data.attributes || [])
      .filter(a => a.trim())
      .map((a, i) => {
        const clean = a.replace(/^[-+#~]\s*/, '');
        const [name, type] = clean.split(':').map(s => s.trim());
        return {
          id:   `attr_${i}`,
          name: name || 'field',
          type: type || 'VARCHAR(255)',
          isPK: name?.toLowerCase() === 'id',
        };
      }),
  }));
}

function flowEdgesToApi(edges = []) {
  return edges.map(e => ({
    id:          e.id,
    from:        e.source,
    to:          e.target,
    label:       e.label || '',
    cardinality: e.data?.cardinality || '',
    points:      e.data?.points || [],
  }));
}

// Strip các field UI-only trước khi gửi API
function stripUIFields(nodes = []) {
  return nodes.map(n => {
    const { onUpdate, lockedBy, lockedColor, currentUserId, ...rest } = n.data;
    return { ...n, data: rest };
  });
}

// ─────────────────────────────────────────────────────────────────────

function EditorInner() {
  useReactFlow();
  const { id }   = useParams();
  const navigate = useNavigate();
  const token    = localStorage.getItem('token');

  const currentUserId = (() => {
    try { return JSON.parse(localStorage.getItem('user'))?.email || null; } catch { return null; }
  })();

  // ── Zustand ──────────────────────────────────────────────────────
  const nodes        = useDiagramStore(s => s.nodes);
  const edges        = useDiagramStore(s => s.edges);
  const diagramId    = useDiagramStore(s => s.diagramId);
  const diagramTitle = useDiagramStore(s => s.diagramTitle);
  const isDirty      = useDiagramStore(s => s.isDirty);
  const undoStack    = useDiagramStore(s => s.undoStack);
  const redoStack    = useDiagramStore(s => s.redoStack);
  const store        = useDiagramStore.getState;

  // ── Collab ────────────────────────────────────────────────────────
  const { handleExport } = useExport({ nodes, edges, diagramTitle });

  const { broadcastState, acquireLock, releaseLock, broadcastCursor } = useCollab({
    diagramId: id || null,
    enabled:   !!id,
  });

  // ── Local UI state ───────────────────────────────────────────────
  const [selectedEdgeType, setSelectedEdgeType]   = useState('association');
  const [saveModalOpen, setSaveModalOpen]         = useState(false);
  const [shareModalOpen, setShareModalOpen]       = useState(false);
  const [historyModalOpen, setHistoryModalOpen]   = useState(false);
  const [selectedNode, setSelectedNode]           = useState(null);
  const [viewMode, setViewMode]                   = useState('class');
  const [saveStatus, setSaveStatus]               = useState('');
  const [loading, setLoading]                     = useState(true);

  const nodesRef         = useRef(nodes);
  const edgesRef         = useRef(edges);
  const diagramIdRef     = useRef(diagramId);
  const sqlPanelRef      = useRef(null);
  const positionCacheRef = useRef(loadPositions());
  const autoSaveTimer    = useRef(null);

  useEffect(() => { nodesRef.current     = nodes;     }, [nodes]);
  useEffect(() => { edgesRef.current     = edges;     }, [edges]);
  useEffect(() => { diagramIdRef.current = diagramId; }, [diagramId]);

  useEffect(() => () => {
    clearTimeout(autoSaveTimer.current);
    store().reset();
  }, []);

  // ── Load / tạo mới ───────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      store().reset();
      try {
        if (id) {
          const res = await fetch(`/api/diagrams/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.status === 401) { navigate('/auth'); return; }
          if (res.status === 403) { navigate('/?error=forbidden'); return; }
          if (!res.ok) throw new Error();

          const data = await res.json();
          store().setDiagramTitle(data.title || '');
          store().setDiagramId(data.id);

          const flowNodes = apiNodesToFlow(data.nodes || [], viewMode);
          const flowEdges = apiEdgesToFlow(data.edges || []);
          store().loadDiagram(flowNodes, flowEdges);

          const posMap = {};
          flowNodes.forEach(n => { posMap[n.id] = n.position; });
          positionCacheRef.current = posMap;
        } else {
          const res = await fetch('/api/diagrams', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ title: 'Untitled Diagram', description: '', nodes: [], edges: [] }),
          });
          if (!res.ok) throw new Error();
          const data = await res.json();
          navigate(`/editor/${data.id}`, { replace: true });
          return;
        }
      } catch (e) {
        console.error(e);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => () => clearTimeout(autoSaveTimer.current), []);

  // ── Auto-save ────────────────────────────────────────────────────
  const scheduleAutoSave = useCallback(() => {
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      const currentId = diagramIdRef.current;
      if (!currentId) return;
      setSaveStatus('saving');
      try {
        const res = await fetch(`/api/diagrams/${currentId}`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            nodes: flowNodesToApi(stripUIFields(nodesRef.current)),
            edges: flowEdgesToApi(edgesRef.current),
          }),
        });
        if (!res.ok) throw new Error();
        setSaveStatus('saved');
        store().markClean();
      } catch {
        setSaveStatus('error');
      }
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1500);
  }, [token]);

  // ── Save thủ công ────────────────────────────────────────────────
  const doManualSave = useCallback(async (title) => {
    const currentId = diagramIdRef.current;
    if (!currentId) return;
    clearTimeout(autoSaveTimer.current);
    setSaveStatus('saving');
    try {
      await fetch(`/api/diagrams/${currentId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          nodes: flowNodesToApi(stripUIFields(nodesRef.current)),
          edges: flowEdgesToApi(edgesRef.current),
        }),
      });
      await fetch(
        `/api/diagrams/${currentId}/versions?label=${encodeURIComponent(title)}`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      store().setDiagramTitle(title);
      setSaveStatus('saved');
      store().markClean();
    } catch {
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus(''), 2000);
  }, [token]);

  const handleSaveClick = useCallback(() => {
    if (!diagramTitle) setSaveModalOpen(true);
    else doManualSave(diagramTitle);
  }, [diagramTitle, doManualSave]);

  // ── Restore version ───────────────────────────────────────────────
  // Server trả về diagram state tại version đó → apply lên canvas
  const handleRestoreVersion = useCallback((restoredDiagram) => {
    const flowNodes = apiNodesToFlow(restoredDiagram.nodes || [], viewMode);
    const flowEdges = apiEdgesToFlow(restoredDiagram.edges || []);
    store().pushUndo();
    store().loadDiagram(flowNodes, flowEdges);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(''), 2000);
  }, [viewMode]);

  // ── Keyboard shortcuts ────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 's') { e.preventDefault(); handleSaveClick(); return; }
      if (ctrl && e.key === 'h') { e.preventDefault(); setHistoryModalOpen(v => !v); return; }
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); store().undo(); scheduleAutoSave();
      }
      if (ctrl && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault(); store().redo(); scheduleAutoSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSaveClick, scheduleAutoSave]);

  // ── handleNodeUpdate ─────────────────────────────────────────────
  const handleNodeUpdateRef = useRef(null);

  const handleNodeUpdate = useCallback((nodeId, newData) => {
    store().setNodes(nds => nds.map(n => {
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

    scheduleAutoSave();
    setTimeout(() => {
      broadcastState(
        flowNodesToApi(stripUIFields(nodesRef.current)),
        flowEdgesToApi(edgesRef.current)
      );
    }, 0);
  }, [scheduleAutoSave, broadcastState]);

  handleNodeUpdateRef.current = handleNodeUpdate;

  const nodesWithCallback = nodes.map(n => ({
    ...n,
    data: { ...n.data, onUpdate: handleNodeUpdateRef.current },
  }));

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    store().setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, viewMode: mode } })));
  }, []);

  const handleNodeClick = useCallback((_, node) => setSelectedNode(node), []);
  const handlePaneClick = useCallback(() => setSelectedNode(null), []);

  const handleAddNode = useCallback((newNode) => {
    store().pushUndo();
    const tableId   = genTableId();
    const tableName = newNode.data.label?.toLowerCase().replace(/[^a-z0-9]/g, '_') ?? 'new_table';
    const node = { ...newNode, id: tableId, data: { ...newNode.data, viewMode, tableId, tableName } };
    positionCacheRef.current[tableId] = newNode.position;
    savePositions(positionCacheRef.current);
    store().setNodes(nds => [...nds, node]);
    sqlPanelRef.current?.appendBlock(nodeToSQL(node));
    scheduleAutoSave();
    setTimeout(() => broadcastState(
      flowNodesToApi(stripUIFields([...nodesRef.current, node])),
      flowEdgesToApi(edgesRef.current)
    ), 0);
  }, [viewMode, scheduleAutoSave, broadcastState]);

  const handleDeleteNode = useCallback((nodeId) => {
    store().pushUndo();
    const node = nodesRef.current.find(n => n.id === nodeId);
    if (node) {
      sqlPanelRef.current?.removeNode(node.data.tableId || nodeId);
      delete positionCacheRef.current[node.data.tableId || nodeId];
      savePositions(positionCacheRef.current);
    }
    const related = edgesRef.current.filter(e => e.source === nodeId || e.target === nodeId);
    for (const e of related) sqlPanelRef.current?.removeRelation(e, nodesRef.current);
    store().setNodes(nds => nds.filter(n => n.id !== nodeId));
    store().setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(prev => prev?.id === nodeId ? null : prev);
    scheduleAutoSave();
    setTimeout(() => broadcastState(
      flowNodesToApi(stripUIFields(nodesRef.current.filter(n => n.id !== nodeId))),
      flowEdgesToApi(edgesRef.current.filter(e => e.source !== nodeId && e.target !== nodeId))
    ), 50);
  }, [scheduleAutoSave, broadcastState]);

  const handleNodeDragStart = useCallback((_, node) => {
    acquireLock(node.id);
  }, [acquireLock]);

  const handleNodeDragStop = useCallback((nodeId, position) => {
    releaseLock(nodeId);
    store().pushUndo();
    positionCacheRef.current[nodeId] = position;
    savePositions(positionCacheRef.current);
    sqlPanelRef.current?.updateNodePosition(nodeId, position);
    scheduleAutoSave();
    setTimeout(() => broadcastState(
      flowNodesToApi(stripUIFields(nodesRef.current)),
      flowEdgesToApi(edgesRef.current)
    ), 0);
  }, [releaseLock, scheduleAutoSave, broadcastState]);

  const handleEdgeConnect = useCallback((newEdge) => {
    store().pushUndo();
    store().setEdges(eds => {
      const updated = [...eds, newEdge];
      edgesRef.current = updated;
      setTimeout(() => sqlPanelRef.current?.upsertRelation(newEdge, nodesRef.current), 0);
      return updated;
    });
    scheduleAutoSave();
    setTimeout(() => broadcastState(
      flowNodesToApi(stripUIFields(nodesRef.current)),
      flowEdgesToApi([...edgesRef.current, newEdge])
    ), 0);
  }, [scheduleAutoSave, broadcastState]);

  const handleEdgesDelete = useCallback((deletedEdges) => {
    store().pushUndo();
    for (const edge of deletedEdges) sqlPanelRef.current?.removeRelation(edge, nodesRef.current);
    store().setEdges(eds => eds.filter(e => !deletedEdges.find(d => d.id === e.id)));
    scheduleAutoSave();
    setTimeout(() => broadcastState(
      flowNodesToApi(stripUIFields(nodesRef.current)),
      flowEdgesToApi(edgesRef.current.filter(e => !deletedEdges.find(d => d.id === e.id)))
    ), 0);
  }, [scheduleAutoSave, broadcastState]);

  const handleSyncToCanvas = useCallback((parsedNodes, parsedEdges) => {
    if (parsedNodes.length === 0) {
      store().setNodes([]); store().setEdges([]); setSelectedNode(null);
      return;
    }
    const withMode = parsedNodes.map(n => ({
      ...n,
      data:     { ...n.data, viewMode },
      position: n.position ?? positionCacheRef.current[n.id] ?? n.position,
    }));
    const idSet = new Set(withMode.map(n => n.id));
    store().setNodes(withMode);
    store().setEdges((parsedEdges || []).filter(e => idSet.has(e.source) && idSet.has(e.target)));
    scheduleAutoSave();
  }, [viewMode, scheduleAutoSave]);

  const saveStatusLabel = {
    saving: { text: '⏳ Saving...',  color: THEME.textSecondary },
    saved:  { text: '✓ Saved',       color: THEME.accentSuccess  },
    error:  { text: '✕ Lỗi lưu',    color: THEME.accentDanger   },
  }[saveStatus] ?? (isDirty ? { text: '● Unsaved', color: THEME.accentWarning } : null);

  if (loading) {
    return (
      <div className={`w-screen h-screen flex items-center justify-center ${THEME.bgApp}`}>
        <p className={`text-sm ${THEME.textSecondary}`}>Đang tải diagram...</p>
      </div>
    );
  }

  return (
    <div className={`w-screen h-screen flex flex-col overflow-hidden ${THEME.bgApp}`}>
      <EditorHeader
        onSave={handleSaveClick}
        onOpenShare={() => setShareModalOpen(true)}
        onExport={handleExport}
        onOpenHistory={() => setHistoryModalOpen(true)}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        diagramTitle={diagramTitle || 'Untitled Diagram'}
        saveStatusLabel={saveStatusLabel}
        isShared={false}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={() => { store().undo(); scheduleAutoSave(); }}
        onRedo={() => { store().redo(); scheduleAutoSave(); }}
        currentUserId={currentUserId}
      />
      <div className="flex flex-1 overflow-hidden">
        <SidePanel onSyncToCanvas={handleSyncToCanvas} sqlPanelRef={sqlPanelRef} />
        <EditorCanvas
          nodes={nodesWithCallback}
          edges={edges}
          setNodes={(fn) => store().setNodes(fn)}
          setEdges={(fn) => store().setEdges(fn)}
          selectedEdgeType={selectedEdgeType}
          onEdgeTypeChange={setSelectedEdgeType}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
          onEdgeConnect={handleEdgeConnect}
          onEdgesDelete={handleEdgesDelete}
          onNodeDragStart={handleNodeDragStart}
          onNodeDragStop={handleNodeDragStop}
          onCursorMove={broadcastCursor}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          currentUserId={currentUserId}
        />
      </div>

      <SaveDiagramModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSave={(title) => { doManualSave(title); setSaveModalOpen(false); }}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        diagramId={diagramId}
        shareLink={diagramId ? `${window.location.origin}/shared/${diagramId}` : null}
      />

      <VersionHistoryPanel
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        diagramId={diagramId}
        onRestore={handleRestoreVersion}
      />
    </div>
  );
}

export default function EditorPage() {
  return <ReactFlowProvider><EditorInner /></ReactFlowProvider>;
}