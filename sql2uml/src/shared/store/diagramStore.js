// src/shared/store/diagramStore.js
// Zustand store cho diagram state + undo/redo
// Commit 4: thay thế useState local trong EditorPage

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const MAX_HISTORY = 20;

// ── Helper: deep clone nodes/edges để snapshot không bị mutate ────────
function snapshot(nodes, edges) {
  return {
    nodes: JSON.parse(JSON.stringify(nodes)),
    edges: JSON.parse(JSON.stringify(edges)),
  };
}

export const useDiagramStore = create(
  immer((set, get) => ({

    // ── Diagram state ───────────────────────────────────────────────
    nodes:          [],
    edges:          [],
    diagramId:      null,
    diagramTitle:   '',
    isDirty:        false,
    isSaving:       false,
    lastSavedAt:    null,

    // ── Undo / Redo stacks ──────────────────────────────────────────
    undoStack: [],   // [{ nodes, edges }, ...]  max 20
    redoStack: [],

    // ── Collab (Phase 3 — placeholder, dùng sau) ───────────────────
    lockedNodes:  {},   // { [nodeId]: { userId, color } }
    onlineUsers:  {},   // { [userId]: { name, color, cursor: {x,y} } }

    // ── Setters cơ bản ──────────────────────────────────────────────
    setDiagramId:    (id)    => set(s => { s.diagramId    = id;    }),
    setDiagramTitle: (title) => set(s => { s.diagramTitle = title; }),
    setIsSaving:     (v)     => set(s => { s.isSaving     = v;     }),
    setLastSavedAt:  (d)     => set(s => { s.lastSavedAt  = d;     }),

    // ── Load diagram từ API (không push undo) ───────────────────────
    loadDiagram: (nodes, edges) => set(s => {
      s.nodes     = nodes;
      s.edges     = edges;
      s.undoStack = [];
      s.redoStack = [];
      s.isDirty   = false;
    }),

    // ── Set nodes/edges kèm push undo ────────────────────────────────
    // Dùng khi user thao tác (add, delete, edit label...)
    // KHÔNG dùng khi nhận update từ server hoặc collab
    setNodesWithHistory: (nodes) => set(s => {
      _pushUndo(s);
      s.nodes   = nodes;
      s.isDirty = true;
    }),

    setEdgesWithHistory: (edges) => set(s => {
      _pushUndo(s);
      s.edges   = edges;
      s.isDirty = true;
    }),

    // ── Set nodes/edges KHÔNG push undo ─────────────────────────────
    // Dùng khi: nhận từ server, collab sync, SQL parser sync
    setNodes: (nodes) => set(s => {
      s.nodes   = typeof nodes === 'function' ? nodes(s.nodes) : nodes;
      s.isDirty = true;
    }),

    setEdges: (edges) => set(s => {
      s.edges   = typeof edges === 'function' ? edges(s.edges) : edges;
      s.isDirty = true;
    }),

    // ── Mark dirty mà không đổi state ───────────────────────────────
    markDirty: () => set(s => { s.isDirty = true; }),
    markClean: () => set(s => { s.isDirty = false; }),

    // ── Undo ─────────────────────────────────────────────────────────
    undo: () => set(s => {
      if (s.undoStack.length === 0) return;
      const prev = s.undoStack[s.undoStack.length - 1];
      s.undoStack.pop();
      // Push state hiện tại vào redoStack
      s.redoStack.push(snapshot(s.nodes, s.edges));
      s.nodes   = prev.nodes;
      s.edges   = prev.edges;
      s.isDirty = true;
    }),

    // ── Redo ─────────────────────────────────────────────────────────
    redo: () => set(s => {
      if (s.redoStack.length === 0) return;
      const next = s.redoStack[s.redoStack.length - 1];
      s.redoStack.pop();
      // Push state hiện tại vào undoStack
      s.undoStack.push(snapshot(s.nodes, s.edges));
      s.nodes   = next.nodes;
      s.edges   = next.edges;
      s.isDirty = true;
    }),

    // ── Push undo thủ công (dùng trước thao tác lớn) ─────────────────
    pushUndo: () => set(s => { _pushUndo(s); }),

    // ── Reset toàn bộ (khi navigate ra ngoài) ───────────────────────
    reset: () => set(s => {
      s.nodes        = [];
      s.edges        = [];
      s.diagramId    = null;
      s.diagramTitle = '';
      s.isDirty      = false;
      s.isSaving     = false;
      s.lastSavedAt  = null;
      s.undoStack    = [];
      s.redoStack    = [];
      s.lockedNodes  = {};
      s.onlineUsers  = {};
    }),
  }))
);

// ── Internal helper — push snapshot vào undoStack ─────────────────────
function _pushUndo(s) {
  s.undoStack.push(snapshot(s.nodes, s.edges));
  if (s.undoStack.length > MAX_HISTORY) {
    s.undoStack.shift(); // xóa cái cũ nhất
  }
  s.redoStack = []; // reset redo khi có thao tác mới
}