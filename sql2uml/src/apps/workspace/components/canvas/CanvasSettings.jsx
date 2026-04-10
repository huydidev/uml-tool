// src/apps/workspace/components/canvas/CanvasSettings.jsx
// Panel cài đặt canvas — background + minimap toggle

import { tokens } from "../../../../shared/constants/Tokens";

const BG_OPTIONS = [
  {
    id: "dots",
    label: "Chấm bi",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20">
        {[4, 10, 16].map((x) =>
          [4, 10, 16].map((y) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" fill="#94a3b8" />
          )),
        )}
      </svg>
    ),
  },
  {
    id: "lines",
    label: "Kẻ sọc",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20">
        {[3, 8, 13, 18].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="20"
            y2={y}
            stroke="#94a3b8"
            strokeWidth="0.8"
          />
        ))}
      </svg>
    ),
  },
  {
    id: "cross",
    label: "Lưới",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20">
        {[4, 10, 16].map((x) => (
          <line
            key={`v${x}`}
            x1={x}
            y1="0"
            x2={x}
            y2="20"
            stroke="#94a3b8"
            strokeWidth="0.8"
          />
        ))}
        {[4, 10, 16].map((y) => (
          <line
            key={`h${y}`}
            x1="0"
            y1={y}
            x2="20"
            y2={y}
            stroke="#94a3b8"
            strokeWidth="0.8"
          />
        ))}
      </svg>
    ),
  },
  {
    id: "none",
    label: "Trắng",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20">
        <rect
          x="1"
          y="1"
          width="18"
          height="18"
          rx="3"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1"
        />
      </svg>
    ),
  },
];

export default function CanvasSettings({
  background,
  onBackgroundChange,
  showMinimap,
  onMinimapToggle,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 12,
      }}
    >
      {/* Header */}
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#8E8E93",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Cài đặt Canvas
      </span>

      {/* Background */}
      <div>
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#8E8E93",
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Nền
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
          }}
        >
          {BG_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onBackgroundChange(opt.id)}
              style={{
                padding: "8px",
                borderRadius: 8,
                border: `1.5px solid ${
                  background === opt.id ? "#007AFF" : "#e2e8f0"
                }`,
                backgroundColor:
                  background === opt.id ? "#007AFF10" : "transparent",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                transition: "all 0.15s",
              }}
            >
              {opt.icon}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: background === opt.id ? "#007AFF" : "#6B7280",
                }}
              >
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Minimap toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#1C1C1E",
              marginBottom: 2,
            }}
          >
            Minimap
          </p>
          <p
            style={{
              fontSize: 10,
              color: "#8E8E93",
            }}
          >
            Bản đồ tổng quan
          </p>
        </div>
        <div
          onClick={onMinimapToggle}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            backgroundColor: showMinimap ? "#007AFF" : "#e2e8f0",
            cursor: "pointer",
            transition: "background 0.2s",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              position: "absolute",
              top: 3,
              left: showMinimap ? 23 : 3,
              transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
