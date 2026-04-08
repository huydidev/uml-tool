// src/apps/workspace/hooks/useCollab.js
// Commit 8: Viết lại dùng @stomp/stompjs thay WebSocket plain

import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useDiagramStore } from '../../../shared/store/diagramStore';

const WS_URL = 'http://localhost:8080/ws';

// ── Convert API node format → ReactFlow format ────────────────────────
// Server trả về { id, label, x, y, width, height, attributes[] }
// ReactFlow cần  { id, type, position: {x,y}, data: {...} }
function apiNodesToFlow(apiNodes = [], viewMode = 'class') {
  return apiNodes.map(n => ({
    id:       n.id,
    type:     n.type || 'umlClass',
    position: { x: n.x ?? 0, y: n.y ?? 0 },
    width:    n.width,
    height:   n.height,
    data: {
      label:      n.label || 'TABLE',
      tableName:  (n.label || 'table').toLowerCase().replace(/[^a-z0-9]/g, '_'),
      tableId:    n.id,
      attributes: (n.attributes || []).map(a =>
        typeof a === 'string' ? a
          : `${a.isPK ? '+' : '-'} ${a.name}: ${(a.type || 'string').toLowerCase()}`
      ),
      methods:  [],
      viewMode,
    },
  }));
}

// ── Convert API edge format → ReactFlow format ────────────────────────
function apiEdgesToFlow(apiEdges = []) {
  return apiEdges.map(e => ({
    id:     e.id,
    source: e.from,
    target: e.to,
    type:   e.type || 'association',
    label:  e.label || '',
    data:   { cardinality: e.cardinality, points: e.points },
  }));
}

