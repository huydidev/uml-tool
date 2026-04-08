package com.huydidev.humltool.service;

import java.util.Map;
import java.util.Set;

public interface NodeLockService {

    // Acquire lock — trả về true nếu lock thành công, false nếu đã bị lock bởi người khác
    boolean acquireLock(String diagramId, String nodeId, String userId);

    // Release lock của 1 node
    void releaseLock(String diagramId, String nodeId);

    // Release tất cả lock của 1 user trong 1 diagram (khi disconnect)
    void releaseAllLocks(String diagramId, String userId);

    // Heartbeat — reset TTL về 30s khi user đang giữ node
    void heartbeat(String diagramId, String nodeId, String userId);

    // Lấy toàn bộ lock đang active trong diagram: { nodeId -> userId }
    Map<String, String> getActiveLocks(String diagramId);

    // Lấy userId đang giữ node (null nếu không bị lock)
    String getLockOwner(String diagramId, String nodeId);
}