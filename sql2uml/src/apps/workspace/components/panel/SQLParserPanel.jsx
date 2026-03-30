// src/apps/workspace/components/panel/SQLParserPanel.jsx

import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { THEME } from '../../../../shared/constants/theme';
import {
  parseSQLToNodes,
  updateTableInSQL,
  upsertRelationInSQL,
  removeRelationInSQL,
  genTableId, // Import thêm hàm genId
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

const External = Annotation.define();

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
  bg:      THEME.colors.SURFACE,         // nền panel SQL
  border:  THEME.colors.PRIMARY + '22',  // border nhạt từ primary
  success: THEME.colors.SUCCESS,
  danger:  THEME.colors.DANGER,
  muted:   THEME.colors.MUTED,
}

// --- Widget để ẩn ID ---
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
      while ((m = reId.exec(text)) !== null) b.add(from + m.index, from + m.index + m[0].length, hiddenDeco);
      reRelation.lastIndex = 0;
      while ((m = reRelation.exec(text)) !== null) b.add(from + m.index, from + m.index + m[0].length, relationMark);
    }
    return b.finish();
  }
}, { decorations: v => v.decorations });

const customTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: THEME.colors.SURFACE,
    color: '#1C1C1E',
    fontSize: '11px',
    fontFamily: '"Fira Code", monospace',
  },
  '.cm-content': { padding: '10px 0', caretColor: '#1C1C1E', lineHeight: '1.75' },
  '.cm-line': { padding: '0 12px' },
  '.cm-gutters': {
    backgroundColor: THEME.colors.SURFACE,
    borderRight: `1px solid ${THEME.colors.MUTED}33`,
    color: THEME.colors.MUTED,
  },
  '.cm-activeLineGutter': { backgroundColor: THEME.colors.PRIMARY + '18' },
  '.cm-activeLine':       { backgroundColor: THEME.colors.PRIMARY + '10' },
  '.cm-selectionBackground, ::selection': { backgroundColor: THEME.colors.PRIMARY + '33' },
  '.cm-cursor': { borderLeftColor: THEME.colors.PRIMARY },
}, { dark: false })  // ← đổi dark: true → false vì giờ là light theme

