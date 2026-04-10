// src/apps/workspace-mgmt/components/grade/GradePanel.jsx

import { useState } from "react";
import { tokens } from "../../../../shared/constants/Tokens";
import GradeCard from "./GradeCard";
import GradeForm from "./GradeForm";
import { useGrades } from "../../hooks/useGrades";
import { canGrade } from "../../constants/workspaceRoles";

export default function GradePanel({ workspaceId, myRole, members, diagrams }) {
  const [selectedDiagram, setSelectedDiagram] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { grades, loading, upsertGrade } = useGrades(workspaceId);

  const isTeacher = canGrade(myRole);

  // Lấy grade của 1 diagram
  const getGradeForDiagram = (diagramId, studentId) =>
    grades.find(
      (g) => g.diagramId === diagramId && g.studentId === studentId,
    ) || null;

  // Filter diagrams theo search
  const filteredDiagrams = (diagrams || []).filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.title?.toLowerCase().includes(q) || d.ownerId?.toLowerCase().includes(q)
    );
  });

  // Tìm student name từ members
  const getStudentName = (studentId) =>
    members?.find((m) => m.userId === studentId)?.userName || studentId;

  const handleGradeSubmit = async (payload) => {
    await upsertGrade(payload);
    setShowForm(false);
    setSelectedDiagram(null);
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "32px 0",
          textAlign: "center",
          color: tokens.color.textMuted,
          fontSize: tokens.font.md,
        }}
      >
        Đang tải...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: tokens.space.xl,
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
        <div>
          <h2
            style={{
              fontSize: tokens.font.lg,
              fontWeight: tokens.weight.bold,
              color: tokens.color.textBase,
              marginBottom: 3,
            }}
          >
            {isTeacher ? "Chấm điểm" : "Điểm của tôi"}
          </h2>
          <p
            style={{
              fontSize: tokens.font.sm,
              color: tokens.color.textSub,
            }}
          >
            {isTeacher
              ? `${grades.length} diagram đã chấm`
              : `${grades.length} điểm`}
          </p>
        </div>

        {/* Search — teacher only */}
        {isTeacher && (
          <div
            style={{
              position: "relative",
              width: 220,
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke={tokens.color.textMuted}
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm diagram..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px 12px 8px 30px",
                borderRadius: tokens.radius.md,
                border: `1px solid ${tokens.color.border}`,
                backgroundColor: tokens.color.surface,
                fontSize: tokens.font.md,
                color: tokens.color.textBase,
                outline: "none",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = tokens.color.primary)
              }
              onBlur={(e) => (e.target.style.borderColor = tokens.color.border)}
            />
          </div>
        )}
      </div>

      {/* Grade form — khi teacher chọn diagram để chấm */}
      {showForm && selectedDiagram && (
        <GradeForm
          diagramId={selectedDiagram.id}
          diagramTitle={selectedDiagram.title}
          studentId={selectedDiagram.ownerId}
          studentName={getStudentName(selectedDiagram.ownerId)}
          existingGrade={getGradeForDiagram(
            selectedDiagram.id,
            selectedDiagram.ownerId,
          )}
          onSubmit={handleGradeSubmit}
          onCancel={() => {
            setShowForm(false);
            setSelectedDiagram(null);
          }}
        />
      )}

      {/* Teacher view — danh sách diagrams để chấm */}
      {isTeacher && !showForm && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space.sm,
          }}
        >
          {filteredDiagrams.length === 0 ? (
            <div
              style={{
                padding: "32px 0",
                textAlign: "center",
                color: tokens.color.textMuted,
                fontSize: tokens.font.md,
              }}
            >
              Chưa có diagram nào trong workspace
            </div>
          ) : (
            filteredDiagrams.map((diagram) => {
              const grade = getGradeForDiagram(diagram.id, diagram.ownerId);
              const studentName = getStudentName(diagram.ownerId);

              return (
                <div
                  key={diagram.id}
                  style={{
                    backgroundColor: tokens.color.white,
                    borderRadius: tokens.radius.lg,
                    border: `1px solid ${tokens.color.border}`,
                    padding: tokens.space.md,
                    display: "flex",
                    alignItems: "center",
                    gap: tokens.space.md,
                  }}
                >
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
                      flexShrink: 0,
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

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: tokens.font.md,
                        fontWeight: tokens.weight.semibold,
                        color: tokens.color.textBase,
                        marginBottom: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {diagram.title || "Untitled"}
                    </p>
                    <p
                      style={{
                        fontSize: tokens.font.sm,
                        color: tokens.color.textSub,
                      }}
                    >
                      {studentName}
                    </p>
                  </div>

                  {/* Score */}
                  {grade && (
                    <span
                      style={{
                        fontSize: tokens.font.md,
                        fontWeight: tokens.weight.bold,
                        color: tokens.color.primary,
                        padding: "4px 12px",
                        borderRadius: tokens.radius.md,
                        backgroundColor: tokens.color.primary + "12",
                      }}
                    >
                      {grade.score}
                    </span>
                  )}

                  {/* Grade button */}
                  <button
                    onClick={() => {
                      setSelectedDiagram(diagram);
                      setShowForm(true);
                    }}
                    style={{
                      padding: "7px 14px",
                      borderRadius: tokens.radius.md,
                      border: `1px solid ${
                        grade
                          ? tokens.color.border
                          : tokens.color.primary + "40"
                      }`,
                      backgroundColor: grade
                        ? tokens.color.surface
                        : tokens.color.primary + "10",
                      fontSize: tokens.font.sm,
                      fontWeight: tokens.weight.semibold,
                      color: grade
                        ? tokens.color.textSub
                        : tokens.color.primary,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    {grade ? "Sửa điểm" : "Chấm điểm"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Student view — danh sách grades của mình */}
      {!isTeacher && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space.sm,
          }}
        >
          {grades.length === 0 ? (
            <div
              style={{
                padding: "32px 0",
                textAlign: "center",
                color: tokens.color.textMuted,
                fontSize: tokens.font.md,
              }}
            >
              Chưa có điểm nào
            </div>
          ) : (
            grades.map((grade) => (
              <GradeCard key={grade.id} grade={grade} showStudent={false} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
