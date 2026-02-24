// src/apps/workspace/components/canvas/EditorToolbox.jsx
import { useState } from 'react';
import { THEME } from '../../../../shared/constants/theme';
import { EDGE_CONFIGS } from '../../../../shared/constants/edgeConfigs';

// Màu dùng inline style — tránh Tailwind dynamic class không compile
const C = {
  bg:          THEME.colors.SURFACE,
  bgPanel:     '#ffffff',
  border:      '#e2e8f0',
  borderLight: '#f1f5f9',
  label:       THEME.colors.MUTED,
  labelLight:  '#94a3b8',
  ghost:       '#cbd5e1',
  primary:     THEME.colors.PRIMARY,
  danger:      THEME.colors.DANGER,
};

const EDGE_ICONS = {
  association: (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
      <line x1="4" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <polyline points="13,7 18,12 13,17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  inheritance: (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
      <line x1="4" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <polygon points="16,7 22,12 16,17" stroke="currentColor" strokeWidth="2" fill="white" strokeLinejoin="round"/>
    </svg>
  ),
  aggregation: (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
      <line x1="10" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <polygon points="2,12 6,8 10,12 6,16" stroke="currentColor" strokeWidth="2" fill="white" strokeLinejoin="round"/>
      <polyline points="15,8 20,12 15,16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  composition: (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
      <line x1="10" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <polygon points="2,12 6,8 10,12 6,16" stroke="currentColor" strokeWidth="2" fill="currentColor" strokeLinejoin="round"/>
      <polyline points="15,8 20,12 15,16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const VIEW_MODES = [
  { id: 'class', label: 'Class', icon: '⬜' },
  { id: 'erd',   label: 'ERD',   icon: '🗃' },
];

function DraggableClassItem() {
  const [hovered, setHovered] = useState(false);

  const onDragStart = (e) => {
    e.dataTransfer.setData('application/reactflow-type', 'umlClass');
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'grab', userSelect: 'none' }}
    >
      <div style={{
        borderRadius: 10,
        padding: 10,
        border: `2px solid ${hovered ? C.primary : C.border}`,
        backgroundColor: C.bg,
        transition: 'border-color 0.15s',
      }}>
        <div style={{
          border: `1px solid ${hovered ? C.primary : C.border}`,
          borderRadius: 6,
          overflow: 'hidden',
          transition: 'border-color 0.15s',
        }}>
          <div style={{
            padding: '4px 8px',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.05em',
            borderBottom: `1px solid ${C.border}`,
            backgroundColor: '#f1f5f9',
            color: C.label,
          }}>
            CLASS
          </div>
          <div style={{ padding: '2px 8px', fontSize: 10, borderBottom: `1px solid ${C.borderLight}`, color: C.labelLight, backgroundColor: 'white' }}>
            - attribute
          </div>
          <div style={{ padding: '2px 8px', fontSize: 10, color: C.labelLight, backgroundColor: 'white' }}>
            + method()
          </div>
        </div>
        <p style={{
          textAlign: 'center',
          fontSize: 9,
          marginTop: 6,
          color: hovered ? C.primary : C.labelLight,
          transition: 'color 0.15s',
        }}>
          Kéo vào canvas
        </p>
      </div>
    </div>
  );
}

export default function EditorToolbox({ selectedEdgeType, onEdgeTypeChange, viewMode, onViewModeChange }) {
  const [expanded, setExpanded] = useState(false);
  const [tabHovered, setTabHovered] = useState(false);
  const selectedCfg = EDGE_CONFIGS.find((c) => c.type === selectedEdgeType);

  return (
    <div style={{ position: 'absolute', right: 16, top: 16, zIndex: 50 }}>

      {/* TRẠNG THÁI MỞ */}
      {expanded && (
        <div style={{ position: 'relative' }}>

          {/* Nút thu — nhô ra bên TRÁI panel, KHÔNG nằm trong overflow:hidden */}
          <button
            onClick={() => setExpanded(false)}
            onMouseEnter={() => setTabHovered(true)}
            onMouseLeave={() => setTabHovered(false)}
            title="Đóng toolbox"
            style={{
              position: 'absolute',
              top: 12,
              left: -28,
              width: 28,
              height: 32,
              backgroundColor: C.bgPanel,
              border: `1px solid ${C.border}`,
              borderRight: 'none',
              borderRadius: '8px 0 0 8px',
              boxShadow: '-3px 2px 8px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: tabHovered ? C.primary : C.label,
              transition: 'color 0.15s',
              zIndex: 2,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
              <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Panel nội dung */}
          <div style={{
            width: 212,
            backgroundColor: C.bgPanel,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxSizing: 'border-box',
          }}>

            {/* Element */}
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.labelLight, marginBottom: 8 }}>
                Element
              </p>
              <DraggableClassItem />
            </div>

            <div style={{ borderTop: `1px solid ${C.borderLight}` }} />

            {/* View mode */}
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.labelLight, marginBottom: 8 }}>
                View
              </p>
              <div style={{ display: 'flex', gap: 2, padding: 2, backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                {VIEW_MODES.map((mode) => {
                  const isActive = viewMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => onViewModeChange?.(mode.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        padding: '6px 8px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        border: isActive ? `1px solid ${C.border}` : '1px solid transparent',
                        backgroundColor: isActive ? 'white' : 'transparent',
                        color: isActive ? C.primary : C.labelLight,
                        boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span>{mode.icon}</span>
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.borderLight}` }} />

            {/* Relationships */}
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.labelLight, marginBottom: 8 }}>
                Relationship
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {EDGE_CONFIGS.map((cfg) => {
                  const isActive = selectedEdgeType === cfg.type;
                  return (
                    <button
                      key={cfg.type}
                      onClick={() => onEdgeTypeChange(cfg.type)}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = C.bg; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        borderRadius: 10,
                        textAlign: 'left',
                        width: '100%',
                        border: `1px solid ${isActive ? cfg.color : 'transparent'}`,
                        backgroundColor: isActive ? cfg.color + '18' : 'transparent',
                        color: isActive ? cfg.color : C.label,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ color: isActive ? cfg.color : C.labelLight, flexShrink: 0 }}>
                        {EDGE_ICONS[cfg.type]}
                      </span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}>{cfg.label}</div>
                        <div style={{ fontSize: 9, lineHeight: 1.3, opacity: 0.6, marginTop: 2 }}>{cfg.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 8 }}>
              <p style={{ fontSize: 9, lineHeight: 1.6, color: C.ghost }}>
                <span style={{ color: C.danger }}>Del</span> → xóa node/edge đang chọn
              </p>
            </div>

          </div>
        </div>
      )}

      {/* TRẠNG THÁI ĐÓNG */}
      {!expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>

          <button
            onClick={() => setExpanded(true)}
            title="Mở toolbox"
            onMouseEnter={(e) => { e.currentTarget.style.color = C.primary; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = C.label; }}
            style={{
              width: 36,
              height: 36,
              backgroundColor: C.bgPanel,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: C.label,
              transition: 'color 0.15s',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
              <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div style={{
            border: `1px solid ${selectedCfg?.color}60`,
            borderRadius: 12,
            padding: '5px 10px',
            fontSize: 10,
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: C.bgPanel,
            color: selectedCfg?.color,
          }}>
            <span style={{ color: selectedCfg?.color }}>{EDGE_ICONS[selectedEdgeType]}</span>
            <span>{selectedCfg?.label}</span>
          </div>

        </div>
      )}

    </div>
  );
}