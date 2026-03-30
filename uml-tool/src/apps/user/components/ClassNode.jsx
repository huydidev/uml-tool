import { Handle, Position, useReactFlow } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { useState } from 'react';

// ── ERD View: chỉ hiện tên bảng + columns ───────────────────────────
function ERDView({ id, data, selected }) {
  const { setNodes } = useReactFlow();
  const [isEditingName, setIsEditingName] = useState(false);

  const handleLabelChange = (value) => {
    setNodes((nds) =>
      nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label: value } } : n)
    );
  };

  return (
    <div className="bg-white border-2 border-black shadow-md min-w-[180px] flex flex-col font-sans transition-shadow hover:shadow-lg">
      <NodeResizer minWidth={160} minHeight={60} isVisible={selected}
        lineClassName="border-blue-400 border-dashed"
        handleClassName="h-3 w-3 bg-white border-2 border-blue-400 rounded-sm"
      />
      <Handle type="target" position={Position.Top}    className="!bg-black !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-black !w-2 !h-2" />
      <Handle type="target" position={Position.Left}   className="!bg-black !w-2 !h-2" />
      <Handle type="source" position={Position.Right}  className="!bg-black !w-2 !h-2" />

      {/* Table name header */}
      <div className="px-3 py-2 bg-slate-800 flex justify-center items-center border-b-2 border-black">
        {isEditingName ? (
          <input
            autoFocus
            className="w-full text-center font-bold text-xs outline-none bg-slate-700 text-white rounded px-1"
            value={data.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            onBlur={() => setIsEditingName(false)}
          />
        ) : (
          <div
            className="font-bold text-xs text-white uppercase tracking-wide cursor-text select-none"
            onDoubleClick={() => setIsEditingName(true)}
          >
            {data.label || 'TABLE'}
          </div>
        )}
      </div>

      {/* Columns list */}
      <div className="divide-y divide-gray-200">
        {(data.attributes || []).filter(a => a.trim()).map((attr, i) => {
          const clean = attr.replace(/^[-+#~]\s*/, '');
          const [name, type] = clean.split(':').map(s => s.trim());
          const isPK = name?.toLowerCase() === 'id';
          return (
            <div key={i} className={`flex items-center justify-between px-3 py-1 text-[11px] ${isPK ? 'bg-yellow-50' : ''}`}>
              <span className="flex items-center gap-1 font-mono text-slate-700">
                {isPK && <span className="text-yellow-500 text-[9px] font-bold">PK</span>}
                {name}
              </span>
              <span className="text-slate-400 font-mono text-[10px]">{type || 'VARCHAR'}</span>
            </div>
          );
        })}
        {(!data.attributes || data.attributes.filter(a => a.trim()).length === 0) && (
          <div className="px-3 py-1 text-[10px] text-slate-400 italic">no columns</div>
        )}
      </div>
    </div>
  );
}

// ── Class View: đầy đủ như UML chuẩn ────────────────────────────────
function ClassView({ id, data, selected }) {
  const { setNodes } = useReactFlow();
  const [isEditingName, setIsEditingName] = useState(false);

  const handleDataChange = (field, value) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, [field]: value } } : node
      )
    );
  };

  return (
    <div className="bg-white border-2 border-black shadow-md min-w-[180px] min-h-[120px] h-full flex flex-col font-sans transition-shadow hover:shadow-lg">
      <NodeResizer minWidth={180} minHeight={120} isVisible={selected}
        lineClassName="border-blue-400 border-dashed"
        handleClassName="h-3 w-3 bg-white border-2 border-blue-400 rounded-sm"
      />
      <Handle type="target" position={Position.Top}    className="!bg-black !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-black !w-2 !h-2" />
      <Handle type="target" position={Position.Left}   className="!bg-black !w-2 !h-2" />
      <Handle type="source" position={Position.Right}  className="!bg-black !w-2 !h-2" />

      {/* Header: class name */}
      <div className="p-3 border-b-2 border-black bg-gray-50 flex justify-center items-center min-h-[40px]">
        {isEditingName ? (
          <input
            autoFocus
            className="w-full text-center font-bold uppercase text-sm outline-none bg-blue-50"
            value={data.label}
            onChange={(e) => handleDataChange('label', e.target.value)}
            onBlur={() => setIsEditingName(false)}
          />
        ) : (
          <div
            className="font-bold uppercase text-sm cursor-text select-none"
            onDoubleClick={() => setIsEditingName(true)}
          >
            {data.label || 'NewClass'}
          </div>
        )}
      </div>

      {/* Attributes */}
      <div className="p-2 flex-1 bg-white min-h-[30px]">
        <textarea
          placeholder="- attributes: type"
          className="w-full h-full text-[12px] italic border-none outline-none resize-none leading-relaxed overflow-hidden"
          value={data.attributes?.join('\n')}
          onChange={(e) => handleDataChange('attributes', e.target.value.split('\n'))}
        />
      </div>

      {/* Methods */}
      <div className="p-2 border-t-2 border-black flex-1 bg-white min-h-[30px]">
        <textarea
          placeholder="+ methods(): return"
          className="w-full h-full text-[12px] border-none outline-none resize-none leading-relaxed overflow-hidden"
          value={data.methods?.join('\n')}
          onChange={(e) => handleDataChange('methods', e.target.value.split('\n'))}
        />
      </div>
    </div>
  );
}

// ── Export: tự chọn view dựa vào data.viewMode ───────────────────────
export default function ClassNode({ id, data, selected }) {
  if (data.viewMode === 'erd') {
    return <ERDView id={id} data={data} selected={selected} />;
  }
  return <ClassView id={id} data={data} selected={selected} />;
}