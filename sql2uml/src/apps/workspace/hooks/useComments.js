// src/apps/workspace/hooks/useComments.js

import { useState, useEffect, useCallback } from "react";
import { commentApi } from "../api/commentApi";

export function useComments(diagramId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!diagramId) return;
    setLoading(true);
    try {
      const data = await commentApi.getComments(diagramId);
      setComments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [diagramId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = useCallback(
    async (content, nodeId = null, parentId = null) => {
      const data = await commentApi.addComment(diagramId, {
        content,
        nodeId,
        parentId,
      });
      setComments((prev) => {
        if (parentId) {
          // Thêm reply vào comment cha
          return prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies || []), data] }
              : c,
          );
        }
        return [data, ...prev];
      });
      return data;
    },
    [diagramId],
  );

  const resolveComment = useCallback(
    async (commentId) => {
      await commentApi.resolveComment(diagramId, commentId);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, status: "RESOLVED" } : c,
        ),
      );
    },
    [diagramId],
  );

  const deleteComment = useCallback(
    async (commentId) => {
      await commentApi.deleteComment(diagramId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    },
    [diagramId],
  );

  // Nhận comment real-time từ WebSocket
  const onNewComment = useCallback((comment) => {
    setComments((prev) => {
      if (comment.parentId) {
        return prev.map((c) =>
          c.id === comment.parentId
            ? { ...c, replies: [...(c.replies || []), comment] }
            : c,
        );
      }
      // Tránh duplicate
      if (prev.find((c) => c.id === comment.id)) return prev;
      return [comment, ...prev];
    });
  }, []);

  return {
    comments,
    loading,
    fetchComments,
    addComment,
    resolveComment,
    deleteComment,
    onNewComment,
  };
}
