// src/apps/workspace/pages/EditorPage.jsx
// Commit 3: Auto-save debounce 1.5s + Save thủ công → versions + Badge

import { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlowProvider, useReactFlow } from 'reactflow';
import { useParams, useNavigate } from 'react-router-dom';
import { THEME } from '../../../shared/constants/theme';
import EditorHeader     from '../components/layout/EditorHeader';
import EditorCanvas     from '../components/canvas/EditorCanvas';
import SidePanel        from '../components/layout/SidePanel';
import SaveDiagramModal from '../components/modals/SaveDiagramModal';
import ShareModal       from '../components/modals/ShareModal';
import { nodeToSQL, genTableId } from '../../../shared/utils/Sqlparser';

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

// ─────────────────────────────────────────────────────────────────────

function EditorInner() {
  useReactFlow();
  const { id }   = useParams();
  const navigate = useNavigate();
  const token    = localStorage.getItem('token');

  const [nodes, setNodes]                       = useState([]);
  const [edges, setEdges]                       = useState([]);
  const [diagramTitle, setDiagramTitle]         = useState('');
  const [diagramId, setDiagramId]               = useState(id || null);
  const [selectedEdgeType, setSelectedEdgeType] = useState('association');
  const [saveModalOpen, setSaveModalOpen]       = useState(false);
  const [shareModalOpen, setShareModalOpen]     = useState(false);
  const [selectedNode, setSelectedNode]         = useState(null);
  const [viewMode, setViewMode]                 = useState('class');
  const [saveStatus, setSaveStatus]             = useState(''); // '' | 'saving' | 'saved' | 'error'
  const [loading, setLoading]                   = useState(true);
  const [isDirty, setIsDirty]                   = useState(false);

  const nodesRef        = useRef(nodes);
  const edgesRef        = useRef(edges);
  const diagramIdRef    = useRef(diagramId);
  const diagramTitleRef = useRef(diagramTitle);
  const sqlPanelRef     = useRef(null);
  const positionCacheRef = useRef(loadPositions());
  const autoSaveTimer   = useRef(null);

  useEffect(() => { nodesRef.current        = nodes;        }, [nodes]);
  useEffect(() => { edgesRef.current        = edges;        }, [edges]);
  useEffect(() => { diagramIdRef.current    = diagramId;    }, [diagramId]);
  useEffect(() => { diagramTitleRef.current = diagramTitle; }, [diagramTitle]);

  // cleanup debounce khi unmount
  useEffect(() => () => clearTimeout(autoSaveTimer.current), []);

  // ── Load / tạo mới ───────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        if (id) {
          const res = await fetch(`/api/diagrams/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.status === 401) { navigate('/auth'); return; }
          if (!res.ok) throw new Error('Không tải được diagram');

          const data = await res.json();
          setDiagramTitle(data.title || '');
          setDiagramId(data.id);

          const flowNodes = apiNodesToFlow(data.nodes || [], viewMode);
          const flowEdges = apiEdgesToFlow(data.edges || []);
          setNodes(flowNodes);
          setEdges(flowEdges);

          const posMap = {};
          flowNodes.forEach(n => { posMap[n.id] = n.position; });
          positionCacheRef.current = posMap;
        } else {
          const res = await fetch('/api/diagrams', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ title: 'Untitled Diagram', description: '', nodes: [], edges: [] }),
          });
          if (!res.ok) throw new Error('Không tạo được diagram');
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

  // ── Auto-save: PATCH sau 1.5s debounce ───────────────────────────
  const scheduleAutoSave = useCallback(() => {
    setIsDirty(true);
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      const currentId = diagramIdRef.current;
      if (!currentId) return;

      setSaveStatus('saving');
      try {
        const nodesToSave = nodesRef.current.map(n => {
          const { onUpdate, ...rest } = n.data;
          return { ...n, data: rest };
        });
        const res = await fetch(`/api/diagrams/${currentId}`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            nodes: flowNodesToApi(nodesToSave),
            edges: flowEdgesToApi(edgesRef.current),
          }),
        });
        if (!res.ok) throw new Error();
        setSaveStatus('saved');
        setIsDirty(false);
      } catch {
        setSaveStatus('error');
      }
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1500);
  }, [token]);

  // ── Save thủ công: flush + tạo version snapshot ──────────────────
  const doManualSave = useCallback(async (title) => {
    const currentId = diagramIdRef.current;
    if (!currentId) return;

    clearTimeout(autoSaveTimer.current);
    setSaveStatus('saving');

    try {
      // 1. PATCH để đảm bảo state mới nhất lên server
      const nodesToSave = nodesRef.current.map(n => {
        const { onUpdate, ...rest } = n.data;
        return { ...n, data: rest };
      });
      await fetch(`/api/diagrams/${currentId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          nodes: flowNodesToApi(nodesToSave),
          edges: flowEdgesToApi(edgesRef.current),
        }),
      });

      // 2. Tạo version snapshot
      const vRes = await fetch(
        `/api/diagrams/${currentId}/versions?label=${encodeURIComponent(title)}`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!vRes.ok) throw new Error();

      setDiagramTitle(title);
      setSaveStatus('saved');
      setIsDirty(false);
    } catch {
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus(''), 2000);
  }, [token]);

  const handleSaveClick = useCallback(() => {
    if (!diagramTitle) setSaveModalOpen(true);
    else doManualSave(diagramTitle);
  }, [diagramTitle, doManualSave]);

  // ── Ctrl+S / Cmd+S ────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveClick();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSaveClick]);

  // ── handleNodeUpdate ─────────────────────────────────────────────
  const handleNodeUpdateRef = useRef(null);

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

    scheduleAutoSave();
  }, [scheduleAutoSave]);

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

  // ── Add node ─────────────────────────────────────────────────────
  const handleAddNode = useCallback((newNode) => {
    const tableId   = genTableId();
    const tableName = newNode.data.label?.toLowerCase().replace(/[^a-z0-9]/g, '_') ?? 'new_table';
    const node = {
      ...newNode,
      id: tableId,
      data: { ...newNode.data, viewMode, tableId, tableName },
    };
    positionCacheRef.current[tableId] = newNode.position;
    savePositions(positionCacheRef.current);
    setNodes(nds => [...nds, node]);
    sqlPanelRef.current?.appendBlock(nodeToSQL(node));
    scheduleAutoSave();
  }, [viewMode, scheduleAutoSave]);

  // ── Delete node ──────────────────────────────────────────────────
  const handleDeleteNode = useCallback((nodeId) => {
    const node = nodesRef.current.find(n => n.id === nodeId);
    if (node) {
      sqlPanelRef.current?.removeNode(node.data.tableId || nodeId);
      delete positionCacheRef.current[node.data.tableId || nodeId];
      savePositions(positionCacheRef.current);
    }
    const related = edgesRef.current.filter(e => e.source === nodeId || e.target === nodeId);
    for (const e of related) sqlPanelRef.current?.removeRelation(e, nodesRef.current);
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(prev => prev?.id === nodeId ? null : prev);
    scheduleAutoSave();
  }, [scheduleAutoSave]);

  // ── Node drag stop ────────────────────────────────────────────────
  const handleNodeDragStop = useCallback((nodeId, position) => {
    positionCacheRef.current[nodeId] = position;
    savePositions(positionCacheRef.current);
    sqlPanelRef.current?.updateNodePosition(nodeId, position);
    scheduleAutoSave();
  }, [scheduleAutoSave]);

  // ── Edge connect ──────────────────────────────────────────────────
  const handleEdgeConnect = useCallback((newEdge) => {
    setEdges(eds => {
      const updated = [...eds, newEdge];
      edgesRef.current = updated;
      setTimeout(() => sqlPanelRef.current?.upsertRelation(newEdge, nodesRef.current), 0);
      return updated;
    });
    scheduleAutoSave();
  }, [scheduleAutoSave]);

  // ── Edges delete ──────────────────────────────────────────────────
  const handleEdgesDelete = useCallback((deletedEdges) => {
    for (const edge of deletedEdges) sqlPanelRef.current?.removeRelation(edge, nodesRef.current);
    setEdges(eds => eds.filter(e => !deletedEdges.find(d => d.id === e.id)));
    scheduleAutoSave();
  }, [scheduleAutoSave]);

  // ── SQL → Canvas ──────────────────────────────────────────────────
  const handleSyncToCanvas = useCallback((parsedNodes, parsedEdges) => {
    if (parsedNodes.length === 0) {
      setNodes([]); setEdges([]); setSelectedNode(null);
      return;
    }
    const withMode = parsedNodes.map(n => ({
      ...n,
      data:     { ...n.data, viewMode },
      position: n.position ?? positionCacheRef.current[n.id] ?? n.position,
    }));
    const idSet = new Set(withMode.map(n => n.id));
    setNodes(withMode);
    setEdges((parsedEdges || []).filter(e => idSet.has(e.source) && idSet.has(e.target)));
    scheduleAutoSave();
  }, [viewMode, scheduleAutoSave]);

  // ── Badge ─────────────────────────────────────────────────────────
  const saveStatusLabel = {
    saving: { text: '⏳ Saving...',  color: THEME.textSecondary },
    saved:  { text: '✓ Saved',       color: THEME.accentSuccess  },
    error:  { text: '✕ Lỗi lưu',    color: THEME.accentDanger   },
  }[saveStatus] ?? (isDirty ? { text: '● Unsaved', color: THEME.accentWarning } : null);

  // ── Loading ───────────────────────────────────────────────────────
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
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        diagramTitle={diagramTitle || 'Untitled Diagram'}
        saveStatusLabel={saveStatusLabel}
        isShared={false}
      />
      <div className="flex flex-1 overflow-hidden">
        <SidePanel
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
        onSave={(title) => { doManualSave(title); setSaveModalOpen(false); }}
      />
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        diagramId={diagramId}
        shareLink={diagramId ? `${window.location.origin}/shared/${diagramId}` : null}
      />
    </div>
  );
}

export default function EditorPage() {
  return <ReactFlowProvider><EditorInner /></ReactFlowProvider>;
}