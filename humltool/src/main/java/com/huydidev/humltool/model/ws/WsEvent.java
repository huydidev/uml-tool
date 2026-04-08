package com.huydidev.humltool.model.ws;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

// ── Base event ────────────────────────────────────────────────────────
// Tất cả WS event đều có type để FE switch/case
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WsEvent {
    private String type;       // JOIN_ROOM, USER_JOIN, USER_LEAVE, STATE_UPDATE,
    // LOCK_ACQUIRED, LOCK_RELEASED, CURSOR_MOVE, ERROR
    private String userId;
    private String diagramId;
    private Object payload;    // tuỳ từng event type
}