// src/apps/workspace-mgmt/hooks/useWorkspaceMembers.js

import { useState, useEffect, useCallback } from "react";
import { memberApi } from "../api/memberApi";

export function useWorkspaceMembers(workspaceId) {
  const [members, setMembers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const [activeData, pendingData] = await Promise.all([
        memberApi.getMembers(workspaceId),
        memberApi.getPendingMembers(workspaceId).catch(() => []),
      ]);
      setMembers(activeData);
      setPending(pendingData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const invite = useCallback(
    async (emails, role) => {
      const result = await memberApi.invite(workspaceId, emails, role);
      await fetchMembers();
      return result;
    },
    [workspaceId, fetchMembers],
  );

  const approve = useCallback(
    async (userId) => {
      await memberApi.approveMember(workspaceId, userId, "ACTIVE");
      await fetchMembers();
    },
    [workspaceId, fetchMembers],
  );

  const reject = useCallback(
    async (userId) => {
      await memberApi.approveMember(workspaceId, userId, "REJECTED");
      await fetchMembers();
    },
    [workspaceId, fetchMembers],
  );

  const remove = useCallback(
    async (userId) => {
      await memberApi.removeMember(workspaceId, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    },
    [workspaceId],
  );

  const changeRole = useCallback(
    async (userId, role) => {
      const updated = await memberApi.changeRole(workspaceId, userId, role);
      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, role } : m)),
      );
      return updated;
    },
    [workspaceId],
  );

  return {
    members,
    pending,
    loading,
    error,
    fetchMembers,
    invite,
    approve,
    reject,
    remove,
    changeRole,
  };
}
