package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.service.NodeLockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
public class NodeLockServiceImpl implements NodeLockService {

    // TTL cho lock node
    private static final Duration LOCK_TTL = Duration.ofSeconds(30);

    @Autowired
    private StringRedisTemplate redisTemplate;

    // ── Key helpers ───────────────────────────────────────────────────
    // lock:diagram:{diagramId}:node:{nodeId} → userId
    private String lockKey(String diagramId, String nodeId) {
        return "lock:diagram:" + diagramId + ":node:" + nodeId;
    }

    // lock:diagram:{diagramId}:node:* — prefix để scan tất cả lock của diagram
    private String lockPrefix(String diagramId) {
        return "lock:diagram:" + diagramId + ":node:*";
    }

    // ── Acquire lock ──────────────────────────────────────────────────
    // Dùng SET NX EX — atomic, tránh race condition
    @Override
    public boolean acquireLock(String diagramId, String nodeId, String userId) {
        String key = lockKey(diagramId, nodeId);

        // setIfAbsent = SET NX EX
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(key, userId, LOCK_TTL);

        if (Boolean.TRUE.equals(acquired)) return true;

        // Nếu đã bị lock, kiểm tra xem có phải chính user này không
        // (trường hợp user reconnect và acquire lại lock của mình)
        String currentOwner = redisTemplate.opsForValue().get(key);
        if (userId.equals(currentOwner)) {
            // Reset TTL
            redisTemplate.expire(key, LOCK_TTL);
            return true;
        }

        return false;
    }

    // ── Release lock 1 node ───────────────────────────────────────────
    @Override
    public void releaseLock(String diagramId, String nodeId) {
        redisTemplate.delete(lockKey(diagramId, nodeId));
    }

    // ── Release tất cả lock của 1 user trong diagram ──────────────────
    // Dùng khi user disconnect
    @Override
    public void releaseAllLocks(String diagramId, String userId) {
        Set<String> keys = redisTemplate.keys(lockPrefix(diagramId));
        if (keys == null || keys.isEmpty()) return;

        for (String key : keys) {
            String owner = redisTemplate.opsForValue().get(key);
            if (userId.equals(owner)) {
                redisTemplate.delete(key);
            }
        }
    }

    // ── Heartbeat — reset TTL ─────────────────────────────────────────
    // FE gọi mỗi 10s khi đang giữ node để tránh TTL tự expire
    @Override
    public void heartbeat(String diagramId, String nodeId, String userId) {
        String key   = lockKey(diagramId, nodeId);
        String owner = redisTemplate.opsForValue().get(key);

        // Chỉ reset TTL nếu đúng là owner
        if (userId.equals(owner)) {
            redisTemplate.expire(key, LOCK_TTL);
        }
    }

    // ── Lấy tất cả lock đang active: { nodeId -> userId } ─────────────
    @Override
    public Map<String, String> getActiveLocks(String diagramId) {
        Set<String> keys = redisTemplate.keys(lockPrefix(diagramId));
        Map<String, String> result = new HashMap<>();
        if (keys == null) return result;

        for (String key : keys) {
            String userId = redisTemplate.opsForValue().get(key);
            if (userId != null) {
                // Extract nodeId từ key: lock:diagram:{id}:node:{nodeId}
                String nodeId = key.substring(key.lastIndexOf(":node:") + 6);
                result.put(nodeId, userId);
            }
        }
        return result;
    }

    // ── Lấy owner của 1 node ──────────────────────────────────────────
    @Override
    public String getLockOwner(String diagramId, String nodeId) {
        return redisTemplate.opsForValue().get(lockKey(diagramId, nodeId));
    }
}