// src/apps/workspace/pages/EditorPage.jsx
// File chính — gọn lại chỉ còn compose

import { useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import { THEME } from "../../../shared/constants/theme";
import { useDiagramStore } from "../../../shared/store/diagramStore";

import EditorHeader from "../components/layout/EditorHeader";
import EditorCanvas from "../components/canvas/EditorCanvas";
import SidePanel from "../components/layout/SidePanel";
import EditorModals from "./editor/EditorModals";
import EditorRightPanel from "./editor/EditorRightPanel";

import { useEditorState } from "./editor/useEditorState";

function EditorInner() {
  const s = useEditorState();

  const nodes = useDiagramStore((state) => state.nodes);
  const undoStack = useDiagramStore((state) => state.undoStack);
  const redoStack = useDiagramStore((state) => state.redoStack);

  // Nodes với callback
  const nodesWithCallback = nodes.map((n) => ({
    ...n,
    data: { ...n.data, onUpdate: s.handleNodeUpdateRef.current },
  }));

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "s") {
        e.preventDefault();
        s.handleSaveClick();
        return;
      }
      if (ctrl && e.key === "h") {
        e.preventDefault();
        s.setHistoryModalOpen((v) => !v);
        return;
      }
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        s.store().undo();
        s.scheduleAutoSave();
      }
      if (ctrl && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        s.store().redo();
        s.scheduleAutoSave();
      }
      if (e.key === "Escape") {
        s.handlePaneClick();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [s.handleSaveClick, s.scheduleAutoSave]);

  // Save status label
  const saveStatusLabel =
    {
      saving: { text: "⏳ Saving...", color: THEME.textSecondary },
      saved: { text: "✓ Saved", color: THEME.accentSuccess },
      error: { text: "✕ Lỗi lưu", color: THEME.accentDanger },
      locked: { text: "🔒 Hết hạn nộp", color: THEME.accentDanger },
    }[s.saveStatus] ??
    (s.isDirty ? { text: "● Unsaved", color: THEME.accentWarning } : null);

  if (s.loading) {
    return (
      <div
        className={`w-screen h-screen flex items-center justify-center ${THEME.bgApp}`}
      >
        <p className={`text-sm ${THEME.textSecondary}`}>Đang tải diagram...</p>
      </div>
    );
  }

  return (
    <div
      className={`w-screen h-screen flex flex-col overflow-hidden ${THEME.bgApp}`}
    >
      {/* Header */}
      <EditorHeader
        onSave={s.handleSaveClick}
        onOpenShare={() => s.setShareModalOpen(true)}
        onExport={s.handleExport}
        onOpenHistory={() => s.setHistoryModalOpen((v) => !v)}
        diagramTitle={s.diagramTitle || "Untitled Diagram"}
        saveStatusLabel={saveStatusLabel}
        isShared={false}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={() => {
          s.store().undo();
          s.scheduleAutoSave();
        }}
        onRedo={() => {
          s.store().redo();
          s.scheduleAutoSave();
        }}
        currentUserId={s.currentUserId}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: SQL Panel */}
        <SidePanel
          onSyncToCanvas={s.handleSyncToCanvas}
          sqlPanelRef={s.sqlPanelRef}
        />

        {/* Center: Canvas */}
        <EditorCanvas
          nodes={nodesWithCallback}
          edges={s.edges}
          setNodes={(fn) => s.store().setNodes(fn)}
          setEdges={(fn) => s.store().setEdges(fn)}
          selectedEdgeType={s.selectedEdgeType}
          onEdgeTypeChange={s.setSelectedEdgeType}
          onNodeClick={s.handleNodeClick}
          onPaneClick={s.handlePaneClick}
          onAddNode={s.handleAddNode}
          onDeleteNode={s.handleDeleteNode}
          onEdgeConnect={s.handleEdgeConnect}
          onEdgesDelete={s.handleEdgesDelete}
          onNodeDragStart={s.handleNodeDragStart}
          onNodeDragStop={s.handleNodeDragStop}
          onCursorMove={s.broadcastCursor}
          onEdgeClick={s.handleEdgeClick}
          viewMode={s.viewMode}
          onViewModeChange={s.handleViewModeChange}
          currentUserId={s.currentUserId}
          canvasBackground={s.canvasBackground}
          onBackgroundChange={s.setCanvasBackground}
          showMinimap={s.showMinimap}
          onMinimapToggle={() => s.setShowMinimap((v) => !v)}
        />

        {/* Right: Edge / Node panel */}
        <EditorRightPanel
          selectedEdge={s.selectedEdge}
          selectedNode={s.selectedNode}
          onEdgeUpdate={s.handleEdgeUpdate}
          onEdgeDelete={s.handleEdgeDeleteFromPanel}
          onNodeUpdate={s.handleNodeUpdate}
          onNodeClose={s.handlePaneClick}
          diagramId={s.diagramId}
          comments={s.comments}
          commentsLoading={s.commentsLoading}
          currentUserId={s.currentUserId}
          onAddComment={s.addComment}
          onResolveComment={s.resolveComment}
          onDeleteComment={s.deleteComment}
        />
      </div>

      {/* Modals */}
      <EditorModals
        saveModalOpen={s.saveModalOpen}
        onCloseSave={() => s.setSaveModalOpen(false)}
        onSave={(title) => {
          s.doManualSave(title);
          s.setSaveModalOpen(false);
        }}
        shareModalOpen={s.shareModalOpen}
        onCloseShare={() => s.setShareModalOpen(false)}
        diagramId={s.diagramId}
        historyModalOpen={s.historyModalOpen}
        onCloseHistory={() => s.setHistoryModalOpen(false)}
        onRestore={s.handleRestoreVersion}
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
