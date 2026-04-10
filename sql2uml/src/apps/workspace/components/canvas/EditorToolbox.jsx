// src/apps/workspace/components/canvas/EditorToolbox.jsx

import { useState } from "react";
import { THEME } from "../../../../shared/constants/theme";
import { EDGE_CONFIGS } from "../../../../shared/constants/edgeConfigs";

const EDGE_ICONS = {
  association: (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
      <line
        x1="4"
        y1="12"
        x2="18"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <polyline
        points="13,7 18,12 13,17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  inheritance: (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
      <line
        x1="4"
        y1="12"
        x2="16"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <polygon
        points="16,7 22,12 16,17"
        stroke="currentColor"
        strokeWidth="2"
        fill="white"
        strokeLinejoin="round"
      />
    </svg>
  ),
  aggregation: (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
      <line
        x1="10"
        y1="12"
        x2="20"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <polygon
        points="2,12 6,8 10,12 6,16"
        stroke="currentColor"
        strokeWidth="2"
        fill="white"
        strokeLinejoin="round"
      />
      <polyline
        points="15,8 20,12 15,16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  composition: (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
      <line
        x1="10"
        y1="12"
        x2="20"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <polygon
        points="2,12 6,8 10,12 6,16"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        strokeLinejoin="round"
      />
      <polyline
        points="15,8 20,12 15,16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const BG_OPTIONS = [
  { id: "dots", label: "⠿ Chấm" },
  { id: "lines", label: "≡ Sọc" },
  { id: "cross", label: "# Lưới" },
  { id: "none", label: "□ Trắng" },
];

// ── Tooltip + button ──────────────────────────────────────────────
function ToolBtn({
  icon,
  label,
  active,
  color,
  onClick,
  onDragStart,
  draggable,
}) {
  const [hovered, setHovered] = useState(false);
  const accentColor = color || THEME.colors.PRIMARY;

  return (
    <div
      style={{ position: "relative", display: "flex", alignItems: "center" }}
    >
      {hovered && (
        <div
          style={{
            position: "absolute",
            right: 44,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "#1C1C1E",
            color: "#ffffff",
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 7,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 100,
          }}
        >
          {label}
          <div
            style={{
              position: "absolute",
              right: -5,
              top: "50%",
              transform: "translateY(-50%)",
              width: 0,
              height: 0,
              borderTop: "5px solid transparent",
              borderBottom: "5px solid transparent",
              borderLeft: "5px solid #1C1C1E",
            }}
          />
        </div>
      )}
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
          border: `1px solid ${active ? accentColor + "60" : "#e2e8f0"}`,
          backgroundColor: active
            ? accentColor + "15"
            : hovered
              ? "#f8fafc"
              : "#ffffff",
          color: active
            ? accentColor
            : hovered
              ? accentColor
              : THEME.colors.MUTED,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: draggable ? "grab" : "pointer",
          transition: "all 0.15s",
          flexShrink: 0,
        }}
      >
        {icon}
      </button>
    </div>
  );
}

// ── View mode toggle ──────────────────────────────────────────────
function ViewModeToggle({ viewMode, onViewModeChange }) {
  const [hovered, setHovered] = useState(null);
  const MODES = [
    { id: "class", label: "Class" },
    { id: "erd", label: "ERD" },
  ];

  return (
    <div
      style={{ position: "relative", display: "flex", alignItems: "center" }}
    >
      {hovered && (
        <div
          style={{
            position: "absolute",
            right: 44,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "#1C1C1E",
            color: "#ffffff",
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 7,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 100,
          }}
        >
          View: {hovered}
          <div
            style={{
              position: "absolute",
              right: -5,
              top: "50%",
              transform: "translateY(-50%)",
              width: 0,
              height: 0,
              borderTop: "5px solid transparent",
              borderBottom: "5px solid transparent",
              borderLeft: "5px solid #1C1C1E",
            }}
          />
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          padding: 2,
          backgroundColor: "#f1f5f9",
          border: "1px solid #e2e8f0",
          borderRadius: 10,
        }}
      >
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
                padding: "4px 0",
                borderRadius: 8,
                fontSize: 9,
                fontWeight: 700,
                border: isActive
                  ? "1px solid #e2e8f0"
                  : "1px solid transparent",
                backgroundColor: isActive ? "#ffffff" : "transparent",
                color: isActive ? THEME.colors.PRIMARY : THEME.colors.MUTED,
                cursor: "pointer",
                transition: "all 0.15s",
                letterSpacing: "0.03em",
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
    <div
      style={{
        width: 20,
        height: 1,
        backgroundColor: "#e2e8f0",
        alignSelf: "center",
        margin: "2px 0",
      }}
    />
  );
}

