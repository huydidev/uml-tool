import { Handle, Position, useReactFlow } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { useState } from 'react';

export default function UMLClassNode({ id, data, selected }) {
  const { setNodes } = useReactFlow();
  const [isEditingName, setIsEditingName] = useState(false);

  // Hàm cập nhật dữ liệu Node khi người dùng gõ chữ
  const handleDataChange = (field, value) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, [field]: value } };
        }
        return node;
      })
    );
  };

  return (
    <div className="bg-white border-2 border-black shadow-md min-w-[180px] min-h-[120px] h-full flex flex-col font-sans transition-shadow hover:shadow-lg">
      {/* Công cụ Resize - linh hồn của tính năng kéo giãn */}
      <NodeResizer 
        minWidth={180} 
        minHeight={120} 
        isVisible={selected} 
        lineClassName="border-blue-400 border-dashed" 
        handleClassName="h-3 w-3 bg-white border-2 border-blue-400 rounded-sm" 
      />
      
      {/* Các điểm kết nối dây (Handles) chuẩn UML */}
      <Handle type="target" position={Position.Top} className="!bg-black !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-black !w-2 !h-2" />
      <Handle type="target" position={Position.Left} className="!bg-black !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-black !w-2 !h-2" />

      {/* 1. Header: Tên Class */}
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

      {/* 2. Attributes Area */}
      <div className="p-2 flex-1 bg-white min-h-[30px]">
        <textarea 
          placeholder="- attributes: type"
          className="w-full h-full text-[12px] italic border-none outline-none resize-none leading-relaxed overflow-hidden"
          value={data.attributes?.join('\n')}
          onChange={(e) => handleDataChange('attributes', e.target.value.split('\n'))}
        />
      </div>

      {/* 3. Methods Area */}
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