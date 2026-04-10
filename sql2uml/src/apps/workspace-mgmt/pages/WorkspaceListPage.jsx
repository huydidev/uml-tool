// src/apps/workspace-mgmt/pages/WorkspaceListPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../shared/constants/Tokens";
import HomeHeader from "../../home/components/HomeHeader";
import Sidebar from "../../home/components/Sidebar";
import WorkspaceCard from "../components/cards/WorkspaceCard";
import NewWorkspaceCard from "../components/cards/NewWorkspaceCard";
import CreateWorkspaceModal from "../components/modals/CreateWorkspaceModal";
import { useWorkspace } from "../hooks/useWorkspace";
import { WORKSPACE_TYPES } from "../constants/workspaceRoles";

function EmptyState({ onNew }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 0",
        gap: tokens.space.lg,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: tokens.color.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke={tokens.color.textMuted}
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontSize: tokens.font.lg,
            fontWeight: tokens.weight.semibold,
            color: tokens.color.textSub,
            marginBottom: 6,
          }}
        >
          Chưa có workspace nào
        </p>
        <p
          style={{
            fontSize: tokens.font.md,
            color: tokens.color.textMuted,
          }}
        >
          Tạo team hoặc lớp học để bắt đầu cộng tác
        </p>
      </div>
      <button
        onClick={onNew}
        style={{
          padding: "10px 24px",
          borderRadius: tokens.radius.md,
          border: "none",
          backgroundColor: tokens.color.primary,
          color: tokens.color.white,
          fontSize: tokens.font.md,
          fontWeight: tokens.weight.semibold,
          cursor: "pointer",
        }}
      >
        Tạo workspace đầu tiên
      </button>
    </div>
  );
}

function FilterTab({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: tokens.radius.md,
        border: "none",
        backgroundColor: active ? tokens.color.primary + "12" : "transparent",
        color: active ? tokens.color.primary : tokens.color.textSub,
        fontSize: tokens.font.md,
        fontWeight: active ? tokens.weight.semibold : tokens.weight.normal,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: tokens.space.xs,
        transition: "all 0.15s",
      }}
    >
      {label}
      {count !== undefined && (
        <span
          style={{
            fontSize: tokens.font.xs,
            fontWeight: tokens.weight.bold,
            padding: "1px 6px",
            borderRadius: tokens.radius.sm,
            backgroundColor: active
              ? tokens.color.primary + "20"
              : tokens.color.surface,
            color: active ? tokens.color.primary : tokens.color.textMuted,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default function WorkspaceListPage() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const { workspaces, loading, error, createWorkspace, deleteWorkspace } =
    useWorkspace();

  const filtered = workspaces.filter((w) => {
    if (filter === "ALL") return true;
    if (filter === "TEAM") return w.type === WORKSPACE_TYPES.TEAM;
    if (filter === "CLASSROOM") return w.type === WORKSPACE_TYPES.CLASSROOM;
    return true;
  });

  const teamCount = workspaces.filter(
    (w) => w.type === WORKSPACE_TYPES.TEAM,
  ).length;
  const classroomCount = workspaces.filter(
    (w) => w.type === WORKSPACE_TYPES.CLASSROOM,
  ).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: tokens.color.bg,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      <HomeHeader activePage="Workspaces" onNavChange={() => {}} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar activeToolId="" onToolChange={() => {}} />

        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: tokens.space.xxl,
          }}
        >
          {/* Title + action */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: tokens.space.xxl,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: tokens.weight.extrabold,
                  color: tokens.color.textBase,
                  letterSpacing: "-0.02em",
                  marginBottom: 6,
                }}
              >
                Workspaces
              </h1>
              <p
                style={{
                  fontSize: tokens.font.md,
                  color: tokens.color.textSub,
                }}
              >
                Quản lý team và lớp học của bạn
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: "8px 18px",
                borderRadius: tokens.radius.md,
                border: "none",
                backgroundColor: tokens.color.primary,
                color: tokens.color.white,
                fontSize: tokens.font.md,
                fontWeight: tokens.weight.semibold,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: tokens.space.xs,
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tạo workspace
            </button>
          </div>

          {/* Filter tabs */}
          {workspaces.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: tokens.space.xs,
                marginBottom: tokens.space.xl,
              }}
            >
              <FilterTab
                label="Tất cả"
                count={workspaces.length}
                active={filter === "ALL"}
                onClick={() => setFilter("ALL")}
              />
              <FilterTab
                label="Team"
                count={teamCount}
                active={filter === "TEAM"}
                onClick={() => setFilter("TEAM")}
              />
              <FilterTab
                label="Lớp học"
                count={classroomCount}
                active={filter === "CLASSROOM"}
                onClick={() => setFilter("CLASSROOM")}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: tokens.radius.md,
                marginBottom: tokens.space.lg,
                backgroundColor: "#fff1f2",
                border: "1px solid #fecdd3",
                fontSize: tokens.font.md,
                color: tokens.color.danger,
              }}
            >
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 200,
                color: tokens.color.textMuted,
                fontSize: tokens.font.md,
              }}
            >
              Đang tải...
            </div>
          ) : workspaces.length === 0 ? (
            <EmptyState onNew={() => setShowCreateModal(true)} />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: tokens.space.lg,
              }}
            >
              <NewWorkspaceCard onClick={() => setShowCreateModal(true)} />
              {filtered.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onDelete={deleteWorkspace}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createWorkspace}
      />
    </div>
  );
}
