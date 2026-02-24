// src/apps/workspace/components/panel/SQLParserPanel.jsx

import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { THEME } from '../../../../shared/constants/theme';
import {
  preInjectAllIds,
  parseSQLToNodes,
  updateTableInSQL,
  upsertRelationInSQL,
  removeRelationInSQL,
} from '../../../../shared/utils/Sqlparser';

import {
  EditorView, keymap, lineNumbers,
  highlightActiveLine, highlightActiveLineGutter,
  Decoration, ViewPlugin, WidgetType,
} from '@codemirror/view';
import { EditorState, RangeSetBuilder, Annotation } from '@codemirror/state';
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import {
  autocompletion, closeBrackets,
  closeBracketsKeymap, completionKeymap,
} from '@codemirror/autocomplete';
import { indentOnInput, bracketMatching } from '@codemirror/language';

// Annotation để đánh dấu transaction do code tạo ra (không phải user gõ)
const External = Annotation.define();

// ── localStorage ──────────────────────────────────────────────────────
const SQL_TEXT_KEY  = 'uml_sql_text';
const POSITIONS_KEY = 'uml_positions';

const ls = {
  getSQL:   ()  => { try { return localStorage.getItem(SQL_TEXT_KEY)  ?? '';   } catch { return '';  } },
  setSQL:   (v) => { try { localStorage.setItem(SQL_TEXT_KEY, v);              } catch {} },
  getPos:   ()  => { try { return JSON.parse(localStorage.getItem(POSITIONS_KEY) ?? '{}'); } catch { return {}; } },
  setPos:   (v) => { try { localStorage.setItem(POSITIONS_KEY, JSON.stringify(v));        } catch {} },
  clearAll: ()  => { try { localStorage.removeItem(SQL_TEXT_KEY); localStorage.removeItem(POSITIONS_KEY); } catch {} },
};

const C = {
  bg:      '#0f172a',
  border:  '#1e293b',
  success: THEME.colors.SUCCESS,
  danger:  THEME.colors.DANGER,
  muted:   THEME.colors.MUTED,
};

// ── Decoration ────────────────────────────────────────────────────────
class HiddenWidget extends WidgetType {
  toDOM() { const s = document.createElement('span'); s.style.cssText = 'display:none'; return s; }
  eq()    { return true; }
}
const hiddenDeco   = Decoration.replace({ widget: new HiddenWidget() });
const relationMark = Decoration.mark({ attributes: { style: 'color:#818cf8;font-style:italic;' } });

const hideIdPlugin = ViewPlugin.fromClass(class {
  constructor(view) { this.decorations = this._build(view); }
  update(u) { if (u.docChanged || u.viewportChanged) this.decorations = this._build(u.view); }
  _build(view) {
    const b = new RangeSetBuilder();
    const reId       = /\s*--\s*@id:[^\s\n)]+/g;
    const reRelation = /--\s*@relation:[^\n]*/g;
    for (const { from, to } of view.visibleRanges) {
      const text = view.state.doc.sliceString(from, to);
      let m;
      reId.lastIndex = 0;
      while ((m = reId.exec(text))       !== null) b.add(from + m.index, from + m.index + m[0].length, hiddenDeco);
      reRelation.lastIndex = 0;
      while ((m = reRelation.exec(text)) !== null) b.add(from + m.index, from + m.index + m[0].length, relationMark);
    }
    return b.finish();
  }
}, { decorations: v => v.decorations });

// ── Theme ─────────────────────────────────────────────────────────────
const customTheme = EditorView.theme({
  '&':             { height: '100%', backgroundColor: '#0f172a', color: '#e2e8f0', fontSize: '11px', fontFamily: '"Fira Code","Cascadia Code",Consolas,monospace' },
  '.cm-content':   { padding: '10px 0', caretColor: '#fff', lineHeight: '1.75' },
  '.cm-line':      { padding: '0 12px' },
  '.cm-gutters':   { backgroundColor: '#0f172a', borderRight: '1px solid #1e293b', color: '#334155' },
  '.cm-activeLineGutter': { backgroundColor: '#1e293b40' },
  '.cm-activeLine':       { backgroundColor: '#1e293b40' },
  '.cm-selectionBackground, ::selection': { backgroundColor: '#334155 !important' },
  '.cm-cursor':           { borderLeftColor: '#fff' },
  '.cm-matchingBracket':  { backgroundColor: '#6366f130', outline: '1px solid #6366f1', borderRadius: '2px' },
  '.cm-tooltip':          { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' },
  '.cm-tooltip-autocomplete > ul > li':                { padding: '3px 8px' },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: '#6366f1', color: '#fff' },
}, { dark: true });

