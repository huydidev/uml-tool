// src/apps/user/components/NodePropertiesPanel.jsx

import { useState, useEffect } from 'react';

// ── Một dòng attribute/method có thể xóa ────────────────────────────
function EditableRow({ value, placeholder, onChange, onDelete }) {
  return (
    <div className="flex items-center gap-2 group">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono outline-none transition-all placeholder-slate-600"
      />
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all text-sm w-5 shrink-0"
      >
        ✕
      </button>
    </div>
  );
}

// ── Section có thể collapse ──────────────────────────────────────────
function Section({ title, color, children, onAdd, addLabel }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-all"
          style={{ color }}
        >
          <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
          {title}
        </button>
        <button
          onClick={onAdd}
          className="text-[10px] text-slate-500 hover:text-blue-400 transition-all font-mono"
        >
          + {addLabel}
        </button>
      </div>
      {open && <div className="flex flex-col gap-1.5">{children}</div>}
    </div>
  );
}

// ── Main Panel ───────────────────────────────────────────────────────
export default function NodePropertiesPanel({ node, onClose, onUpdate }) {
  const [label, setLabel]           = useState('');
  const [attributes, setAttributes] = useState([]);
  const [methods, setMethods]       = useState([]);

  // Sync khi node thay đổi
  useEffect(() => {
    if (!node) return;
    setLabel(node.data.label || '');
    setAttributes(node.data.attributes || []);
    setMethods(node.data.methods || []);
  }, [node?.id]);

  // Push thay đổi lên EditorPage realtime
  useEffect(() => {
    if (!node) return;
    onUpdate(node.id, { label, attributes, methods });
  }, [label, attributes, methods]);

  if (!node) return null;

  // ── Attributes helpers ─────────────────────────────────────────
  const updateAttr = (i, val) => setAttributes(a => a.map((x, idx) => idx === i ? val : x));
  const deleteAttr = (i)      => setAttributes(a => a.filter((_, idx) => idx !== i));
  const addAttr    = ()       => setAttributes(a => [...a, '- newField: string']);

  // ── Methods helpers ────────────────────────────────────────────
  const updateMethod = (i, val) => setMethods(m => m.map((x, idx) => idx === i ? val : x));
  const deleteMethod = (i)      => setMethods(m => m.filter((_, idx) => idx !== i));
  const addMethod    = ()       => setMethods(m => [...m, '+ newMethod(): void']);

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-700/60 flex flex-col shrink-0 overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Properties</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-600 hover:text-white w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700 transition-all text-sm"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">

        {/* Class name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Class Name
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value.toUpperCase())}
            className="bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm font-bold text-white outline-none transition-all tracking-wide"
            placeholder="CLASS_NAME"
          />
        </div>

        {/* Attributes */}
        <Section
          title="Attributes"
          color="#60a5fa"
          onAdd={addAttr}
          addLabel="attribute"
        >
          {attributes.length === 0 && (
            <p className="text-[10px] text-slate-600 italic pl-1">Chưa có attribute nào</p>
          )}
          {attributes.map((attr, i) => (
            <EditableRow
              key={i}
              value={attr}
              placeholder="- fieldName: type"
              onChange={(val) => updateAttr(i, val)}
              onDelete={() => deleteAttr(i)}
            />
          ))}
        </Section>

        {/* Methods */}
        <Section
          title="Methods"
          color="#a78bfa"
          onAdd={addMethod}
          addLabel="method"
        >
          {methods.length === 0 && (
            <p className="text-[10px] text-slate-600 italic pl-1">Chưa có method nào</p>
          )}
          {methods.map((method, i) => (
            <EditableRow
              key={i}
              value={method}
              placeholder="+ methodName(): returnType"
              onChange={(val) => updateMethod(i, val)}
              onDelete={() => deleteMethod(i)}
            />
          ))}
        </Section>

        {/* Meta info */}
        <div className="mt-auto pt-4 border-t border-slate-700/60">
          <p className="text-[10px] text-slate-600 font-mono">ID: {node.id}</p>
          <p className="text-[10px] text-slate-600 font-mono mt-0.5">
            Position: ({Math.round(node.position.x)}, {Math.round(node.position.y)})
          </p>
        </div>
      </div>
    </div>
  );
}