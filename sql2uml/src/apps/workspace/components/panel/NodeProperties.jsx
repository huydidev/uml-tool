// src/apps/user/components/NodeProperties.jsx
// FIX: tableName được update khi label thay đổi, sync đúng với CodeMirror

import { useState, useCallback, useRef } from 'react';
import { THEME } from '../../../../shared/constants/theme';

function EditableList({ items, accentColor, onUpdate, onDelete, onAdd, addLabel }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.length === 0 && (
        <p className={`text-[9px] ${THEME.textGhost} italic`}>Chưa có gì</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5 group">
          <input
            value={item}
            onChange={(e) => onUpdate(i, e.target.value)}
            className={`flex-1 ${THEME.input} px-2 py-1 text-[10px] font-mono`}
          />
          <button
            onClick={() => onDelete(i)}
            className={`opacity-0 group-hover:opacity-100 ${THEME.btnDanger} text-xs w-4`}
          >✕</button>
        </div>
      ))}
      <button onClick={onAdd} className={`text-[9px] ${THEME.textGhost} hover:${accentColor} transition-all self-start`}>
        + {addLabel}
      </button>
    </div>
  );
}

export default function NodeProperties({ node, onClose, onUpdate }) {
  const [label, setLabel]           = useState(node.data.label || '');
  const [attributes, setAttributes] = useState(node.data.attributes || []);
  const [methods, setMethods]       = useState(node.data.methods || []);

  // Giữ ref để luôn có giá trị mới nhất khi blur
  const labelRef      = useRef(label);
  const attrsRef      = useRef(attributes);
  const methodsRef    = useRef(methods);

  labelRef.current   = label;
  attrsRef.current   = attributes;
  methodsRef.current = methods;

  // ── push: build đủ cả tableName khi label thay đổi ──────────────
  const push = useCallback((l, a, m) => {
    onUpdate(node.id, {
      label:      l,
      attributes: a,
      methods:    m,
      // KEY FIX: luôn truyền tableName mới theo label
      tableName:  l.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    });
  }, [node.id, onUpdate]);

  // ── Label: chỉ cập nhật local state khi gõ, push khi blur/Enter ─
  const handleLabelChange = (e) => {
    setLabel(e.target.value.toUpperCase());
  };

  const commitLabel = useCallback(() => {
    push(labelRef.current, attrsRef.current, methodsRef.current);
  }, [push]);

  const handleLabelKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitLabel();
      e.target.blur();
    }
    if (e.key === 'Escape') {
      e.target.blur();
    }
  };

  // ── Attributes: push ngay khi sửa (các field nhỏ dùng blur cũng ok) ─
  const updateAttr   = (i, v) => { const a = attributes.map((x,j) => j===i?v:x); setAttributes(a); push(label, a, methods); };
  const deleteAttr   = (i)    => { const a = attributes.filter((_,j) => j!==i);  setAttributes(a); push(label, a, methods); };
  const addAttr      = ()     => { const a = [...attributes,'- newField: string']; setAttributes(a); push(label, a, methods); };

  const updateMethod = (i, v) => { const m = methods.map((x,j) => j===i?v:x); setMethods(m); push(label, attributes, m); };
  const deleteMethod = (i)    => { const m = methods.filter((_,j) => j!==i);  setMethods(m); push(label, attributes, m); };
  const addMethod    = ()     => { const m = [...methods,'+ newMethod(): void']; setMethods(m); push(label, attributes, m); };

  return (
    <div className="flex flex-col gap-4 p-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-sm ${THEME.nodeDot}`} />
          <span className={THEME.label}>Properties</span>
        </div>
        <button onClick={onClose} className={`${THEME.btnGhost} text-sm w-5 h-5 flex items-center justify-center rounded`}>
          ✕
        </button>
      </div>

      {/* Class name */}
      <div className="flex flex-col gap-1">
        <label className={THEME.label}>Class Name</label>
        <input
          value={label}
          onChange={handleLabelChange}
          onBlur={commitLabel}
          onKeyDown={handleLabelKeyDown}
          className={`${THEME.input} px-3 py-2 text-sm font-bold text-white`}
          placeholder="TABLE_NAME"
        />
        <p className={`text-[9px] ${THEME.textGhost}`}>
          Nhấn Enter hoặc click ra ngoài để cập nhật SQL
        </p>
      </div>

      {/* Attributes */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className={`${THEME.label} ${THEME.accentBlue}`}>Attributes</span>
        </div>
        <EditableList
          items={attributes}
          accentColor={THEME.accentBlue}
          onUpdate={updateAttr}
          onDelete={deleteAttr}
          onAdd={addAttr}
          addLabel="add attribute"
        />
      </div>

      {/* Methods */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className={`${THEME.label} ${THEME.accentViolet}`}>Methods</span>
        </div>
        <EditableList
          items={methods}
          accentColor={THEME.accentViolet}
          onUpdate={updateMethod}
          onDelete={deleteMethod}
          onAdd={addMethod}
          addLabel="add method"
        />
      </div>

      {/* Meta */}
      <div className={`pt-2 border-t ${THEME.borderLight}`}>
        <p className={`text-[9px] ${THEME.textGhost} font-mono`}>ID: {node.id}</p>
        <p className={`text-[9px] ${THEME.textGhost} font-mono`}>
          x: {Math.round(node.position?.x ?? 0)} y: {Math.round(node.position?.y ?? 0)}
        </p>
      </div>
    </div>
  );
}