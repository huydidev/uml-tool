// src/apps/workspace/pages/editor/EditorRightPanel.jsx
// Sửa để thêm CommentPanel

import EdgeSettings from "../../components/canvas/edges/EdgeSettings";
import { THEME } from "../../../../shared/constants/theme";
import { useState } from "react";
import NodeProperties from "../../components/panel/NodeProperties";
import CommentPanel from "../../components/canvas/comments/CommentPanel";

export default function EditorRightPanel({
  selectedEdge,
  selectedNode,
  onEdgeUpdate,
  onEdgeDelete,
  onNodeUpdate,
  onNodeClose,
  // Comment props
  diagramId,
  comments,
  commentsLoading,
  currentUserId,
  onAddComment,
  onResolveComment,
  onDeleteComment,
}) {
  const [activeTab, setActiveTab] = useState("properties");

  // Không có gì được chọn + không có tab nào → không hiện
  if (!selectedEdge && !selectedNode) return null;

  const tabs = [
    { id: "properties", label: "Properties" },
    { id: "comments", label: "Comments" },
  ];

  return (
    <div
      style={{
        width: 260,
        borderLeft: `1px solid ${THEME.colors.SURFACE}`,
        backgroundColor: THEME.colors.SURFACE,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Tab bar — chỉ hiện khi có node được chọn */}
      {selectedNode && (
        <div
          style={{
            display: "flex",
            borderBottom: `1px solid ${THEME.colors.PRIMARY}20`,
            flexShrink: 0,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "8px 0",
                border: "none",
                borderBottom: `2px solid ${
                  activeTab === tab.id ? THEME.colors.PRIMARY : "transparent"
                }`,
                backgroundColor: "transparent",
                fontSize: 11,
                fontWeight: 600,
                color:
                  activeTab === tab.id
                    ? THEME.colors.PRIMARY
                    : THEME.colors.MUTED,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {/* Edge settings */}
        {selectedEdge && (
          <EdgeSettings
            edge={selectedEdge}
            onUpdate={onEdgeUpdate}
            onDelete={onEdgeDelete}
          />
        )}

        {/* Node properties */}
        {selectedNode && activeTab === "properties" && (
          <NodeProperties
            node={selectedNode}
            onClose={onNodeClose}
            onUpdate={onNodeUpdate}
          />
        )}

        {/* Comments */}
        {selectedNode && activeTab === "comments" && (
          <CommentPanel
            diagramId={diagramId}
            nodeId={selectedNode.id}
            nodeName={selectedNode.data?.label}
            comments={comments}
            loading={commentsLoading}
            currentUserId={currentUserId}
            onAdd={onAddComment}
            onResolve={onResolveComment}
            onDelete={onDeleteComment}
          />
        )}
      </div>
    </div>
  );
}