// ─────────────────────────────────────────────────────────────────────
const SQLParserPanel = forwardRef(function SQLParserPanel({ onSyncToCanvas }, ref) {
  const containerRef  = useRef(null);
  const viewRef       = useRef(null);
  const debounceRef   = useRef(null);
  const countRef      = useRef(null);
  const posRef        = useRef(ls.getPos());

  // KEY FIX: dùng ref cho callback để useEffect chỉ chạy 1 lần
  // không bao giờ destroy/recreate CodeMirror khi parent re-render
  const onSyncToCanvasRef = useRef(onSyncToCanvas);
  useEffect(() => { onSyncToCanvasRef.current = onSyncToCanvas; }, [onSyncToCanvas]);

  // ── Helpers ───────────────────────────────────────────────────────
  const getText = useCallback(() =>
    viewRef.current?.state.doc.toString() ?? '', []);

  const setCount = useCallback((nodeCount, edgeCount) => {
    if (!countRef.current) return;
    if (!nodeCount) {
      countRef.current.textContent = '○ empty';
      countRef.current.style.color = C.muted;
    } else {
      countRef.current.textContent = `⚡ ${nodeCount} tables${edgeCount ? `, ${edgeCount} relations` : ''}`;
      countRef.current.style.color = C.success;
    }
  }, []);

  // Ghi text vào editor + localStorage, không trigger listener
  const setEditorText = useCallback((newText, keepCaret = false) => {
    const view = viewRef.current;
    if (!view) return;
    const prevAnchor = view.state.selection.main.anchor;
    const tx = {
      changes:     { from: 0, to: view.state.doc.length, insert: newText },
      annotations: External.of(true),   // đánh dấu là external → listener bỏ qua
    };
    if (keepCaret) tx.selection = { anchor: Math.min(prevAnchor, newText.length) };
    view.dispatch(tx);
    ls.setSQL(newText);
  }, []);

  // Append block cuối + localStorage
  const doAppendBlock = useCallback((block) => {
    const view = viewRef.current;
    if (!view) return;
    const cur    = view.state.doc.toString();
    const sep    = cur.trimEnd() ? '\n\n' : '';
    const result = cur.trimEnd() + sep + block;
    view.dispatch({
      changes:     { from: view.state.doc.length, to: view.state.doc.length, insert: sep + block },
      annotations: External.of(true),
    });
    ls.setSQL(result);
    view.scrollDOM.scrollTop = view.scrollDOM.scrollHeight;
  }, []);

  // ── Core: parse SQL → canvas ──────────────────────────────────────
  // Dùng ref để không tạo function mới mỗi render → useEffect dep array = []
  const syncToCanvasRef = useRef(null);
  syncToCanvasRef.current = (rawValue) => {
    if (!rawValue.trim()) {
      posRef.current = {};
      ls.clearAll();
      onSyncToCanvasRef.current([], []);
      setCount(0, 0);
      return;
    }
    try {
      // 1. Pre-inject @id
      const { text: injected, injected: newIds } = preInjectAllIds(rawValue);

      // 2. Nếu có inject mới → cập nhật editor silent
      if (newIds.length && injected !== rawValue) {
        const view = viewRef.current;
        if (view) {
          view.dispatch({
            changes:     { from: 0, to: view.state.doc.length, insert: injected },
            annotations: External.of(true),
          });
        }
      }

      // 3. Lưu SQL (bản đã inject)
      ls.setSQL(injected);

      // 4. Parse
      const { nodes, edges } = parseSQLToNodes(injected);

      // 5. Restore position
      const withPos = nodes.map(n => {
        const cached = posRef.current[n.id];
        if (cached) return { ...n, position: cached };
        posRef.current[n.id] = n.position;
        return n;
      });
      ls.setPos(posRef.current);

      onSyncToCanvasRef.current(withPos, edges);
      setCount(nodes.length, edges.length);
    } catch (_) { /* bỏ qua lỗi parse khi gõ dở */ }
  };

  // ── API ───────────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    updateNode(node) {
      const tableId = node.data?.tableId || node.id;
      if (!tableId) return;
      const updated = updateTableInSQL(getText(), tableId, node);
      if (updated !== getText()) setEditorText(updated, true);
      if (node.position) { posRef.current[tableId] = node.position; ls.setPos(posRef.current); }
    },

    removeNode(tableId) {
      if (!tableId) return;
      const lines = getText().split('\n');
      let idLine = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`@id:${tableId}`)) { idLine = i; break; }
      }
      if (idLine === -1) return;
      let start = idLine;
      for (let j = idLine; j >= 0; j--) {
        if (/CREATE\s+TABLE/i.test(lines[j])) { start = j; break; }
      }
      let end = start, depth = 0, begun = false;
      for (let i = start; i < lines.length; i++) {
        for (const ch of lines[i].replace(/--[^\n]*/g, '')) {
          if (ch === '(') { depth++; begun = true; } else if (ch === ')') depth--;
        }
        if (begun && depth === 0) { end = i; break; }
      }
      const before = lines.slice(0, start).join('\n').trimEnd();
      const after  = lines.slice(end + 1).join('\n').trimStart();
      setEditorText([before, after].filter(Boolean).join('\n\n'));
      delete posRef.current[tableId];
      ls.setPos(posRef.current);
    },

    appendBlock(sqlBlock) { doAppendBlock(sqlBlock); },

    upsertRelation(edge, nodes) {
      const updated = upsertRelationInSQL(getText(), edge, nodes);
      if (updated !== getText()) setEditorText(updated, true);
    },

    removeRelation(edge, nodes) {
      const updated = removeRelationInSQL(getText(), edge, nodes);
      if (updated !== getText()) setEditorText(updated, true);
    },

    updateNodePosition(nodeId, position) {
      posRef.current[nodeId] = position;
      ls.setPos(posRef.current);
    },

    getText,
  }), [getText, setEditorText, doAppendBlock]);

  // ── Init CodeMirror — chỉ chạy 1 LẦN DUY NHẤT ────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const savedSQL = ls.getSQL();   // load từ localStorage

    // Listener: user gõ → debounce 500ms → syncToCanvas
    // Bỏ qua transaction do code tạo ra (đánh dấu External)
    const listener = EditorView.updateListener.of((update) => {
      if (!update.docChanged) return;
      // Bỏ qua nếu tất cả transactions đều là External (do code dispatch)
      const allExternal = update.transactions.every(tr => tr.annotation(External));
      if (allExternal) return;
      const value = update.state.doc.toString();
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => syncToCanvasRef.current(value), 500);
    });

    const view = new EditorView({
      state: EditorState.create({
        doc: savedSQL,              // ← load SQL đã lưu
        extensions: [
          oneDark, customTheme,
          lineNumbers(), highlightActiveLine(), highlightActiveLineGutter(),
          sql(), closeBrackets(), bracketMatching(),
          autocompletion({ defaultKeymap: true, activateOnTyping: true }),
          indentOnInput(), history(),
          keymap.of([
            ...closeBracketsKeymap, ...defaultKeymap,
            ...historyKeymap, ...completionKeymap, indentWithTab,
          ]),
          hideIdPlugin,
          listener,
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;

    // Trigger sync canvas ngay sau mount nếu có SQL cũ
    if (savedSQL.trim()) {
      debounceRef.current = setTimeout(() => syncToCanvasRef.current(savedSQL), 80);
    }

    // Cleanup — chỉ destroy khi component unmount thật sự
    return () => {
      clearTimeout(debounceRef.current);
      view.destroy();
    };
  }, []); // ← [] đảm bảo chỉ chạy 1 lần, không bao giờ recreate

  // ── Clear ─────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    posRef.current = {};
    ls.clearAll();
    setEditorText('');
    onSyncToCanvasRef.current([], []);
    setCount(0, 0);
  }, [setEditorText, setCount]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: C.bg }}>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 10px', borderBottom: `1px solid ${C.border}`, flexShrink: 0,
      }}>
        <span ref={countRef} style={{ fontSize: 9, fontWeight: 700, color: C.muted }}>○ empty</span>
        <button onClick={handleClear}
          style={{ fontSize: 9, color: C.danger, background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}>
          clear
        </button>
      </div>

      <div style={{
        padding: '3px 10px', borderBottom: `1px solid ${C.border}`,
        fontSize: 8, color: '#475569', lineHeight: 2, flexShrink: 0,
      }}>
        <span style={{ color: '#818cf8', fontStyle: 'italic' }}>@relation: A</span>{' '}
        <span style={{ color: '#94a3b8' }}>-as</span> assoc &nbsp;
        <span style={{ color: '#94a3b8' }}>-in</span> inherit &nbsp;
        <span style={{ color: '#94a3b8' }}>-ag</span> aggreg &nbsp;
        <span style={{ color: '#94a3b8' }}>-co</span> compos
      </div>

      <div ref={containerRef} style={{ flex: 1, overflow: 'hidden', minHeight: 0 }} />
    </div>
  );
});

export default SQLParserPanel;