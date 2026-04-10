// src/apps/workspace-mgmt/hooks/useWorkspace.js

import { useState, useEffect, useCallback } from "react";
import { workspaceApi } from "../api/workspaceApi";

export function useWorkspace() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workspaceApi.getMyWorkspaces();
      setWorkspaces(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const createWorkspace = useCallback(async (payload) => {
    const data = await workspaceApi.create(payload);
    setWorkspaces((prev) => [data, ...prev]);
    return data;
  }, []);

  const deleteWorkspace = useCallback(async (id) => {
    await workspaceApi.delete(id);
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const updateWorkspace = useCallback(async (id, payload) => {
    const data = await workspaceApi.update(id, payload);
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? data : w)));
    return data;
  }, []);

  return {
    workspaces,
    loading,
    error,
    fetchWorkspaces,
    createWorkspace,
    deleteWorkspace,
    updateWorkspace,
  };
}
