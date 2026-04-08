package com.huydidev.humltool.controller;

import com.huydidev.humltool.model.ws.*;
import com.huydidev.humltool.service.DiagramService;
import com.huydidev.humltool.service.NodeLockService;
import com.huydidev.humltool.service.RoomService;
import com.huydidev.humltool.service.impl.RoomServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@Controller
public class DiagramRoomController {

    @Autowired private SimpMessagingTemplate   messagingTemplate;
    @Autowired private RoomServiceImpl         roomService;
    @Autowired private NodeLockService         nodeLockService;
    @Autowired private DiagramService          diagramService;

    // ── JOIN_ROOM ─────────────────────────────────────────────────────
    // FE gửi: /app/diagram.{id}.join
    // Server: thêm user vào room, gửi full state cho user mới,
    //         broadcast USER_JOIN cho tất cả còn lại
    @MessageMapping("/diagram.{diagramId}.join")
    public void handleJoin(
            @DestinationVariable String diagramId,
            @Payload Map<String, String> payload,
            SimpMessageHeaderAccessor headerAccessor,
            Principal principal
    ) {
        String userId   = principal.getName();
        String userName = payload.getOrDefault("userName", userId);

        // Thêm user vào room, assign màu
        UserPayload userInfo = roomService.joinRoom(diagramId, userId, userName);

        // Lưu diagramId vào session để dùng khi disconnect
        headerAccessor.getSessionAttributes().put("diagramId", diagramId);
        headerAccessor.getSessionAttributes().put("userId",    userId);

        // Gửi full diagram state + danh sách members cho user mới join
        try {
            var diagram = diagramService.getDiagramById(diagramId);
            var members = roomService.getOnlineUsers(diagramId);
            var locks   = nodeLockService.getActiveLocks(diagramId);

            messagingTemplate.convertAndSendToUser(
                    userId,
                    "/queue/diagram." + diagramId,
                    WsEvent.builder()
                            .type("FULL_SYNC")
                            .diagramId(diagramId)
                            .payload(Map.of(
                                    "nodes",   diagram.getNodes() != null ? diagram.getNodes() : List.of(),
                                    "edges",   diagram.getEdges() != null ? diagram.getEdges() : List.of(),
                                    "members", members,
                                    "locks",   locks
                            ))
                            .build()
            );
        } catch (Exception ignored) {}

        // Broadcast USER_JOIN cho tất cả trong room (trừ chính user vừa join)
        broadcastToRoom(diagramId, userId,
                WsEvent.builder()
                        .type("USER_JOIN")
                        .diagramId(diagramId)
                        .userId(userId)
                        .payload(userInfo)
                        .build()
        );
    }

    // ── STATE_UPDATE ──────────────────────────────────────────────────
    // FE gửi: /app/diagram.{id}.state
    // Server: broadcast state mới cho tất cả còn lại trong room
    @MessageMapping("/diagram.{diagramId}.state")
    public void handleStateUpdate(
            @DestinationVariable String diagramId,
            @Payload Map<String, Object> payload,
            Principal principal
    ) {
        String userId = principal.getName();

        broadcastToRoom(diagramId, userId,
                WsEvent.builder()
                        .type("STATE_UPDATE")
                        .diagramId(diagramId)
                        .userId(userId)
                        .payload(payload)
                        .build()
        );
    }

    // ── ACQUIRE_LOCK ──────────────────────────────────────────────────
    // FE gửi: /app/diagram.{id}.lock.acquire
    // Server: thử lock node, broadcast kết quả
    @MessageMapping("/diagram.{diagramId}.lock.acquire")
    public void handleAcquireLock(
            @DestinationVariable String diagramId,
            @Payload Map<String, String> payload,
            Principal principal
    ) {
        String userId = principal.getName();
        String nodeId = payload.get("nodeId");
        if (nodeId == null) return;

        boolean acquired = nodeLockService.acquireLock(diagramId, nodeId, userId);
        if (!acquired) {
            // Báo lại cho chính user biết lock thất bại
            messagingTemplate.convertAndSendToUser(
                    userId,
                    "/queue/diagram." + diagramId,
                    WsEvent.builder()
                            .type("LOCK_FAILED")
                            .diagramId(diagramId)
                            .payload(Map.of(
                                    "nodeId", nodeId,
                                    "owner",  nodeLockService.getLockOwner(diagramId, nodeId)
                            ))
                            .build()
            );
            return;
        }

        // Broadcast LOCK_ACQUIRED cho tất cả trong room
        String color = roomService.getUserColor(diagramId, userId);
        broadcastToRoomIncludingSelf(diagramId,
                WsEvent.builder()
                        .type("LOCK_ACQUIRED")
                        .diagramId(diagramId)
                        .userId(userId)
                        .payload(LockPayload.builder()
                                .nodeId(nodeId)
                                .userId(userId)
                                .color(color)
                                .build())
                        .build()
        );
    }