// ── Settings popup ────────────────────────────────────────────────
function SettingsPopup({
  background,
  onBackgroundChange,
  showMinimap,
  onMinimapToggle,
}) {
  return (
    <div
      style={{
        position: "absolute",
        right: 44,
        bottom: 0,
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        padding: 12,
        width: 180,
        zIndex: 200,
      }}
    >
      {/* Nền canvas */}
      <p
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: "#8E8E93",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 6,
        }}
      >
        Nền canvas
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 4,
          marginBottom: 10,
        }}
      >
        {BG_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onBackgroundChange(opt.id)}
            style={{
              padding: "5px 6px",
              borderRadius: 7,
              border: `1.5px solid ${
                background === opt.id ? THEME.colors.PRIMARY : "#e2e8f0"
              }`,
              backgroundColor:
                background === opt.id
                  ? THEME.colors.PRIMARY + "12"
                  : "transparent",
              color: background === opt.id ? THEME.colors.PRIMARY : "#6B7280",
              fontSize: 10,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          backgroundColor: "#f1f5f9",
          marginBottom: 10,
        }}
      />

      {/* Minimap toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#374151",
          }}
        >
          Minimap
        </span>
        <div
          onClick={onMinimapToggle}
          style={{
            width: 36,
            height: 20,
            borderRadius: 10,
            backgroundColor: showMinimap ? THEME.colors.PRIMARY : "#e2e8f0",
            cursor: "pointer",
            transition: "background 0.2s",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              position: "absolute",
              top: 3,
              left: showMinimap ? 19 : 3,
              transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function EditorToolbox({
  selectedEdgeType,
  onEdgeTypeChange,
  viewMode,
  onViewModeChange,
  canvasBackground,
  onBackgroundChange,
  showMinimap,
  onMinimapToggle,
}) {
  const [showSettings, setShowSettings] = useState(false);

  const handleEntityDragStart = (e) => {
    e.dataTransfer.setData("application/reactflow-type", "umlClass");
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      style={{
        position: "absolute",
        right: 16,
        top: 16,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        padding: 6,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      {/* Kéo entity */}
      <ToolBtn
        draggable
        onDragStart={handleEntityDragStart}
        label="Kéo vào canvas"
        icon={
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <rect
              x="4"
              y="4"
              width="16"
              height="16"
              rx="3"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="4"
              y1="9"
              x2="20"
              y2="9"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        }
      />

      <Divider />

      <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />

      <Divider />

      {/* Edge types */}
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

      {/* Note */}
      <ToolBtn
        label="Note"
        icon={
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <polyline
              points="14 2 14 8 20 8"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="8"
              y1="13"
              x2="16"
              y2="13"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <line
              x1="8"
              y1="17"
              x2="12"
              y2="17"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        }
      />

      <Divider />

      {/* Settings */}
      <div style={{ position: "relative" }}>
        <ToolBtn
          label="Cài đặt canvas"
          active={showSettings}
          onClick={() => setShowSettings((v) => !v)}
          icon={
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
              />
            </svg>
          }
        />

        {showSettings && (
          <>
            {/* Backdrop click outside */}
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 199,
              }}
              onClick={() => setShowSettings(false)}
            />
            <SettingsPopup
              background={canvasBackground}
              onBackgroundChange={(val) => {
                onBackgroundChange?.(val);
              }}
              showMinimap={showMinimap}
              onMinimapToggle={() => {
                onMinimapToggle?.();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
