// src/apps/workspace-mgmt/pages/WorkspaceDetailPage.jsx
// Thêm DeadlineBanner + pass workspaceId xuống settings

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tokens } from "../../../shared/constants/Tokens";
import HomeHeader from "../../home/components/HomeHeader";
import MemberList from "../components/members/MemberList";
import InviteMemberModal from "../components/modals/InviteMemberModal";
import GradePanel from "../components/grade/GradePanel";
import { workspaceApi } from "../api/workspaceApi";
import { useWorkspaceMembers } from "../hooks/useWorkspaceMembers";
import {
  WORKSPACE_TYPES,
  WORKSPACE_ROLES,
  TYPE_LABELS,
  TYPE_COLORS,
  ROLE_LABELS,
  ROLE_COLORS,
  canManageMembers,
  canGrade,
} from "../constants/workspaceRoles";

// ── Deadline Banner ───────────────────────────────────────────────
function DeadlineBanner({ deadline, isLocked }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!deadline) return;
    const calc = () => {
      const diff = new Date(deadline) - new Date();
      if (diff <= 0) {
        setTimeLeft("");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(h > 0 ? `${h} giờ ${m} phút` : `${m} phút`);
    };
    calc();
    const timer = setInterval(calc, 60000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (!deadline) return null;

  // Đã hết hạn
  if (isLocked) {
    return (
      <div
        style={{
          padding: "10px 16px",
          backgroundColor: "#fee2e2",
          border: "1px solid #fecaca",
          borderRadius: tokens.radius.md,
          display: "flex",
          alignItems: "center",
          gap: tokens.space.sm,
        }}
      >
        <span style={{ fontSize: 16 }}>🔒</span>
        <div>
          <p
            style={{
              fontSize: tokens.font.md,
              fontWeight: tokens.weight.semibold,
              color: tokens.color.danger,
            }}
          >
            Đã hết hạn nộp bài
          </p>
          <p style={{ fontSize: tokens.font.sm, color: "#ef4444" }}>
            Hạn nộp:{" "}
            {new Date(deadline).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    );
  }

  // Còn hạn nhưng < 24h mới hiện
  const diff = new Date(deadline) - new Date();
  if (!timeLeft || diff > 24 * 3600000) return null;

  return (
    <div
      style={{
        padding: "10px 16px",
        backgroundColor: "#fef9c3",
        border: "1px solid #fde68a",
        borderRadius: tokens.radius.md,
        display: "flex",
        alignItems: "center",
        gap: tokens.space.sm,
      }}
    >
      <span style={{ fontSize: 16 }}>⏰</span>
      <p
        style={{
          fontSize: tokens.font.md,
          fontWeight: tokens.weight.semibold,
          color: "#854d0e",
        }}
      >
        Còn {timeLeft} để nộp bài
      </p>
    </div>
  );
}

// ── Tab navigation ────────────────────────────────────────────────
function TabBar({ tabs, active, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        borderBottom: `1px solid ${tokens.color.border}`,
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: "10px 20px",
              border: "none",
              borderBottom: `2px solid ${
                isActive ? tokens.color.primary : "transparent"
              }`,
              backgroundColor: "transparent",
              fontSize: tokens.font.md,
              fontWeight: isActive
                ? tokens.weight.semibold
                : tokens.weight.normal,
              color: isActive ? tokens.color.primary : tokens.color.textSub,
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: tokens.space.xs,
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: tokens.font.xs,
                  fontWeight: tokens.weight.bold,
                  padding: "1px 6px",
                  borderRadius: tokens.radius.sm,
                  backgroundColor: isActive
                    ? tokens.color.primary + "20"
                    : tokens.color.surface,
                  color: isActive
                    ? tokens.color.primary
                    : tokens.color.textMuted,
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Diagram card ──────────────────────────────────────────────────
function DiagramCard({ diagram, myRole, isLocked, onClick }) {
  const [hovered, setHovered] = useState(false);

  const isStudent = myRole === WORKSPACE_ROLES.STUDENT;
  const locked = isLocked && isStudent;

  return (
    <div
      onClick={locked ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: tokens.color.white,
        border: `1px solid ${
          hovered && !locked ? tokens.color.primary + "60" : tokens.color.border
        }`,
        borderRadius: tokens.radius.lg,
        padding: tokens.space.lg,
        cursor: locked ? "not-allowed" : "pointer",
        transition: "all 0.18s",
        display: "flex",
        flexDirection: "column",
        gap: tokens.space.sm,
        boxShadow: hovered && !locked ? tokens.shadow.md : tokens.shadow.sm,
        transform: hovered && !locked ? "translateY(-1px)" : "none",
        opacity: locked ? 0.7 : 1,
        position: "relative",
      }}
    >
      {/* Lock badge */}
      {locked && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: 14,
          }}
        >
          🔒
        </div>
      )}

      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: tokens.radius.md,
          backgroundColor: tokens.color.primary + "12",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={tokens.color.primary}
          strokeWidth="2"
          strokeLinecap="round"
        >
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      </div>

      {/* Title */}
      <p
        style={{
          fontSize: tokens.font.md,
          fontWeight: tokens.weight.semibold,
          color: tokens.color.textBase,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {diagram.title || "Untitled Diagram"}
      </p>

      {/* Owner info — teacher xem */}
      {[WORKSPACE_ROLES.OWNER, WORKSPACE_ROLES.TEACHER].includes(myRole) && (
        <p
          style={{
            fontSize: tokens.font.sm,
            color: tokens.color.textMuted,
          }}
        >
          {diagram.ownerId}
        </p>
      )}
    </div>
  );
}

// ── New diagram card ──────────────────────────────────────────────
function NewDiagramCard({ onClick, disabled }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? tokens.color.primary + "06" : "#fafbfc",
        border: `1.5px dashed ${
          hovered ? tokens.color.primary : tokens.color.border
        }`,
        borderRadius: tokens.radius.lg,
        padding: tokens.space.lg,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.18s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: tokens.space.sm,
        minHeight: 120,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: `1.5px solid ${tokens.color.primary}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tokens.color.primary,
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <p
        style={{
          fontSize: tokens.font.sm,
          fontWeight: tokens.weight.semibold,
          color: tokens.color.textBase,
        }}
      >
        Tạo diagram mới
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function WorkspaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("diagrams");
  const [creating, setCreating] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const {
    members,
    pending,
    loading: membersLoading,
    invite,
    approve,
    reject,
    remove,
    changeRole,
  } = useWorkspaceMembers(id);

  // Load workspace + diagrams
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [wsData, diagData] = await Promise.all([
          workspaceApi.getById(id),
          workspaceApi.getDiagrams(id),
        ]);
        setWorkspace(wsData);
        setDiagrams(diagData);
      } catch (e) {
        if (e.message === "FORBIDDEN") {
          navigate("/workspaces");
          return;
        }
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, navigate]);

  // Tạo diagram mới
  const handleNewDiagram = useCallback(async () => {
    if (!workspace) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/diagrams/workspace/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: "Untitled Diagram",
          description: "",
          nodes: [],
          edges: [],
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      navigate(`/editor/${data.id}`);
    } catch {
      setError("Không tạo được diagram");
    } finally {
      setCreating(false);
    }
  }, [workspace, id, navigate]);

  const handleInvite = useCallback(
    async (emails, role) => {
      return await invite(emails, role);
    },
    [invite],
  );

  if (loading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tokens.color.bg,
          fontSize: tokens.font.md,
          color: tokens.color.textMuted,
        }}
      >
        Đang tải...
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: tokens.space.lg,
        }}
      >
        <p style={{ color: tokens.color.danger, fontSize: tokens.font.lg }}>
          {error || "Không tìm thấy workspace"}
        </p>
        <button
          onClick={() => navigate("/workspaces")}
          style={{
            padding: "8px 20px",
            borderRadius: tokens.radius.md,
            border: "none",
            backgroundColor: tokens.color.primary,
            color: tokens.color.white,
            fontSize: tokens.font.md,
            fontWeight: tokens.weight.semibold,
            cursor: "pointer",
          }}
        >
          Quay lại
        </button>
      </div>
    );
  }

  const myRole = workspace.myRole;
  const isClassroom = workspace.type === WORKSPACE_TYPES.CLASSROOM;
  const isLocked = workspace.isLocked;
  const typeStyle = TYPE_COLORS[workspace.type];
  const roleStyle = ROLE_COLORS[myRole] || ROLE_COLORS.MEMBER;

  // Student không tạo diagram khi đã locked
  const canCreateDiagram =
    !isLocked ||
    myRole === WORKSPACE_ROLES.OWNER ||
    myRole === WORKSPACE_ROLES.TEACHER;

  const tabs = [
    { id: "diagrams", label: "Diagrams", count: diagrams.length },
    {
      id: "members",
      label: "Thành viên",
      count: members.length + (pending.length > 0 ? ` +${pending.length}` : ""),
    },
    ...(isClassroom
      ? [
          {
            id: "grades",
            label: canGrade(myRole) ? "Chấm điểm" : "Điểm của tôi",
          },
        ]
      : []),
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: tokens.color.bg,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      <HomeHeader activePage="Workspaces" onNavChange={() => {}} />

      <div
        style={{
          flex: 1,
          maxWidth: 1100,
          margin: "0 auto",
          width: "100%",
          padding: `${tokens.space.xxl}px ${tokens.space.xl}px`,
          display: "flex",
          flexDirection: "column",
          gap: tokens.space.xl,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: tokens.space.lg,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: tokens.space.md,
            }}
          >
            <button
              onClick={() => navigate("/workspaces")}
              style={{
                width: 34,
                height: 34,
                borderRadius: tokens.radius.md,
                border: `1px solid ${tokens.color.border}`,
                backgroundColor: tokens.color.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: tokens.color.textSub,
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>

            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.space.sm,
                  flexWrap: "wrap",
                  marginBottom: 6,
                }}
              >
                <h1
                  style={{
                    fontSize: 24,
                    fontWeight: tokens.weight.extrabold,
                    color: tokens.color.textBase,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {workspace.name}
                </h1>
                <span
                  style={{
                    fontSize: tokens.font.xs,
                    fontWeight: tokens.weight.bold,
                    padding: "3px 9px",
                    borderRadius: tokens.radius.sm,
                    backgroundColor: typeStyle.bg,
                    color: typeStyle.color,
                  }}
                >
                  {TYPE_LABELS[workspace.type]}
                </span>
                <span
                  style={{
                    fontSize: tokens.font.xs,
                    fontWeight: tokens.weight.bold,
                    padding: "3px 9px",
                    borderRadius: tokens.radius.sm,
                    backgroundColor: roleStyle.bg,
                    color: roleStyle.color,
                  }}
                >
                  {ROLE_LABELS[myRole]}
                </span>

                {/* Lock badge nếu đã hết hạn */}
                {isLocked && (
                  <span
                    style={{
                      fontSize: tokens.font.xs,
                      fontWeight: tokens.weight.bold,
                      padding: "3px 9px",
                      borderRadius: tokens.radius.sm,
                      backgroundColor: "#fee2e2",
                      color: tokens.color.danger,
                    }}
                  >
                    🔒 Đã khóa
                  </span>
                )}
              </div>

              {workspace.description && (
                <p
                  style={{
                    fontSize: tokens.font.md,
                    color: tokens.color.textSub,
                  }}
                >
                  {workspace.description}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: tokens.space.lg,
                  marginTop: tokens.space.sm,
                }}
              >
                <span
                  style={{
                    fontSize: tokens.font.sm,
                    color: tokens.color.textMuted,
                  }}
                >
                  {workspace.memberCount || 0} thành viên
                </span>
                <span
                  style={{
                    fontSize: tokens.font.sm,
                    color: tokens.color.textMuted,
                  }}
                >
                  {diagrams.length} diagram
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: tokens.space.sm,
              flexShrink: 0,
            }}
          >
            {canManageMembers(myRole) && (
              <button
                onClick={() => setShowInvite(true)}
                style={{
                  padding: "8px 16px",
                  borderRadius: tokens.radius.md,
                  border: `1px solid ${tokens.color.border}`,
                  backgroundColor: tokens.color.white,
                  fontSize: tokens.font.md,
                  fontWeight: tokens.weight.semibold,
                  color: tokens.color.textBase,
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
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                Mời thành viên
              </button>
            )}

            <button
              onClick={() => navigate(`/workspaces/${id}/settings`)}
              style={{
                width: 36,
                height: 36,
                borderRadius: tokens.radius.md,
                border: `1px solid ${tokens.color.border}`,
                backgroundColor: tokens.color.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: tokens.color.textSub,
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Deadline Banner ─────────────────────────────────────── */}
        {isClassroom && (
          <DeadlineBanner deadline={workspace.deadline} isLocked={isLocked} />
        )}

        {/* Tab bar */}
        <div
          style={{
            backgroundColor: tokens.color.white,
            borderRadius: tokens.radius.xl,
            border: `1px solid ${tokens.color.border}`,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: `0 ${tokens.space.lg}px` }}>
            <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
          </div>

          <div style={{ padding: tokens.space.xl }}>
            {/* Diagrams tab */}
            {activeTab === "diagrams" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: tokens.space.md,
                }}
              >
                {/* Chỉ hiện nút tạo mới nếu chưa locked hoặc là teacher */}
                {canCreateDiagram && (
                  <NewDiagramCard
                    onClick={handleNewDiagram}
                    disabled={creating}
                  />
                )}

                {diagrams.map((diagram) => (
                  <DiagramCard
                    key={diagram.id}
                    diagram={diagram}
                    myRole={myRole}
                    isLocked={isLocked}
                    onClick={() => navigate(`/editor/${diagram.id}`)}
                  />
                ))}

                {diagrams.length === 0 && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      padding: "32px 0",
                      textAlign: "center",
                      color: tokens.color.textMuted,
                      fontSize: tokens.font.md,
                    }}
                  >
                    Chưa có diagram nào — tạo mới để bắt đầu!
                  </div>
                )}
              </div>
            )}

            {/* Members tab */}
            {activeTab === "members" && (
              <MemberList
                members={members}
                pending={pending}
                myRole={myRole}
                loading={membersLoading}
                onRemove={remove}
                onChangeRole={changeRole}
                onApprove={approve}
                onReject={reject}
              />
            )}

            {/* Grades tab */}
            {activeTab === "grades" && isClassroom && (
              <GradePanel
                workspaceId={id}
                myRole={myRole}
                members={members}
                diagrams={diagrams}
              />
            )}
          </div>
        </div>
      </div>

      <InviteMemberModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        workspaceType={workspace.type}
        onInvite={handleInvite}
      />
    </div>
  );
}