export function useCollab({ diagramId, enabled = true }) {
  const clientRef       = useRef(null);
  const isConnectedRef  = useRef(false);
  const heartbeatTimers = useRef({});
  const token    = localStorage.getItem('token');
  const userInfo = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();

  const store = useDiagramStore.getState;

  // ── Connect ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !diagramId || !token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,

      onConnect: () => {
        isConnectedRef.current = true;
        useDiagramStore.setState(s => ({ ...s, isCollabConnected: true }));

        // Subscribe topic chung của room
        client.subscribe(
          `/topic/diagram.${diagramId}`,
          (msg) => handleMessage(JSON.parse(msg.body))
        );

        // Subscribe queue riêng — nhận FULL_SYNC và LOCK_FAILED
        client.subscribe(
          `/user/queue/diagram.${diagramId}`,
          (msg) => handleMessage(JSON.parse(msg.body))
        );

        // Gửi JOIN_ROOM
        client.publish({
          destination: `/app/diagram.${diagramId}.join`,
          body: JSON.stringify({
            userName: userInfo?.name || userInfo?.email || 'Anonymous',
          }),
        });
      },

      onDisconnect: () => {
        isConnectedRef.current = false;
        useDiagramStore.setState(s => ({ ...s, isCollabConnected: false }));
        clearAllHeartbeats();
      },

      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers?.message);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (client.connected) {
        client.publish({
          destination: `/app/diagram.${diagramId}.leave`,
          body: JSON.stringify({}),
        });
      }
      clearAllHeartbeats();
      client.deactivate();
      isConnectedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagramId, enabled, token]);

  // ── Xử lý message từ server ────────────────────────────────────────
  const handleMessage = useCallback((event) => {
    switch (event.type) {

      case 'FULL_SYNC': {
        // Convert từ API format → ReactFlow format trước khi load
        const { nodes, edges, members, locks } = event.payload;
        const flowNodes = apiNodesToFlow(nodes || []);
        const flowEdges = apiEdgesToFlow(edges || []);
        store().loadDiagram(flowNodes, flowEdges);

        const onlineUsers = {};
        (members || []).forEach(m => { onlineUsers[m.userId] = m; });

        const lockedNodes = {};
        Object.entries(locks || {}).forEach(([nodeId, userId]) => {
          const member = (members || []).find(m => m.userId === userId);
          lockedNodes[nodeId] = { userId, color: member?.color || '#3b82f6' };
        });

        useDiagramStore.setState(s => ({ ...s, onlineUsers, lockedNodes }));
        break;
      }

      case 'STATE_UPDATE': {
        // Convert từ API format → ReactFlow format
        const { nodes, edges } = event.payload;
        if (nodes) store().setNodes(apiNodesToFlow(nodes));
        if (edges) store().setEdges(apiEdgesToFlow(edges));
        break;
      }

      case 'USER_JOIN': {
        const user = event.payload;
        useDiagramStore.setState(s => ({
          ...s,
          onlineUsers: { ...s.onlineUsers, [user.userId]: user },
        }));
        break;
      }

      case 'USER_LEAVE': {
        const { userId } = event.payload;
        useDiagramStore.setState(s => {
          const onlineUsers = { ...s.onlineUsers };
          const lockedNodes = { ...s.lockedNodes };
          delete onlineUsers[userId];
          Object.keys(lockedNodes).forEach(nodeId => {
            if (lockedNodes[nodeId]?.userId === userId) delete lockedNodes[nodeId];
          });
          return { ...s, onlineUsers, lockedNodes };
        });
        break;
      }

      case 'LOCK_ACQUIRED': {
        const { nodeId, userId, color } = event.payload;
        useDiagramStore.setState(s => ({
          ...s,
          lockedNodes: { ...s.lockedNodes, [nodeId]: { userId, color } },
        }));
        break;
      }

      case 'LOCK_RELEASED': {
        const { nodeId } = event.payload;
        useDiagramStore.setState(s => {
          const lockedNodes = { ...s.lockedNodes };
          delete lockedNodes[nodeId];
          return { ...s, lockedNodes };
        });
        break;
      }

      case 'LOCK_FAILED':
        console.warn('Lock failed:', event.payload?.nodeId);
        break;

      case 'CURSOR_MOVE': {
        const { userId, x, y } = event.payload;
        useDiagramStore.setState(s => ({
          ...s,
          onlineUsers: {
            ...s.onlineUsers,
            [userId]: { ...s.onlineUsers[userId], cursor: { x, y } },
          },
        }));
        break;
      }

      default:
        break;
    }
  }, [store]);

  // ── Broadcast STATE_UPDATE ─────────────────────────────────────────
  const broadcastState = useCallback((nodes, edges) => {
    if (!isConnectedRef.current || !clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: `/app/diagram.${diagramId}.state`,
      body: JSON.stringify({ nodes, edges }),
    });
  }, [diagramId]);

  // ── Acquire lock khi bắt đầu drag ────────────────────────────────
  const acquireLock = useCallback((nodeId) => {
    if (!isConnectedRef.current || !clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: `/app/diagram.${diagramId}.lock.acquire`,
      body: JSON.stringify({ nodeId }),
    });
    // Heartbeat mỗi 10s để giữ lock không bị TTL xóa
    heartbeatTimers.current[nodeId] = setInterval(() => {
      if (!isConnectedRef.current) return;
      clientRef.current?.publish({
        destination: `/app/diagram.${diagramId}.lock.heartbeat`,
        body: JSON.stringify({ nodeId }),
      });
    }, 10_000);
  }, [diagramId]);

  // ── Release lock khi thả node ─────────────────────────────────────
  const releaseLock = useCallback((nodeId) => {
    if (!isConnectedRef.current || !clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: `/app/diagram.${diagramId}.lock.release`,
      body: JSON.stringify({ nodeId }),
    });
    clearHeartbeat(nodeId);
  }, [diagramId]);

  // ── Broadcast cursor (throttle ở EditorCanvas) ───────────────────
  const broadcastCursor = useCallback((x, y) => {
    if (!isConnectedRef.current || !clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: `/app/diagram.${diagramId}.cursor`,
      body: JSON.stringify({ x, y }),
    });
  }, [diagramId]);

  const clearHeartbeat = (nodeId) => {
    clearInterval(heartbeatTimers.current[nodeId]);
    delete heartbeatTimers.current[nodeId];
  };

  const clearAllHeartbeats = () => {
    Object.keys(heartbeatTimers.current).forEach(clearHeartbeat);
  };

  return { broadcastState, acquireLock, releaseLock, broadcastCursor };
}