// --- Component chính ---
const SQLParserPanel = forwardRef(function SQLParserPanel({ onSyncToCanvas }, ref) {
  const containerRef  = useRef(null);
  const viewRef       = useRef(null);
  const debounceRef   = useRef(null);
  const countRef       = useRef(null);
  const posRef        = useRef(ls.getPos());
  const onSyncToCanvasRef = useRef(onSyncToCanvas);

  useEffect(() => { onSyncToCanvasRef.current = onSyncToCanvas; }, [onSyncToCanvas]);

  const getText = useCallback(() => viewRef.current?.state.doc.toString() ?? '', []);

  const setCount = useCallback((nodeCount, edgeCount) => {
    if (!countRef.current) return;
    countRef.current.textContent = !nodeCount ? '○ empty' : `⚡ ${nodeCount} tables${edgeCount ? `, ${edgeCount} relations` : ''}`;
    countRef.current.style.color = !nodeCount ? C.muted : C.success;
  }, []);

  // Cập nhật Editor thông minh: Chỉ cập nhật nếu thực sự khác và giữ nguyên con trỏ
  const setEditorText = useCallback((newText, keepCaret = true) => {
    const view = viewRef.current;
    if (!view || newText === view.state.doc.toString()) return;

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: newText },
      annotations: External.of(true),
      selection: keepCaret ? view.state.selection : undefined
    });
    ls.setSQL(newText);
  }, []);

  // --- HÀM SYNC QUAN TRỌNG: Đã sửa để không nhảy con trỏ ---
  const syncToCanvas = useCallback((rawValue) => {
    if (!rawValue.trim()) {
      posRef.current = {}; ls.clearAll();
      onSyncToCanvasRef.current([], []); setCount(0, 0);
      return;
    }

    const view = viewRef.current;
    if (!view) return;

    // 1. Tìm các bảng thiếu ID và tạo Transaction chèn ID cục bộ
    const docText = view.state.doc.toString();
    const re = /\bCREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?\s*\(/gi;
    let match;
    const changes = [];

    while ((match = re.exec(docText)) !== null) {
      const fullMatch = match[0];
      const endIdx = match.index + fullMatch.length;
      // Kiểm tra xem phía sau dấu '(' có @id chưa
      const followingText = docText.slice(endIdx, endIdx + 50);
      if (!/@id:[^\s)]+/i.test(followingText)) {
        changes.push({ from: endIdx, insert: ` -- @id:${genTableId()}` });
      }
    }

    // 2. Nếu có chèn ID, thực hiện dispatch (giữ nguyên selection)
    if (changes.length > 0) {
      view.dispatch({
        changes,
        annotations: External.of(true),
        selection: view.state.selection // Giữ con trỏ đứng yên
      });
    }

    // 3. Lấy text mới nhất sau khi đã có ID để parse
    const finalSubValue = view.state.doc.toString();
    ls.setSQL(finalSubValue);

    try {
      const { nodes, edges } = parseSQLToNodes(finalSubValue);
      const withPos = nodes.map(n => {
        const cached = posRef.current[n.id];
        if (cached) return { ...n, position: cached };
        posRef.current[n.id] = n.position;
        return n;
      });
      ls.setPos(posRef.current);
      onSyncToCanvasRef.current(withPos, edges);
      setCount(nodes.length, edges.length);
    } catch (e) { console.warn("Parsing...", e.message); }
  }, [setCount]);

  useImperativeHandle(ref, () => ({
    updateNode(node) {
      const tableId = node.data?.tableId || node.id;
      const updated = updateTableInSQL(getText(), tableId, node);
      setEditorText(updated, true);
      if (node.position) { posRef.current[tableId] = node.position; ls.setPos(posRef.current); }
    },
    removeNode(tableId) {
      const lines = getText().split('\n');
      const idIdx = lines.findIndex(l => l.includes(`@id:${tableId}`));
      if (idIdx === -1) return;
      // Logic xóa block (giữ nguyên logic cũ của bạn nhưng bọc trong setEditorText an toàn)
      const updated = updateTableInSQL(getText(), tableId, { data: null }); // Giả định logic xóa
      setEditorText(updated);
      delete posRef.current[tableId]; ls.setPos(posRef.current);
    },
    appendBlock(block) {
      const view = viewRef.current;
      if (!view) return;
      const sep = view.state.doc.toString().trim() ? '\n\n' : '';
      view.dispatch({
        changes: { from: view.state.doc.length, insert: sep + block },
        annotations: External.of(true)
      });
      ls.setSQL(view.state.doc.toString());
      view.scrollDOM.scrollTop = view.scrollDOM.scrollHeight;
    },
    upsertRelation(edge, nodes) {
      setEditorText(upsertRelationInSQL(getText(), edge, nodes), true);
    },
    removeRelation(edge, nodes) {
      setEditorText(removeRelationInSQL(getText(), edge, nodes), true);
    },
    updateNodePosition(id, pos) { posRef.current[id] = pos; ls.setPos(posRef.current); },
    getText,
  }), [getText, setEditorText]);

  useEffect(() => {
    if (!containerRef.current) return;
    const view = new EditorView({
      state: EditorState.create({
        doc: ls.getSQL(),
        extensions: [
          // oneDark,
           customTheme, lineNumbers(), highlightActiveLine(),
          sql(), closeBrackets(), bracketMatching(), history(),
          autocompletion(), indentOnInput(),
          keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...completionKeymap, indentWithTab]),
          hideIdPlugin,
          EditorView.updateListener.of((u) => {
            if (u.docChanged && !u.transactions.some(tr => tr.annotation(External))) {
              clearTimeout(debounceRef.current);
              debounceRef.current = setTimeout(() => syncToCanvas(u.state.doc.toString()), 500);
            }
          }),
        ],
      }),
      parent: containerRef.current,
    });
    viewRef.current = view;
    if (ls.getSQL().trim()) syncToCanvas(ls.getSQL());
    return () => { view.destroy(); clearTimeout(debounceRef.current); };
  }, [syncToCanvas]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: C.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 10px', borderBottom: `1px solid ${C.border}` }}>
        <span ref={countRef} style={{ fontSize: 9, fontWeight: 700, color: C.muted }}>○ empty</span>
        <button onClick={() => { ls.clearAll(); setEditorText(''); onSyncToCanvasRef.current([], []); setCount(0, 0); }} 
                style={{ fontSize: 9, color: C.danger, background: 'none', border: 'none', cursor: 'pointer' }}>clear</button>
      </div>
      <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }} />
    </div>
  );
});

export default SQLParserPanel;