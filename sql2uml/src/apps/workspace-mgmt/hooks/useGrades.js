// src/apps/workspace-mgmt/hooks/useGrades.js

import { useState, useEffect, useCallback } from "react";
import { gradeApi } from "../api/gradeApi";

export function useGrades(workspaceId) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGrades = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await gradeApi.getWorkspaceGrades(workspaceId);
      setGrades(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const upsertGrade = useCallback(
    async (payload) => {
      const data = await gradeApi.upsertGrade(workspaceId, payload);
      setGrades((prev) => {
        const exists = prev.find(
          (g) =>
            g.diagramId === payload.diagramId &&
            g.studentId === payload.studentId,
        );
        if (exists) {
          return prev.map((g) =>
            g.diagramId === payload.diagramId &&
            g.studentId === payload.studentId
              ? data
              : g,
          );
        }
        return [data, ...prev];
      });
      return data;
    },
    [workspaceId],
  );

  const deleteGrade = useCallback(
    async (gradeId) => {
      await gradeApi.deleteGrade(workspaceId, gradeId);
      setGrades((prev) => prev.filter((g) => g.id !== gradeId));
    },
    [workspaceId],
  );

  return {
    grades,
    loading,
    error,
    fetchGrades,
    upsertGrade,
    deleteGrade,
  };
}