    // ── RELEASE_LOCK ──────────────────────────────────────────────────
    // FE gửi: /app/diagram.{id}.lock.release
    @MessageMapping("/diagram.{diagramId}.lock.release")
    public void handleReleaseLock(
            @DestinationVariable String diagramId,
            @Payload Map<String, String> payload,
            Principal principal
    ) {
        String nodeId = payload.get("nodeId");
        if (nodeId == null) return;

        nodeLockService.releaseLock(diagramId, nodeId);

        broadcastToRoomIncludingSelf(diagramId,
                WsEvent.builder()
                        .type("LOCK_RELEASED")
                        .diagramId(diagramId)
                        .payload(Map.of("nodeId", nodeId))
                        .build()
        );
    }

    // ── HEARTBEAT ─────────────────────────────────────────────────────
    // FE gửi: /app/diagram.{id}.lock.heartbeat mỗi 10s
    @MessageMapping("/diagram.{diagramId}.lock.heartbeat")
    public void handleHeartbeat(
            @DestinationVariable String diagramId,
            @Payload Map<String, String> payload,
            Principal principal
    ) {
        String userId = principal.getName();
        String nodeId = payload.get("nodeId");
        if (nodeId == null) return;

        nodeLockService.heartbeat(diagramId, nodeId, userId);
        roomService.refreshTTL(diagramId, userId);
    }

    // ── CURSOR_MOVE ───────────────────────────────────────────────────
    // FE gửi: /app/diagram.{id}.cursor (throttle 50ms ở FE)
    @MessageMapping("/diagram.{diagramId}.cursor")
    public void handleCursorMove(
            @DestinationVariable String diagramId,
            @Payload Map<String, Object> payload,
            Principal principal
    ) {
        String userId = principal.getName();

        broadcastToRoom(diagramId, userId,
                WsEvent.builder()
                        .type("CURSOR_MOVE")
                        .diagramId(diagramId)
                        .userId(userId)
                        .payload(CursorPayload.builder()
                                .userId(userId)
                                .x(toDouble(payload.get("x")))
                                .y(toDouble(payload.get("y")))
                                .build())
                        .build()
        );
    }

    // ── LEAVE_ROOM ────────────────────────────────────────────────────
    // FE gửi: /app/diagram.{id}.leave (khi navigate ra ngoài)
    @MessageMapping("/diagram.{diagramId}.leave")
    public void handleLeave(
            @DestinationVariable String diagramId,
            Principal principal
    ) {
        handleUserLeave(diagramId, principal.getName());
    }

    // ── SessionDisconnectEvent ────────────────────────────────────────
    // Spring tự trigger khi WebSocket mất kết nối đột ngột
    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor accessor =
                SimpMessageHeaderAccessor.wrap(event.getMessage());

        Map<String, Object> attrs = accessor.getSessionAttributes();
        if (attrs == null) return;

        String diagramId = (String) attrs.get("diagramId");
        String userId    = (String) attrs.get("userId");
        if (diagramId == null || userId == null) return;

        handleUserLeave(diagramId, userId);
    }

    // ── Helper: xử lý user rời room ──────────────────────────────────
    private void handleUserLeave(String diagramId, String userId) {
        // Release tất cả node locks của user
        nodeLockService.releaseAllLocks(diagramId, userId);

        // Xóa khỏi room
        roomService.leaveRoom(diagramId, userId);

        // Broadcast LOCK_RELEASED cho các node bị release
        // (FE tự biết reset lock UI khi nhận USER_LEAVE)
        broadcastToRoomIncludingSelf(diagramId,
                WsEvent.builder()
                        .type("USER_LEAVE")
                        .diagramId(diagramId)
                        .userId(userId)
                        .payload(Map.of("userId", userId))
                        .build()
        );
    }

    // ── Broadcast tới tất cả trong room TRỪ sender ───────────────────
    private void broadcastToRoom(String diagramId, String excludeUserId, WsEvent event) {
        messagingTemplate.convertAndSend(
                "/topic/diagram." + diagramId,
                event,
                Map.of("excludeUserId", excludeUserId)
        );
    }

    // ── Broadcast tới tất cả trong room KỂ CẢ sender ─────────────────
    private void broadcastToRoomIncludingSelf(String diagramId, WsEvent event) {
        messagingTemplate.convertAndSend("/topic/diagram." + diagramId, event);
    }

    private double toDouble(Object val) {
        if (val instanceof Number n) return n.doubleValue();
        return 0.0;
    }
}