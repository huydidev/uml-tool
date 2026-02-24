// src/apps/workspace/components/panel/SQLParserPanel.jsx

import { useState, useRef, useCallback } from 'react';
import { THEME } from '../../../../shared/constants/theme';
import { parseSQLToNodes } from '../../../../shared/utils/Sqlparser';

const C = {
  bg:        '#0f172a',
  border:    '#1e293b',
  textMuted: THEME.colors.MUTED,
  code:      '#4ade80',
  accent:    THEME.colors.SECONDARY,
  success:   THEME.colors.SUCCESS,
  danger:    THEME.colors.DANGER,
};

const PLACEHOLDER = `-- Gõ SQL, canvas tự cập nhật

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255)
)

CREATE TABLE posts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  title VARCHAR(255)
)`;

// Nhận SQL không cần dấu ; — tự thêm trước khi parse
function parseFlexibleSQL(text) {
  // Thêm ; sau ) kết thúc block (trước CREATE tiếp theo hoặc cuối file)
  const normalized = text
    .replace(/\)\s*\n(\s*CREATE)/gi, ');\n$1')  // ) theo sau bởi CREATE
    .replace(/\)\s*$/gi, ');')                   // ) ở cuối file
    .replace(/;;+/g, ';');
  return parseSQLToNodes(normalized);
}

// Smart keyboard: auto (), indent, tab
function applySmartKey(e, value, selStart, selEnd) {
  const before = value.slice(0, selStart);
  const after  = value.slice(selEnd);

  // ( → tự đóng )
  if (e.key === '(') {
    e.preventDefault();
    return { newValue: before + '()' + after, newCursor: selStart + 1 };
  }

  // ) khi đã có ) → nhảy qua
  if (e.key === ')' && after[0] === ')') {
    e.preventDefault();
    return { newValue: value, newCursor: selStart + 1 };
  }

  // Backspace giữa () rỗng → xóa cả cặp
  if (e.key === 'Backspace' && selStart === selEnd) {
    if (before.endsWith('(') && after.startsWith(')')) {
      e.preventDefault();
      return { newValue: before.slice(0, -1) + after.slice(1), newCursor: selStart - 1 };
    }
  }

  // Enter → xuống hàng + giữ/tăng indent
  if (e.key === 'Enter') {
    e.preventDefault();
    const lines = before.split('\n');
    const currentLine = lines[lines.length - 1];
    const currentIndent = currentLine.match(/^(\s*)/)[1];
    const trimmed = currentLine.trimEnd();

    // Sau ( → tăng indent
    if (trimmed.endsWith('(')) {
      const indent = currentIndent + '  ';
      return { newValue: before + '\n' + indent + after, newCursor: selStart + 1 + indent.length };
    }

    // Giữ indent hiện tại
    return { newValue: before + '\n' + currentIndent + after, newCursor: selStart + 1 + currentIndent.length };
  }

  // Tab → 2 spaces
  if (e.key === 'Tab') {
    e.preventDefault();
    return { newValue: before + '  ' + after, newCursor: selStart + 2 };
  }

  return null;
}

export default function SQLParserPanel({ onSyncToCanvas }) {
  const [sqlInput, setSqlInput]     = useState('');
  const [parseError, setParseError] = useState('');
  const [tableCount, setTableCount] = useState(0);
  const textareaRef = useRef(null);
  const debounceRef = useRef(null);

  const syncToCanvas = useCallback((value) => {
    if (!value.trim()) {
      setTableCount(0);
      setParseError('');
      onSyncToCanvas([], []);
      return;
    }
    try {
      const result = parseFlexibleSQL(value);
      setTableCount(result.nodes.length);
      setParseError('');
      onSyncToCanvas(result.nodes, result.edges);
    } catch (e) {
      setParseError(e.message);
    }
  }, [onSyncToCanvas]);

  const updateValue = useCallback((newValue, newCursor) => {
    setSqlInput(newValue);
    if (newCursor !== undefined) {
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = newCursor;
          textareaRef.current.selectionEnd   = newCursor;
        }
      });
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => syncToCanvas(newValue), 400);
  }, [syncToCanvas]);

  const handleKeyDown = useCallback((e) => {
    const ta = e.target;
    const result = applySmartKey(e, ta.value, ta.selectionStart, ta.selectionEnd);
    if (result) updateValue(result.newValue, result.newCursor);
  }, [updateValue]);

  const handleChange = useCallback((e) => {
    updateValue(e.target.value);
  }, [updateValue]);

  const handleClear = useCallback(() => {
    setSqlInput('');
    setTableCount(0);
    setParseError('');
    onSyncToCanvas([], []);
  }, [onSyncToCanvas]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: C.bg }}>

      {/* Status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 10px', borderBottom: `1px solid ${C.border}`, flexShrink: 0,
      }}>
        <span style={{
          fontSize: 9, fontWeight: 700,
          color: parseError ? C.danger : tableCount > 0 ? C.success : C.textMuted,
        }}>
          {parseError ? '⚠ lỗi syntax' : tableCount > 0 ? `⚡ ${tableCount} tables` : '○ empty'}
        </span>
        {sqlInput && (
          <button onClick={handleClear}
            style={{ fontSize: 9, color: C.danger, background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}>
            clear
          </button>
        )}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={sqlInput}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={PLACEHOLDER}
        spellCheck={false}
        style={{
          flex: 1,
          backgroundColor: C.bg,
          color: C.code,
          caretColor: '#fff',
          fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
          fontSize: 11,
          lineHeight: 1.75,
          padding: '10px 12px',
          border: 'none',
          outline: 'none',
          resize: 'none',
          whiteSpace: 'pre',
          overflowX: 'auto',
          boxSizing: 'border-box',
          width: '100%',
        }}
      />

    </div>
  );
}