// src/apps/workspace/components/canvas/edges/EdgeSettings.jsx
// Panel hiện khi click vào edge — cho phép đổi cardinality + type

import { useState } from "react";
import { EDGE_CONFIGS } from "../../../../../shared/constants/edgeConfigs";

const CARDINALITY_PRESETS = [
  { label: "1 : 1", source: "1", target: "1" },
  { label: "1 : N", source: "1", target: "N" },
  { label: "N : 1", source: "N", target: "1" },
  { label: "N : N", source: "N", target: "N" },
  { label: "0..1 : N", source: "0..1", target: "N" },
  { label: "1..* : N", source: "1..*", target: "N" },
];

export default function EdgeSettings({ edge, onUpdate, onDelete }) {
  if (!edge) return null;

  const sourceLabel = edge.data?.sourceLabel || "1";
  const targetLabel = edge.data?.targetLabel || "N";

  const handlePreset = (preset) => {
    onUpdate(edge.id, {
      data: {
        ...edge.data,
        sourceLabel: preset.source,
        targetLabel: preset.target,
        cardinality: `${preset.source}:${preset.target}`,
      },
    });
  };

  const handleTypeChange = (type) => {
    onUpdate(edge.id, { type });
  };

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#8E8E93",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Relationship
        </span>
        <button
          onClick={() => onDelete(edge.id)}
          style={{
            fontSize: 10,
            color: "#FF3B30",
            border: "none",
            background: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Xóa
        </button>
      </div>

      {/* Relationship type */}
      <div>
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#8E8E93",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Loại quan hệ
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {EDGE_CONFIGS.map((cfg) => (
            <button
              key={cfg.type}
              onClick={() => handleTypeChange(cfg.type)}
              style={{
                padding: "6px 10px",
                borderRadius: 7,
                border: "none",
                backgroundColor:
                  edge.type === cfg.type ? cfg.color + "20" : "transparent",
                color: edge.type === cfg.type ? cfg.color : "#6B7280",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.15s",
              }}
            >
              <span
                style={{
                  width: 16,
                  textAlign: "center",
                  fontSize: 13,
                }}
              >
                {cfg.icon}
              </span>
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cardinality presets */}
      <div>
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#8E8E93",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Bản số
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 4,
          }}
        >
          {CARDINALITY_PRESETS.map((preset) => {
            const isActive =
              sourceLabel === preset.source && targetLabel === preset.target;
            return (
              <button
                key={preset.label}
                onClick={() => handlePreset(preset)}
                style={{
                  padding: "5px 8px",
                  borderRadius: 7,
                  border: `1px solid ${isActive ? "#007AFF" : "#e2e8f0"}`,
                  backgroundColor: isActive ? "#007AFF10" : "transparent",
                  color: isActive ? "#007AFF" : "#6B7280",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "monospace",
                  transition: "all 0.15s",
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current cardinality display */}
      <div
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontFamily: "monospace",
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#007AFF",
          }}
        >
          {sourceLabel}
        </span>
        <span
          style={{
            flex: 1,
            height: 1.5,
            backgroundColor: "#cbd5e1",
          }}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#007AFF",
          }}
        >
          {targetLabel}
        </span>
      </div>
    </div>
  );
}
