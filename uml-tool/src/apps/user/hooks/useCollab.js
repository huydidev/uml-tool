// src/apps/user/hooks/useCollab.js

import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = 'ws://localhost:8080/ws/diagram';

// Màu avatar cho từng thành viên
const MEMBER_COLORS = [
  '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
  '#10b981', '#ec4899', '#06b6d4', '#f97316',
];

export function useCollab({ roomId, nodes, edges, setNodes, setEdges }) {
  const wsRef                         = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [members, setMembers]         = useState([]); // danh sách người trong phòng
  const [myId]                        = useState(() => `user-${Date.now()}`);
  const isSyncingRef                  = useRef(false); // tránh loop khi apply event từ server

  // ── Kết nối WebSocket ──────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(`${WS_URL}/${roomId}?userId=${myId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Gửi join event
      send({ type: 'JOIN', userId: myId });
    };

    ws.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        handleIncoming(event);
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setMembers([]);
    };

    ws.onerror = (err) => {
      console.error('WS error:', err);
      setIsConnected(false);
    };

    return () => {
      send({ type: 'LEAVE', userId: myId });
      ws.close();
    };
  }, [roomId]);

  // ── Gửi event lên server ───────────────────────────────────────
  const send = useCallback((event) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ ...event, userId: myId, roomId }));
    }
  }, [myId, roomId]);

  // ── Xử lý event từ server ─────────────────────────────────────
  const handleIncoming = useCallback((event) => {
    // Bỏ qua event do chính mình gửi
    if (event.userId === myId) return;

    isSyncingRef.current = true;

    switch (event.type) {
      case 'MEMBERS_UPDATE':
        setMembers(event.members.map((m, i) => ({
          ...m,
          color: MEMBER_COLORS[i % MEMBER_COLORS.length],
        })));
        break;

      case 'NODE_MOVE':
        setNodes((nds) =>
          nds.map((n) =>
            n.id === event.nodeId
              ? { ...n, position: event.position }
              : n
          )
        );
        break;

      case 'NODE_UPDATE':
        setNodes((nds) =>
          nds.map((n) =>
            n.id === event.nodeId
              ? { ...n, data: { ...n.data, ...event.data } }
              : n
          )
        );
        break;

      case 'NODE_ADD':
        setNodes((nds) => {
          if (nds.find((n) => n.id === event.node.id)) return nds;
          return [...nds, event.node];
        });
        break;

      case 'NODE_DELETE':
        setNodes((nds) => nds.filter((n) => n.id !== event.nodeId));
        break;

      case 'EDGE_ADD':
        setEdges((eds) => {
          if (eds.find((e) => e.id === event.edge.id)) return eds;
          return [...eds, event.edge];
        });
        break;

      case 'EDGE_DELETE':
        setEdges((eds) => eds.filter((e) => e.id !== event.edgeId));
        break;

      case 'FULL_SYNC':
        // Server gửi toàn bộ state khi join phòng đã có người
        setNodes(event.nodes || []);
        setEdges(event.edges || []);
        break;

      default:
        break;
    }

    setTimeout(() => { isSyncingRef.current = false; }, 0);
  }, [myId, setNodes, setEdges]);

  // ── Các hàm broadcast (FE gọi khi có thay đổi) ────────────────
  const broadcastNodeMove = useCallback((nodeId, position) => {
    if (isSyncingRef.current) return;
    send({ type: 'NODE_MOVE', nodeId, position });
  }, [send]);

  const broadcastNodeUpdate = useCallback((nodeId, data) => {
    if (isSyncingRef.current) return;
    send({ type: 'NODE_UPDATE', nodeId, data });
  }, [send]);

  const broadcastNodeAdd = useCallback((node) => {
    if (isSyncingRef.current) return;
    send({ type: 'NODE_ADD', node });
  }, [send]);

  const broadcastNodeDelete = useCallback((nodeId) => {
    if (isSyncingRef.current) return;
    send({ type: 'NODE_DELETE', nodeId });
  }, [send]);

  const broadcastEdgeAdd = useCallback((edge) => {
    if (isSyncingRef.current) return;
    send({ type: 'EDGE_ADD', edge });
  }, [send]);

  const broadcastEdgeDelete = useCallback((edgeId) => {
    if (isSyncingRef.current) return;
    send({ type: 'EDGE_DELETE', edgeId });
  }, [send]);

  return {
    isConnected,
    members,
    myId,
    broadcastNodeMove,
    broadcastNodeUpdate,
    broadcastNodeAdd,
    broadcastNodeDelete,
    broadcastEdgeAdd,
    broadcastEdgeDelete,
  };
}