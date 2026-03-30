// src/apps/user/components/EditorToolbox.jsx

import { useState } from 'react';
import { EDGE_CONFIGS } from '../../../shared/constants/edgeConfigs';

const EDGE_ICONS = {
  association: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <line x1="4" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <polyline points="13,7 18,12 13,17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  inheritance: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <line x1="4" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <polygon points="16,7 22,12 16,17" stroke="currentColor" strokeWidth="2" fill="white" strokeLinejoin="round"/>
    </svg>
  ),
  aggregation: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <line x1="10" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <polygon points="2,12 6,8 10,12 6,16" stroke="currentColor" strokeWidth="2" fill="white" strokeLinejoin="round"/>
      <polyline points="15,8 20,12 15,16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  composition: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <line x1="10" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <polygon points="2,12 6,8 10,12 6,16" stroke="currentColor" strokeWidth="2" fill="currentColor" strokeLinejoin="round"/>
      <polyline points="15,8 20,12 15,16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

function DraggableClassItem({ theme }) {
  const isDark = theme === 'dark';
  const onDragStart = (e) => {
    e.dataTransfer.setData('application/reactflow-type', 'umlClass');
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div draggable onDragStart={onDragStart} className="cursor-grab active:cursor-grabbing select-none">
      <div className={`border-2 rounded-lg p-2.5 transition-all group ${
        isDark
          ? 'border-slate-600 bg-slate-700 hover:bg-slate-600 hover:border-blue-400'
          : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-blue-400'
      }`}>
        <div className={`border rounded overflow-hidden text-xs transition-all ${
          isDark ? 'border-slate-500 group-hover:border-blue-400' : 'border-gray-300 group-hover:border-blue-400'
        }`}>
          <div className={`px-2 py-1 text-center font-bold border-b text-[11px] tracking-wide ${
            isDark ? 'bg-slate-600 group-hover:bg-blue-900/40 text-slate-200 border-slate-500' : 'bg-gray-200 group-hover:bg-blue-50 text-gray-700 border-gray-300'
          }`}>CLASS</div>
          <div className={`px-2 py-0.5 border-b text-[10px] ${isDark ? 'text-slate-400 border-slate-500' : 'text-gray-500 border-gray-200'}`}>- attribute</div>
          <div className={`px-2 py-0.5 text-[10px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>+ method()</div>
        </div>
        <p className={`text-center text-[9px] mt-1.5 transition-all group-hover:text-blue-400 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
          Kéo vào canvas
        </p>
      </div>
    </div>
  );
}

export default function EditorToolbox({ selectedEdgeType, onEdgeTypeChange, theme = 'dark' }) {
  const [expanded, setExpanded] = useState(false);
  const isDark = theme === 'dark';
  const selectedCfg = EDGE_CONFIGS.find(c => c.type === selectedEdgeType);

  const panelClass = isDark
    ? 'bg-slate-900/95 backdrop-blur border-slate-700'
    : 'bg-white/95 backdrop-blur border-gray-200';

  const toggleClass = isDark
    ? 'bg-slate-900/90 backdrop-blur border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white'
    : 'bg-white/90 backdrop-blur border-gray-200 hover:border-gray-400 text-gray-500 hover:text-gray-900';

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col items-end gap-2">

      {/* Expanded panel */}
      <div className={`flex flex-col gap-2 overflow-hidden transition-all duration-300 ease-in-out origin-right ${
        expanded ? 'opacity-100 w-48 pointer-events-auto' : 'opacity-0 w-0 pointer-events-none'
      }`}>
        <div className={`border rounded-2xl p-3 flex flex-col gap-3 shadow-2xl ${panelClass}`}>

          <div>
            <p className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Element</p>
            <DraggableClassItem theme={theme} />
          </div>

          <div className={`border-t ${isDark ? 'border-slate-700/60' : 'border-gray-100'}`} />

          <div>
            <p className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Relationship</p>
            <div className="flex flex-col gap-1">
              {EDGE_CONFIGS.map((cfg) => (
                <button
                  key={cfg.type}
                  onClick={() => onEdgeTypeChange(cfg.type)}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all border text-xs ${
                    selectedEdgeType === cfg.type ? '' : `border-transparent ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`
                  }`}
                  style={selectedEdgeType === cfg.type
                    ? { borderColor: cfg.color, backgroundColor: cfg.color + '18', color: cfg.color }
                    : {}
                  }
                >
                  <span style={{ color: selectedEdgeType === cfg.type ? cfg.color : (isDark ? '#94a3b8' : '#9ca3af') }}>
                    {EDGE_ICONS[cfg.type]}
                  </span>
                  <div>
                    <div className="font-bold text-[11px] leading-tight">{cfg.label}</div>
                    <div className="text-[9px] leading-tight opacity-60 mt-0.5">{cfg.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={`border-t pt-2 ${isDark ? 'border-slate-700/60' : 'border-gray-100'}`}>
            <p className={`text-[9px] leading-relaxed ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
              <span className="text-red-400">Del</span> → xóa node/edge đang chọn
            </p>
          </div>
        </div>
      </div>

      {/* Toggle + badge */}
      <div className="flex items-center gap-2">
        {!expanded && (
          <div
            className={`flex items-center gap-1.5 border rounded-xl px-2.5 py-1.5 text-[10px] font-bold shadow-lg transition-all ${
              isDark ? 'bg-slate-900/90 backdrop-blur border-slate-700' : 'bg-white/90 backdrop-blur border-gray-200'
            }`}
            style={{ color: selectedCfg?.color, borderColor: selectedCfg?.color + '60' }}
          >
            <span style={{ color: selectedCfg?.color }}>{EDGE_ICONS[selectedEdgeType]}</span>
            <span>{selectedCfg?.label}</span>
          </div>
        )}
        <button
          onClick={() => setExpanded(e => !e)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all border ${
            expanded
              ? isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-200 border-gray-300 text-gray-900'
              : toggleClass
          }`}
          title={expanded ? 'Đóng toolbox' : 'Mở toolbox'}
        >
          <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
            <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}