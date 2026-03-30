// src/apps/workspace/components/canvas/EditorToolbox.jsx
import { useState } from 'react';
import { THEME } from '../../../../shared/constants/theme';
import { EDGE_CONFIGS } from '../../../../shared/constants/edgeConfigs';

const C = {
  bg:      '#ffffff',
  border:  '#e2e8f0',
  label:   THEME.colors.MUTED,
  primary: THEME.colors.PRIMARY,
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

// ── Tooltip + nút dùng chung ──────────────────────────────────────
function ToolBtn({ icon, label, active, color, onClick, onDragStart, draggable }) {
  const [hovered, setHovered] = useState(false);
  const accentColor = color || C.primary;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>

      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: 'absolute',
          right: 44,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: '#1C1C1E',
          color: '#ffffff',
          fontSize: 11,
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: 7,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 100,
        }}>
          {label}
          <div style={{
            position: 'absolute',
            right: -5, top: '50%',
            transform: 'translateY(-50%)',
            width: 0, height: 0,
            borderTop: '5px solid transparent',
            borderBottom: '5px solid transparent',
            borderLeft: '5px solid #1C1C1E',
          }}/>
        </div>
      )}

      {/* Icon button */}
      <button
        draggable={draggable}
        onClick={onClick}
        onDragStart={onDragStart}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          border: `1px solid ${active ? accentColor + '60' : C.border}`,
          backgroundColor: active ? accentColor + '15' : hovered ? '#f8fafc' : C.bg,
          color: active ? accentColor : hovered ? accentColor : C.label,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: draggable ? 'grab' : 'pointer',
          transition: 'all 0.15s',
          flexShrink: 0,
        }}
      >
        {icon}
      </button>
    </div>
  );
}

// ── View mode toggle: Class / ERD ─────────────────────────────────
function ViewModeToggle({ viewMode, onViewModeChange }) {
  const [hovered, setHovered] = useState(null);

  const MODES = [
    { id: 'class', label: 'Class' },
    { id: 'erd',   label: 'ERD'   },
  ];

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>

      {/* Tooltip hiện tên mode đang active */}
      {hovered && (
        <div style={{
          position: 'absolute',
          right: 44,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: '#1C1C1E',
          color: '#ffffff',
          fontSize: 11,
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: 7,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 100,
        }}>
          View: {hovered}
          <div style={{
            position: 'absolute',
            right: -5, top: '50%',
            transform: 'translateY(-50%)',
            width: 0, height: 0,
            borderTop: '5px solid transparent',
            borderBottom: '5px solid transparent',
            borderLeft: '5px solid #1C1C1E',
          }}/>
        </div>
      )}

      {/* Toggle pill */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: 2,
        backgroundColor: '#f1f5f9',
        border: `1px solid ${C.border}`,
        borderRadius: 10,
      }}>
        {MODES.map((mode) => {
          const isActive = viewMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onViewModeChange?.(mode.id)}
              onMouseEnter={() => setHovered(mode.label)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: 32,
                padding: '4px 0',
                borderRadius: 8,
                fontSize: 9,
                fontWeight: 700,
                border: isActive ? `1px solid ${C.border}` : '1px solid transparent',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                color: isActive ? C.primary : C.label,
                cursor: 'pointer',
                transition: 'all 0.15s',
                letterSpacing: '0.03em',
              }}
            >
              {mode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div style={{
      width: 20, height: 1,
      backgroundColor: C.border,
      alignSelf: 'center',
      margin: '2px 0',
    }}/>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function EditorToolbox({
  selectedEdgeType,
  onEdgeTypeChange,
  viewMode,
  onViewModeChange,
}) {
  // Drag entity vào canvas — giữ nguyên logic cũ
  const handleEntityDragStart = (e) => {
    e.dataTransfer.setData('application/reactflow-type', 'umlClass');
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div style={{
      position: 'absolute',
      right: 16,
      top: 16,
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      backgroundColor: C.bg,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: 6,
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    }}>

      {/* Kéo thả entity vào canvas */}
      <ToolBtn
        draggable
        onDragStart={handleEntityDragStart}
        label="Kéo vào canvas"
        icon={
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2"/>
            <line x1="4" y1="9" x2="20" y2="9" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        }
      />

      <Divider />

      {/* View mode: Class / ERD */}
      <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />

      <Divider />

      {/* Relationship types — giữ nguyên onClick */}
      {EDGE_CONFIGS.map((cfg) => (
        <ToolBtn
          key={cfg.type}
          icon={EDGE_ICONS[cfg.type]}
          label={cfg.label}
          active={selectedEdgeType === cfg.type}
          color={cfg.color}
          onClick={() => onEdgeTypeChange(cfg.type)}
        />
      ))}

      <Divider />

      {/* Note — placeholder, thêm chức năng sau */}
      <ToolBtn
        label="Note"
        icon={
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
            <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/>
            <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="8" y1="17" x2="12" y2="17" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        }
      />

    </div>
  );
}